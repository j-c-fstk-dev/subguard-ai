from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, and_, extract
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json
import logging

from app.core.database import get_db, AsyncSession, SubscriptionDB, OptimizationDB, NegotiationDB
from app.models.activity import Activity as ActivityDB
from app.core.security import get_current_user
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)


class MonthlyReportResponse(BaseModel):
    # Resumo Executivo
    total_monthly_spend: float
    active_subscriptions: int
    total_savings: float
    negotiations_completed: int
    
    # Dados do mês
    month: str
    year: int
    
    # Breakdown por categoria
    spending_by_category: Dict[str, float]
    
    # Assinaturas ativas
    active_subscriptions_list: List[Dict]
    
    # Atividades do mês
    activities_summary: Dict[str, int]
    recent_activities: List[Dict]
    
    # Negociações
    negotiations_summary: Dict[str, Any]
    
    # Comparação com mês anterior
    previous_month_comparison: Optional[Dict] = None


@router.get("/monthly", response_model=MonthlyReportResponse)
async def get_monthly_report(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate monthly report for user"""
    try:
        # Se não passar mês/ano, usa o atual
        now = datetime.now()
        target_month = month or now.month
        target_year = year or now.year
        
        # Período do relatório
        month_start = datetime(target_year, target_month, 1)
        if target_month == 12:
            month_end = datetime(target_year + 1, 1, 1)
        else:
            month_end = datetime(target_year, target_month + 1, 1)
        
        # 1. ASSINATURAS ATIVAS
        result = await db.execute(
            select(SubscriptionDB).where(
                and_(
                    SubscriptionDB.user_id == current_user.id,
                    SubscriptionDB.status == 'active'
                )
            )
        )
        active_subs = result.scalars().all()
        
        total_monthly_spend = sum(sub.monthly_cost for sub in active_subs)
        
        # Breakdown por categoria
        spending_by_category = {}
        for sub in active_subs:
            category = sub.service_category
            spending_by_category[category] = spending_by_category.get(category, 0) + sub.monthly_cost
        
        # Lista de assinaturas
        active_subs_list = [
            {
                "id": str(sub.id),
                "service_name": sub.service_name,
                "plan_name": sub.plan_name,
                "monthly_cost": sub.monthly_cost,
                "category": sub.service_category,
                "status": sub.status
            }
            for sub in active_subs
        ]
        
        # 2. ATIVIDADES DO MÊS
        activities_result = await db.execute(
            select(ActivityDB).where(
                and_(
                    ActivityDB.user_id == current_user.id,
                    ActivityDB.created_at >= month_start,
                    ActivityDB.created_at < month_end
                )
            ).order_by(ActivityDB.created_at.desc())
        )
        activities = activities_result.scalars().all()
        
        # Contar por tipo
        activities_summary = {}
        for act in activities:
            act_type = act.activity_type
            activities_summary[act_type] = activities_summary.get(act_type, 0) + 1
        
        # Últimas 10 atividades
        recent_activities = [
            {
                "id": str(act.id),
                "type": act.activity_type,
                "title": act.title,
                "description": act.description,
                "created_at": act.created_at.isoformat()
            }
            for act in activities[:10]
        ]
        
        # 3. NEGOCIAÇÕES DO MÊS
        negotiations_result = await db.execute(
            select(NegotiationDB).where(
                and_(
                    NegotiationDB.user_id == current_user.id,
                    NegotiationDB.created_at >= month_start,
                    NegotiationDB.created_at < month_end
                )
            )
        )
        negotiations = negotiations_result.scalars().all()
        
        total_savings = 0
        completed_negotiations = 0
        
        for neg in negotiations:
            if neg.offer_accepted and neg.final_offer:
                try:
                    final_offer = json.loads(neg.final_offer) if isinstance(neg.final_offer, str) else neg.final_offer
                    total_savings += final_offer.get('savings', 0)
                    completed_negotiations += 1
                except:
                    pass
        
        negotiations_summary = {
            "total": len(negotiations),
            "completed": completed_negotiations,
            "in_progress": len([n for n in negotiations if n.status == 'in_progress']),
            "total_savings": total_savings
        }
        
        # 4. COMPARAÇÃO COM MÊS ANTERIOR
        previous_month_comparison = None
        if target_month > 1:
            prev_month = target_month - 1
            prev_year = target_year
        else:
            prev_month = 12
            prev_year = target_year - 1
        
        prev_start = datetime(prev_year, prev_month, 1)
        prev_end = datetime(target_year, target_month, 1)
        
        # Assinaturas do mês anterior
        prev_subs_result = await db.execute(
            select(SubscriptionDB).where(
                and_(
                    SubscriptionDB.user_id == current_user.id,
                    SubscriptionDB.status == 'active',
                    SubscriptionDB.created_at < prev_end
                )
            )
        )
        prev_subs = prev_subs_result.scalars().all()
        prev_total_spend = sum(sub.monthly_cost for sub in prev_subs)
        
        previous_month_comparison = {
            "previous_month": prev_month,
            "previous_year": prev_year,
            "previous_spend": prev_total_spend,
            "spend_change": total_monthly_spend - prev_total_spend,
            "spend_change_percent": ((total_monthly_spend - prev_total_spend) / prev_total_spend * 100) if prev_total_spend > 0 else 0
        }
        
        # Registrar activity de geração de relatório
        import uuid
        activity_id = str(uuid.uuid4())
        activity = ActivityDB(
            id=activity_id,
            user_id=current_user.id,
            activity_type='report_generated',
            title=f'Monthly Report Generated',
            description=f'Generated report for {month_start.strftime("%B %Y")} - ${total_monthly_spend:.2f} total spend, {len(active_subs)} active subscriptions',
            created_at=datetime.now(),
            read=0
        )
        db.add(activity)
        await db.commit()

        return MonthlyReportResponse(
            total_monthly_spend=round(total_monthly_spend, 2),
            active_subscriptions=len(active_subs),
            total_savings=round(total_savings, 2),
            negotiations_completed=completed_negotiations,
            month=month_start.strftime("%B"),
            year=target_year,
            spending_by_category=spending_by_category,
            active_subscriptions_list=active_subs_list,
            activities_summary=activities_summary,
            recent_activities=recent_activities,
            negotiations_summary=negotiations_summary,
            previous_month_comparison=previous_month_comparison
        )
        
    except Exception as e:
        logger.error(f"Error generating monthly report: {e}")
        raise HTTPException(status_code=500, detail=str(e))
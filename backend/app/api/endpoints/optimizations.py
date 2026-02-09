from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Optional
import logging

from app.core.database import get_db, AsyncSession
from app.core.security import get_current_user
from app.models.schemas import (
    OptimizationRecommendation,
    OptimizationRecommendationCreate,
    DashboardSummary,
    MonthlyTrend
)
from app.services.optimizer import SubscriptionOptimizer

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[OptimizationRecommendation])
async def get_optimizations(
    status: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all optimization recommendations for user"""
    try:
        from sqlalchemy import select
        from app.core.database import OptimizationDB
        
        query = select(OptimizationDB).where(
            OptimizationDB.user_id == current_user.id
        )
        
        if status:
            if status == "pending":
                query = query.where(OptimizationDB.executed == False)
            elif status == "executed":
                query = query.where(OptimizationDB.executed == True)
        
        result = await db.execute(query)
        optimizations = result.scalars().all()
        
        return [
            OptimizationRecommendation(
                id=opt.id,
                subscription_id=opt.subscription_id,
                user_id=opt.user_id,
                action_type=opt.action_type,
                current_plan=opt.current_plan,
                recommended_plan=opt.recommended_plan,
                current_cost=opt.current_cost,
                new_cost=opt.new_cost,
                monthly_savings=opt.monthly_savings,
                yearly_savings=opt.yearly_savings,
                confidence_score=opt.confidence_score,
                reasoning=opt.reasoning,
                steps_required=opt.steps_required or [],
                estimated_time_minutes=opt.estimated_time_minutes,
                presented_to_user=opt.presented_to_user,
                user_feedback=opt.user_feedback,
                executed=opt.executed,
                execution_date=opt.execution_date,
                actual_savings=opt.actual_savings,
                notes=opt.notes,
                created_at=opt.created_at,
                updated_at=opt.updated_at
            )
            for opt in optimizations
        ]
        
    except Exception as e:
        logger.error(f"Error fetching optimizations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{optimization_id}/execute")
async def execute_optimization(
    optimization_id: str,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Execute an optimization recommendation"""
    try:
        from sqlalchemy import select, update
        from app.core.database import OptimizationDB, SubscriptionDB
        from datetime import datetime
        
        # Get optimization
        result = await db.execute(
            select(OptimizationDB).where(
                OptimizationDB.id == optimization_id,
                OptimizationDB.user_id == current_user.id
            )
        )
        optimization = result.scalar_one_or_none()
        
        if not optimization:
            raise HTTPException(status_code=404, detail="Optimization not found")
        
        if optimization.executed:
            raise HTTPException(status_code=400, detail="Optimization already executed")
        
        # Get associated subscription
        sub_result = await db.execute(
            select(SubscriptionDB).where(
                SubscriptionDB.id == optimization.subscription_id
            )
        )
        subscription = sub_result.scalar_one_or_none()
        
        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")
        
        # Execute based on action type
        action_result = await _execute_optimization_action(
            optimization, 
            subscription,
            db,
            str(current_user.id)
        )
        
        # Update optimization record
        await db.execute(
            update(OptimizationDB)
            .where(OptimizationDB.id == optimization_id)
            .values(
                executed=True,
                execution_date=datetime.utcnow(),
                actual_savings=action_result.get("savings_achieved"),
                notes=action_result.get("notes"),
                user_feedback="accepted"
            )
        )
        
        # Update subscription if needed
        if optimization.action_type in ["cancel", "downgrade", "switch"]:
            await db.execute(
                update(SubscriptionDB)
                .where(SubscriptionDB.id == subscription.id)
                .values(
                    status="cancelled" if optimization.action_type == "cancel" else "active",
                    plan_name=optimization.recommended_plan,
                    monthly_cost=optimization.new_cost,
                    updated_at=datetime.utcnow()
                )
            )
        
        await db.commit()
        
        # Background task to update user statistics
        background_tasks.add_task(
            update_user_stats,
            current_user.id,
            optimization.monthly_savings,
            db
        )
        
        return {
            "success": True,
            "message": f"Optimization executed: {optimization.action_type}",
            "savings_achieved": action_result.get("savings_achieved"),
            "next_steps": action_result.get("next_steps", [])
        }
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Error executing optimization: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results")
async def get_optimization_results(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get optimization results and statistics"""
    try:
        from sqlalchemy import select, func
        from app.core.database import OptimizationDB
        
        # Total optimizations
        total_result = await db.execute(
            select(func.count(OptimizationDB.id))
            .where(OptimizationDB.user_id == current_user.id)
        )
        total = total_result.scalar() or 0
        
        # Executed optimizations
        executed_result = await db.execute(
            select(func.count(OptimizationDB.id))
            .where(
                OptimizationDB.user_id == current_user.id,
                OptimizationDB.executed == True
            )
        )
        executed = executed_result.scalar() or 0
        
        # Total savings
        savings_result = await db.execute(
            select(func.coalesce(func.sum(OptimizationDB.monthly_savings), 0))
            .where(
                OptimizationDB.user_id == current_user.id,
                OptimizationDB.executed == True
            )
        )
        monthly_savings = savings_result.scalar() or 0
        
        # Recent optimizations
        recent_result = await db.execute(
            select(OptimizationDB)
            .where(OptimizationDB.user_id == current_user.id)
            .order_by(OptimizationDB.created_at.desc())
            .limit(5)
        )
        recent = recent_result.scalars().all()
        
        return {
            "total_optimizations": total,
            "executed_optimizations": executed,
            "monthly_savings": monthly_savings,
            "yearly_savings": monthly_savings * 12,
            "success_rate": (executed / total * 100) if total > 0 else 0,
            "recent_optimizations": [
                {
                    "id": opt.id,
                    "service": "Unknown",  # Would join with subscriptions
                    "action": opt.action_type,
                    "savings": opt.monthly_savings,
                    "date": opt.created_at.isoformat()
                }
                for opt in recent
            ]
        }
        
    except Exception as e:
        logger.error(f"Error fetching optimization results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard summary"""
    try:
        from sqlalchemy import select, func
        from app.core.database import SubscriptionDB, OptimizationDB
        from datetime import datetime, timedelta
        
        # Total monthly spend
        spend_result = await db.execute(
            select(func.coalesce(func.sum(SubscriptionDB.monthly_cost), 0))
            .where(
                SubscriptionDB.user_id == current_user.id,
                SubscriptionDB.status == "active"
            )
        )
        total_monthly_spend = spend_result.scalar() or 0
        
        # Total subscriptions
        subs_result = await db.execute(
            select(func.count(SubscriptionDB.id))
            .where(
                SubscriptionDB.user_id == current_user.id,
                SubscriptionDB.status == "active"
            )
        )
        total_subscriptions = subs_result.scalar() or 0
        
        # Potential savings from pending optimizations
        savings_result = await db.execute(
            select(func.coalesce(func.sum(OptimizationDB.monthly_savings), 0))
            .where(
                OptimizationDB.user_id == current_user.id,
                OptimizationDB.executed == False
            )
        )
        potential_savings = savings_result.scalar() or 0
        
        # Completed optimizations
        completed_result = await db.execute(
            select(func.count(OptimizationDB.id))
            .where(
                OptimizationDB.user_id == current_user.id,
                OptimizationDB.executed == True
            )
        )
        optimizations_completed = completed_result.scalar() or 0
        
        # Recent activity
        activity_result = await db.execute(
            select(OptimizationDB)
            .where(OptimizationDB.user_id == current_user.id)
            .order_by(OptimizationDB.created_at.desc())
            .limit(10)
        )
        recent_activity = [
            {
                "id": opt.id,
                "action": opt.action_type,
                "savings": opt.monthly_savings,
                "date": opt.created_at.isoformat(),
                "executed": opt.executed
            }
            for opt in activity_result.scalars().all()
        ]
        
        return DashboardSummary(
            total_monthly_spend=total_monthly_spend,
            total_subscriptions=total_subscriptions,
            potential_savings=potential_savings,
            optimizations_completed=optimizations_completed,
            recent_activity=recent_activity
        )
        
    except Exception as e:
        logger.error(f"Error fetching dashboard summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/trends", response_model=List[MonthlyTrend])
async def get_monthly_trends(
    months: int = 6,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get monthly spending trends"""
    # For MVP, return mock data
    # In production, would query historical data
    
    import random
    from datetime import datetime, timedelta
    
    trends = []
    base_date = datetime.utcnow()
    
    for i in range(months, 0, -1):
        month_date = base_date - timedelta(days=30*i)
        month_str = month_date.strftime("%b %Y")
        
        # Mock data
        base_spend = 500 + random.uniform(-100, 100)
        base_savings = 100 + random.uniform(-30, 30)
        
        trends.append(MonthlyTrend(
            month=month_str,
            spend=round(base_spend, 2),
            savings=round(base_savings, 2),
            subscriptions=random.randint(10, 15)
        ))
    
    return trends

async def _execute_optimization_action(optimization, subscription, db: AsyncSession, user_id: str):
    """Execute specific optimization action"""
    
    action_handlers = {
        "cancel": _execute_cancel,
        "downgrade": _execute_downgrade,
        "switch": _execute_switch,
        "bundle": _execute_bundle,
        "negotiate": _execute_negotiate
    }
    
    handler = action_handlers.get(optimization.action_type)
    if not handler:
        return {"success": False, "message": "Unknown action type"}
    
    return await handler(optimization, subscription, db, user_id)

async def _execute_cancel(optimization, subscription, db: AsyncSession, user_id: str):
    """Execute cancellation"""
    # In production, would integrate with service APIs
    # For MVP, simulate success
    
    return {
        "success": True,
        "message": f"Cancelled {subscription.service_name}",
        "savings_achieved": optimization.monthly_savings,
        "next_steps": [
            "Check your email for cancellation confirmation",
            "Update payment methods if needed"
        ],
        "notes": f"Cancelled via SubGuard AI on {datetime.utcnow().date()}"
    }

async def _execute_downgrade(optimization, subscription, db: AsyncSession, user_id: str):
    """Execute plan downgrade"""
    
    return {
        "success": True,
        "message": f"Downgraded {subscription.service_name} to {optimization.recommended_plan}",
        "savings_achieved": optimization.monthly_savings,
        "next_steps": [
            "Check your account for plan confirmation",
            "Review new plan features"
        ],
        "notes": f"Downgraded from {optimization.current_plan} to {optimization.recommended_plan}"
    }

async def _execute_switch(optimization, subscription, db: AsyncSession, user_id: str):
    """Execute service switch"""
    
    return {
        "success": True,
        "message": f"Switched from {subscription.service_name}",
        "savings_achieved": optimization.monthly_savings,
        "next_steps": [
            f"Sign up for {optimization.recommended_plan}",
            "Cancel old service if not auto-cancelled"
        ],
        "notes": f"Service switch recommendation executed"
    }

async def _execute_bundle(optimization, subscription, db: AsyncSession, user_id: str):
    """Execute bundling"""
    
    return {
        "success": True,
        "message": f"Bundled {subscription.service_name}",
        "savings_achieved": optimization.monthly_savings * 0.8,  # Estimated
        "next_steps": [
            "Check bundle eligibility",
            "Contact service provider for bundle options"
        ],
        "notes": "Bundle opportunity identified"
    }

async def _execute_negotiate(optimization, subscription, db: AsyncSession, user_id: str):
    """Execute negotiation - creates negotiation record instead of completing it"""
    import uuid
    from app.core.database import NegotiationDB, Activity
    
    try:
        # Create negotiation record
        negotiation_id = str(uuid.uuid4())
        negotiation = NegotiationDB(
            id=negotiation_id,
            optimization_id=optimization.id,
            subscription_id=optimization.subscription_id,
            user_id=user_id,
            provider_name=subscription.service_name,
            current_plan=optimization.current_plan,
            proposed_savings=optimization.monthly_savings,
            messages=[{
                "role": "provider",
                "content": f"Olá! Recebemos sua solicitação de negociação. Vi que você é cliente desde {(datetime.utcnow() - timedelta(days=365)).strftime('%B de %Y')}. Qual desconto você gostaria de solicitar?",
                "timestamp": datetime.utcnow().isoformat()
            }],
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        
        db.add(negotiation)
        await db.commit()
        
        # Log activity
        activity = Activity(
            id=str(uuid.uuid4()),
            user_id=user_id,
            activity_type="negotiation_created",
            title=f"Negotiation started for {subscription.service_name}",
            description=f"Created negotiation with potential savings of R$ {optimization.monthly_savings:.2f}",
            meta_data=str({
                "negotiation_id": negotiation_id,
                "subscription_id": optimization.subscription_id,
                "provider": subscription.service_name,
                "proposed_savings": optimization.monthly_savings
            }),
            read=0
        )
        db.add(activity)
        await db.commit()
        
        return {
            "success": True,
            "message": f"Negotiation started for {subscription.service_name}",
            "negotiation_id": negotiation_id,
            "next_steps": [
                "Go to Negotiations page to chat with provider",
                "Review and accept/reject the offer"
            ],
            "notes": f"Negotiation initiated on {datetime.utcnow().date()}"
        }
    except Exception as e:
        logger.error(f"Error executing negotiation: {e}")
        return {
            "success": False,
            "message": f"Error creating negotiation: {str(e)}"
        }

async def update_user_stats(user_id: str, savings: float, db: AsyncSession):
    """Background task to update user statistics"""
    try:
        from sqlalchemy import update
        from app.core.database import UserDB
        
        await db.execute(
            update(UserDB)
            .where(UserDB.id == user_id)
            .values(
                total_savings_to_date=UserDB.total_savings_to_date + savings,
                optimizations_completed=UserDB.optimizations_completed + 1,
                updated_at=datetime.utcnow()
            )
        )
        await db.commit()
        
    except Exception as e:
        logger.error(f"Error updating user stats: {e}")
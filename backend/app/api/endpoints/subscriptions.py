from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Optional
import logging
from sqlalchemy import select

from app.services.email_parser import EmailParser
from app.services.bank_analyzer import BankAnalyzer
from app.services.optimizer import SubscriptionOptimizer
from app.models.schemas import (
    Subscription, SubscriptionCreate, SubscriptionUpdate,
    SubscriptionAnalysis, OptimizationRecommendation
)
from app.core.database import get_db, AsyncSession, SubscriptionDB
from app.core.security import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/detect/email", response_model=List[Subscription])
async def detect_subscriptions_from_email(
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Detect subscriptions from user's email"""
    try:
        parser = EmailParser()
        subscriptions = await parser.analyze_user_email(current_user.id)
        
        for sub_data in subscriptions:
            existing = await db.execute(
                select(SubscriptionDB).where(
                    SubscriptionDB.user_id == current_user.id,
                    SubscriptionDB.service_name == sub_data["service_name"]
                )
            )
            if not existing.scalar_one_or_none():
                subscription = SubscriptionDB(
                    user_id=current_user.id,
                    **sub_data
                )
                db.add(subscription)
        
        await db.commit()
        
        background_tasks.add_task(
            analyze_subscriptions_async,
            current_user.id,
            db
        )
        
        return subscriptions
        
    except Exception as e:
        logger.error(f"Error detecting subscriptions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Subscription])
async def get_subscriptions(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all user subscriptions"""
    result = await db.execute(
        select(SubscriptionDB).where(SubscriptionDB.user_id == current_user.id)
    )
    subscriptions = result.scalars().all()
    
    return [
        Subscription(
            id=str(sub.id),
            user_id=str(sub.user_id),
            service_name=sub.service_name,
            service_category=sub.service_category,
            plan_name=sub.plan_name,
            monthly_cost=sub.monthly_cost,
            billing_cycle=sub.billing_cycle,
            status=sub.status,
            detection_source=sub.detection_source,
            start_date=sub.start_date.isoformat() if sub.start_date else "",
            next_billing_date=sub.next_billing_date.isoformat() if sub.next_billing_date else None,
            last_used_date=sub.last_used_date.isoformat() if sub.last_used_date else None,
            confidence_score=sub.confidence_score or 0.0,
            notes=sub.notes,
            usage_frequency=None,
            estimated_value_score=None,
            metadata={},
            created_at=sub.created_at.isoformat() if sub.created_at else "",
            updated_at=sub.updated_at.isoformat() if sub.updated_at else ""
        )
        for sub in subscriptions
    ]

@router.get("/{subscription_id}", response_model=Subscription)
async def get_subscription(
    subscription_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific subscription"""
    result = await db.execute(
        select(SubscriptionDB).where(SubscriptionDB.id == subscription_id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription or subscription.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    return Subscription(
        id=str(subscription.id),
        user_id=str(subscription.user_id),
        service_name=subscription.service_name,
        service_category=subscription.service_category,
        plan_name=subscription.plan_name,
        monthly_cost=subscription.monthly_cost,
        billing_cycle=subscription.billing_cycle,
        status=subscription.status,
        detection_source=subscription.detection_source,
        start_date=subscription.start_date.isoformat() if subscription.start_date else "",
        next_billing_date=subscription.next_billing_date.isoformat() if subscription.next_billing_date else None,
        last_used_date=subscription.last_used_date.isoformat() if subscription.last_used_date else None,
        confidence_score=subscription.confidence_score or 0.0,
        notes=subscription.notes,
        usage_frequency=None,
        estimated_value_score=None,
        metadata={},
        created_at=subscription.created_at.isoformat() if subscription.created_at else "",
        updated_at=subscription.updated_at.isoformat() if subscription.updated_at else ""
    )

@router.get("/{subscription_id}/analyze", response_model=SubscriptionAnalysis)
async def analyze_subscription(
    subscription_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Analyze subscription for optimization opportunities"""
    result = await db.execute(
        select(SubscriptionDB).where(SubscriptionDB.id == subscription_id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription or subscription.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    optimizer = SubscriptionOptimizer()
    analysis = await optimizer.analyze(subscription)
    
    return analysis

@router.post("/{subscription_id}/optimize", response_model=OptimizationRecommendation)
async def optimize_subscription(
    subscription_id: str,
    action: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Execute optimization action on subscription"""
    result = await db.execute(
        select(SubscriptionDB).where(SubscriptionDB.id == subscription_id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription or subscription.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    optimizer = SubscriptionOptimizer()
    recommendation = await optimizer.get_recommendation(subscription, action)
    
    return recommendation

async def analyze_subscriptions_async(user_id: str, db: AsyncSession):
    """Background task to analyze all subscriptions"""
    try:
        result = await db.execute(
            select(SubscriptionDB).where(SubscriptionDB.user_id == user_id)
        )
        subscriptions = result.scalars().all()
        
        optimizer = SubscriptionOptimizer()
        
        for subscription in subscriptions:
            analysis = await optimizer.analyze(subscription)
            recommendations = await optimizer.generate_recommendations(
                subscription, 
                analysis
            )
                
    except Exception as e:
        logger.error(f"Error in background analysis: {e}")

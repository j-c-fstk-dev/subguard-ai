from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Optional
import logging
from sqlalchemy import select

from app.services.email_parser import EmailParser
from app.services.bank_analyzer import BankAnalyzer
from app.services.optimizer import SubscriptionOptimizer
from app.models.schemas import (
    Subscription, SubscriptionCreate, SubscriptionUpdate,
    SubscriptionAnalysis, OptimizationRecommendation,
    ApplyRecommendationRequest, ApplyRecommendationResponse
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

@router.post("/{subscription_id}/analyze")
async def analyze_subscription(
    subscription_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Analyze subscription with AI"""
    from app.services.ai_analyzer import ai_analyzer
    from datetime import datetime
    
    result = await db.execute(
        select(SubscriptionDB).where(SubscriptionDB.id == subscription_id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription or subscription.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Converte para dict
    sub_dict = {
        'service_name': subscription.service_name,
        'plan_name': subscription.plan_name,
        'monthly_cost': subscription.monthly_cost,
        'service_category': subscription.service_category,
        'last_used_date': subscription.last_used_date.isoformat() if subscription.last_used_date else None,
    }
    
    # Análise IA
    analysis = await ai_analyzer.analyze_subscription(sub_dict)
    
    return {
        "subscription_id": str(subscription_id),
        "service_name": subscription.service_name,
        "analysis": analysis,
        "timestamp": datetime.now().isoformat()
    }

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


@router.post("/", response_model=Subscription)
async def create_subscription_endpoint(
    subscription_data: SubscriptionCreate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new subscription"""
    try:
        from datetime import datetime
        
        new_subscription = SubscriptionDB(
            user_id=current_user.id,
            service_name=subscription_data.service_name,
            plan_name=subscription_data.plan_name,
            monthly_cost=subscription_data.monthly_cost,
            billing_cycle=subscription_data.billing_cycle,
            service_category=subscription_data.service_category,
            status=subscription_data.status or 'active',
            detection_source=subscription_data.detection_source or 'manual',
            notes=subscription_data.notes,
            start_date=subscription_data.start_date or datetime.now(),
            next_billing_date=subscription_data.next_billing_date,
            confidence_score=100.0,
        )
        
        db.add(new_subscription)
        await db.commit()
        await db.refresh(new_subscription)
        
        return Subscription(
            id=str(new_subscription.id),
            user_id=str(new_subscription.user_id),
            service_name=new_subscription.service_name,
            service_category=new_subscription.service_category,
            plan_name=new_subscription.plan_name,
            monthly_cost=new_subscription.monthly_cost,
            billing_cycle=new_subscription.billing_cycle,
            status=new_subscription.status,
            detection_source=new_subscription.detection_source,
            start_date=new_subscription.start_date.isoformat() if new_subscription.start_date else "",
            next_billing_date=new_subscription.next_billing_date.isoformat() if new_subscription.next_billing_date else None,
            last_used_date=new_subscription.last_used_date.isoformat() if new_subscription.last_used_date else None,
            confidence_score=new_subscription.confidence_score or 0.0,
            notes=new_subscription.notes,
            usage_frequency=None,
            estimated_value_score=None,
            metadata={},
            created_at=new_subscription.created_at.isoformat() if new_subscription.created_at else "",
            updated_at=new_subscription.updated_at.isoformat() if new_subscription.updated_at else ""
        )
    except Exception as e:
        logger.error(f"Error creating subscription: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{subscription_id}", response_model=Subscription)
async def update_subscription_endpoint(
    subscription_id: str,
    subscription_data: SubscriptionUpdate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a subscription"""
    result = await db.execute(
        select(SubscriptionDB).where(SubscriptionDB.id == subscription_id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription or subscription.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Update fields
    for field, value in subscription_data.dict(exclude_unset=True).items():
        setattr(subscription, field, value)
    
    await db.commit()
    await db.refresh(subscription)
    
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


@router.delete("/{subscription_id}")
async def delete_subscription_endpoint(
    subscription_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a subscription"""
    result = await db.execute(
        select(SubscriptionDB).where(SubscriptionDB.id == subscription_id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription or subscription.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    await db.delete(subscription)
    await db.commit()
    
    return {"success": True, "message": "Subscription deleted"}

@router.post("/{subscription_id}/apply-recommendation")
async def apply_recommendation(
    subscription_id: str,
    action_data: dict,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Apply AI recommendation to subscription"""
    from datetime import datetime
    
    result = await db.execute(
        select(SubscriptionDB).where(SubscriptionDB.id == subscription_id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription or subscription.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    action = action_data.get("action")
    message = ""
    
    if action == "cancel":
        subscription.status = "cancelled"
        message = f"✅ {subscription.service_name} marked as cancelled"
        
    elif action == "downgrade":
        old_cost = subscription.monthly_cost
        subscription.plan_name = action_data.get("suggested_plan", subscription.plan_name)
        subscription.monthly_cost = action_data.get("new_cost", subscription.monthly_cost)
        message = f"✅ {subscription.service_name} updated to {subscription.plan_name}"
        
    elif action == "negotiate":
        subscription.notes = f"Negotiation pending - Target: {action_data.get('savings', 0):.2f} savings"
        message = f"💬 Negotiation task created for {subscription.service_name}"
        
    else:  # keep
        message = f"✅ Keeping {subscription.service_name} as is"
    
    await db.commit()
    await db.refresh(subscription)
    
    return {
        "success": True,
        "action": action,
        "message": message,
        "new_monthly_cost": subscription.monthly_cost,
        "savings": action_data.get("savings", 0)
    }   
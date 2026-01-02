from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Optional
import logging

from app.services.email_parser import EmailParser
from app.services.bank_analyzer import BankAnalyzer
from app.services.optimizer import SubscriptionOptimizer
from app.models.schemas import (
    Subscription, SubscriptionCreate, SubscriptionUpdate,
    SubscriptionAnalysis, OptimizationRecommendation
)
from app.core.database import get_db, AsyncSession
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
        
        # Store in database
        for sub_data in subscriptions:
            # Check if subscription already exists
            existing = await db.get_subscription_by_service(
                current_user.id, 
                sub_data["service_name"]
            )
            
            if not existing:
                subscription = SubscriptionCreate(
                    user_id=current_user.id,
                    **sub_data
                )
                await db.create_subscription(subscription)
        
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
    return await db.get_user_subscriptions(current_user.id)

@router.get("/{subscription_id}", response_model=Subscription)
async def get_subscription(
    subscription_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific subscription"""
    subscription = await db.get_subscription(subscription_id)
    if not subscription or subscription.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return subscription

@router.get("/{subscription_id}/analyze", response_model=SubscriptionAnalysis)
async def analyze_subscription(
    subscription_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Analyze subscription for optimization opportunities"""
    subscription = await db.get_subscription(subscription_id)
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
    subscription = await db.get_subscription(subscription_id)
    if not subscription or subscription.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Get optimization recommendation
    optimizer = SubscriptionOptimizer()
    recommendation = await optimizer.get_recommendation(subscription, action)
    
    # Store recommendation
    await db.create_optimization_recommendation(recommendation)
    
    return recommendation

async def analyze_subscriptions_async(user_id: str, db: AsyncSession):
    """Background task to analyze all subscriptions"""
    try:
        subscriptions = await db.get_user_subscriptions(user_id)
        optimizer = SubscriptionOptimizer()
        
        for subscription in subscriptions:
            analysis = await optimizer.analyze(subscription)
            await db.update_subscription_analysis(
                subscription.id, 
                analysis
            )
            
            # Generate recommendations
            recommendations = await optimizer.generate_recommendations(
                subscription, 
                analysis
            )
            
            for rec in recommendations:
                await db.create_optimization_recommendation(rec)
                
    except Exception as e:
        logger.error(f"Error in background analysis: {e}")
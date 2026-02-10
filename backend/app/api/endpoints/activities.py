from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from app.core.database import get_db
from app.models.activity import Activity
from app.models.schemas import ActivityCreate, ActivityResponse
from app.api.deps import get_current_user
from app.core.database import UserDB as User

router = APIRouter()

@router.get("/")
async def get_activities(
    limit: int = 10,
    skip: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user activities (newest first)"""
    stmt = select(Activity).filter(
        Activity.user_id == str(current_user.id),
    ).order_by(Activity.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    activities = result.scalars().all()
    
    return [
        {
            "id": activity.id,
            "user_id": activity.user_id,
            "activity_type": activity.activity_type,
            "title": activity.title,
            "description": activity.description,
            "meta_data": activity.meta_data,
            "created_at": activity.created_at.isoformat() if activity.created_at else None,
            "read": activity.read
        }
        for activity in activities
    ]

@router.post("/", response_model=ActivityResponse)
async def create_activity(
    activity: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new activity log"""
    db_activity = Activity(
        id=str(uuid.uuid4()),
        user_id=str(current_user.id),  # ✅ Sempre do token JWT
        activity_type=activity.activity_type,
        title=activity.title,
        description=activity.description,
        meta_data=activity.meta_data,
        read=0
    )
    
    db.add(db_activity)
    await db.commit()
    await db.refresh(db_activity)
    
    return db_activity

@router.patch("/{activity_id}/read")
async def mark_as_read(
    activity_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark activity as read"""
    stmt = select(Activity).filter(
        Activity.id == activity_id,
        Activity.user_id == str(current_user.id),
    )
    
    result = await db.execute(stmt)
    activity = result.scalar_one_or_none()
    
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    activity.read = 1
    await db.commit()
    
    return {"success": True}

@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get count of unread activities"""
    stmt = select(Activity).filter(
        Activity.user_id == str(current_user.id),
        Activity.read == 0
    )
    
    result = await db.execute(stmt)
    activities = result.scalars().all()
    count = len(activities)
    
    return {"count": count}
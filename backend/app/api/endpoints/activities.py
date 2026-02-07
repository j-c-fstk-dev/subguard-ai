from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.activity import Activity
from app.models.schemas import ActivityCreate, ActivityResponse
from app.api.deps import get_current_user
from app.core.database import UserDB as User

router = APIRouter()

@router.get("/", response_model=List[ActivityResponse])
def get_activities(
    limit: int = 10,
    skip: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user activities (newest first)"""
    activities = db.query(Activity).filter(
        Activity.user_id == str(current_user.id)
    ).order_by(Activity.created_at.desc()).offset(skip).limit(limit).all()
    
    return activities

@router.post("/", response_model=ActivityResponse)
def create_activity(
    activity: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new activity log"""
    db_activity = Activity(
        id=str(uuid.uuid4()),
        user_id=activity.user_id,
        activity_type=activity.activity_type,
        title=activity.title,
        description=activity.description,
        meta_data=activity.meta_data,
        read=0
    )
    
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    
    return db_activity

@router.patch("/{activity_id}/read")
def mark_as_read(
    activity_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark activity as read"""
    activity = db.query(Activity).filter(
        Activity.id == activity_id,
        Activity.user_id == str(current_user.id)
    ).first()
    
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    activity.read = 1
    db.commit()
    
    return {"success": True}

@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get count of unread activities"""
    count = db.query(Activity).filter(
        Activity.user_id == str(current_user.id),
        Activity.read == 0
    ).count()
    
    return {"count": count}

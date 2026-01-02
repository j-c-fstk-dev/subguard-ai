from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user
)
from app.core.database import get_db, AsyncSession
from app.models.schemas import UserCreate, User, Token
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=User)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user"""
    
    # Check if user already exists
    from sqlalchemy import select
    from app.core.database import UserDB
    
    existing_user = await db.execute(
        select(UserDB).where(UserDB.email == user_data.email)
    )
    existing_user = existing_user.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    new_user = UserDB(
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return User(
        id=new_user.id,
        email=new_user.email,
        total_monthly_spend=new_user.total_monthly_spend,
        total_subscriptions=new_user.total_subscriptions,
        total_savings_to_date=new_user.total_savings_to_date,
        optimizations_completed=new_user.optimizations_completed,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at
    )

@router.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login user and return access token"""
    
    from sqlalchemy import select
    from app.core.database import UserDB
    
    # Get user from database
    result = await db.execute(
        select(UserDB).where(UserDB.email == form_data.username)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        expires_in=access_token_expires.seconds
    )

@router.get("/me", response_model=User)
async def get_me(
    current_user = Depends(get_current_user)
):
    """Get current user information"""
    
    return User(
        id=current_user.id,
        email=current_user.email,
        total_monthly_spend=current_user.total_monthly_spend,
        total_subscriptions=current_user.total_subscriptions,
        total_savings_to_date=current_user.total_savings_to_date,
        optimizations_completed=current_user.optimizations_completed,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )
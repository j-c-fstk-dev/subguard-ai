from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, DateTime, Float, Boolean, JSON, Integer
from datetime import datetime
import uuid

from app.core.config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
)

# Create session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class SubscriptionDB(Base):
    """Database model for subscriptions"""
    __tablename__ = "subscriptions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False, index=True)
    service_name = Column(String, nullable=False)
    service_category = Column(String, nullable=False)
    plan_name = Column(String, nullable=False)
    monthly_cost = Column(Float, nullable=False)
    billing_cycle = Column(String, nullable=False)  # monthly, yearly, etc.
    status = Column(String, default="active")  # active, cancelled, trial
    detection_source = Column(String)  # email, bank, manual
    
    # Dates
    start_date = Column(DateTime, default=datetime.utcnow)
    next_billing_date = Column(DateTime)
    last_used_date = Column(DateTime)
    
    # Metadata
    confidence_score = Column(Float, default=1.0)
    notes = Column(String)
    
    # Usage tracking
    usage_frequency = Column(String)  # daily, weekly, monthly, rarely
    estimated_value_score = Column(Float)  # 0-1
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # JSON fields for flexibility
    metadata = Column(JSON, default=dict)
    raw_data = Column(JSON, default=dict)

class OptimizationDB(Base):
    """Database model for optimization recommendations"""
    __tablename__ = "optimizations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    subscription_id = Column(String, nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    
    # Recommendation details
    action_type = Column(String, nullable=False)  # cancel, downgrade, switch, bundle, negotiate
    current_plan = Column(String)
    recommended_plan = Column(String)
    current_cost = Column(Float)
    new_cost = Column(Float)
    monthly_savings = Column(Float)
    yearly_savings = Column(Float)
    
    # AI metadata
    confidence_score = Column(Float)
    reasoning = Column(String)
    steps_required = Column(JSON, default=list)
    estimated_time_minutes = Column(Integer)
    
    # Status
    presented_to_user = Column(Boolean, default=False)
    user_feedback = Column(String)  # accepted, rejected, postponed
    executed = Column(Boolean, default=False)
    execution_date = Column(DateTime)
    
    # Result
    actual_savings = Column(Float)
    notes = Column(String)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserDB(Base):
    """Database model for users"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String)
    
    # Preferences
    risk_tolerance = Column(Float, default=0.5)
    automation_preference = Column(Float, default=0.7)
    notification_preferences = Column(JSON, default=dict)
    
    # Statistics
    total_monthly_spend = Column(Float, default=0)
    total_subscriptions = Column(Integer, default=0)
    total_savings_to_date = Column(Float, default=0)
    optimizations_completed = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Database session dependency
async def get_db():
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
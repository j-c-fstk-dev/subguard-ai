from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class BillingCycle(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"
    QUARTERLY = "quarterly"
    WEEKLY = "weekly"

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    TRIAL = "trial"
    PAUSED = "paused"

class DetectionSource(str, Enum):
    EMAIL = "email"
    BANK = "bank"
    MANUAL = "manual"
    API = "api"

# Base schemas
class SubscriptionBase(BaseModel):
    service_name: str = Field(..., min_length=1, max_length=100)
    service_category: str = Field(..., min_length=1, max_length=50)
    plan_name: str = Field(..., min_length=1, max_length=100)
    monthly_cost: float = Field(..., gt=0)
    billing_cycle: BillingCycle
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE
    detection_source: Optional[DetectionSource] = None

class SubscriptionCreate(SubscriptionBase):
    user_id: str
    start_date: Optional[datetime] = None
    next_billing_date: Optional[datetime] = None
    last_used_date: Optional[datetime] = None
    confidence_score: float = Field(default=1.0, ge=0, le=1)
    notes: Optional[str] = None
    metadata: Dict = Field(default_factory=dict)

class SubscriptionUpdate(BaseModel):
    plan_name: Optional[str] = None
    monthly_cost: Optional[float] = None
    billing_cycle: Optional[BillingCycle] = None
    status: Optional[SubscriptionStatus] = None
    last_used_date: Optional[datetime] = None
    notes: Optional[str] = None

class Subscription(SubscriptionBase):
    id: str
    user_id: str
    start_date: datetime
    next_billing_date: Optional[datetime]
    last_used_date: Optional[datetime]
    confidence_score: float
    notes: Optional[str]
    metadata: Dict
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Optimization schemas
class OptimizationRecommendationBase(BaseModel):
    subscription_id: str
    action_type: str = Field(..., regex="^(cancel|downgrade|switch|bundle|negotiate)$")
    current_plan: str
    recommended_plan: str
    current_cost: float
    new_cost: float
    monthly_savings: float
    yearly_savings: float
    confidence_score: float = Field(..., ge=0, le=1)
    reasoning: str
    steps_required: List[str] = Field(default_factory=list)
    estimated_time_minutes: int = Field(..., gt=0)

class OptimizationRecommendationCreate(OptimizationRecommendationBase):
    user_id: str

class OptimizationRecommendation(OptimizationRecommendationBase):
    id: str
    user_id: str
    presented_to_user: bool
    user_feedback: Optional[str]
    executed: bool
    execution_date: Optional[datetime]
    actual_savings: Optional[float]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Analysis schemas
class SubscriptionAnalysis(BaseModel):
    subscription_id: str
    current_plan_fit_score: float = Field(..., ge=0, le=1)
    optimal_plan: str
    monthly_savings: float
    yearly_savings: float
    reasoning: str
    confidence: float = Field(..., ge=0, le=1)
    suggested_actions: List[str]
    ai_model_used: Optional[str] = None
    
    @validator('monthly_savings')
    def validate_savings(cls, v):
        if v < 0:
            raise ValueError('Savings cannot be negative')
        return v

# User schemas
class UserBase(BaseModel):
    email: str = Field(..., regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: str
    total_monthly_spend: float
    total_subscriptions: int
    total_savings_to_date: float
    optimizations_completed: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

# Dashboard schemas
class DashboardSummary(BaseModel):
    total_monthly_spend: float
    total_subscriptions: int
    potential_savings: float
    optimizations_completed: int
    recent_activity: List[Dict] = Field(default_factory=list)

class MonthlyTrend(BaseModel):
    month: str
    spend: float
    savings: float
    subscriptions: int
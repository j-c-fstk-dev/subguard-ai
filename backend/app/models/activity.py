from sqlalchemy import Column, String, DateTime, Text, Integer
from sqlalchemy.sql import func
from app.core.database import Base

class Activity(Base):
    __tablename__ = "activities"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    activity_type = Column(String, nullable=False)  # email_connected, subscription_added, ai_analysis, etc
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    meta_data = Column(Text, nullable=True)  # JSON string for extra data (renamed to avoid SQLAlchemy reserved word)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read = Column(Integer, default=0)  # 0 = unread, 1 = read

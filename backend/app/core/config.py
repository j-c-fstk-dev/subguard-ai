import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SubGuard AI"
    VERSION: str = "1.0.0"
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "https://redesigned-rotary-phone-wv7947qj7wx26rg-3000.app.github.dev",
        "https://redesigned-rotary-phone-wv7947qj7wx26rg-8000.app.github.dev",
    ]
    
    # Database (SQLite para desenvolvimento rápido)
    DATABASE_URL: str = "sqlite+aiosqlite:///./subguard.db"
    
    # Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-pro"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True 

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
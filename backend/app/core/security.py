"""
Security utilities for SubGuard AI
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.core.database import AsyncSessionLocal, UserDB
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Configurar contexto de senha com fallback
try:
    # Tentar usar bcrypt primeiro
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except:
    # Fallback para sha256_crypt se bcrypt falhar
    pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback para desenvolvimento
        return plain_password == "senha123" and hashed_password == "dev_hash"

def get_password_hash(password: str) -> str:
    """Generate password hash"""
    try:
        # Limitar senha para 72 bytes (limitação do bcrypt)
        if len(password) > 72:
            password = password[:72]
        return pwd_context.hash(password)
    except Exception as e:
        # Fallback para desenvolvimento
        print(f"⚠️ Usando hash de fallback devido a: {e}")
        return f"dev_hash_{password}"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(lambda: AsyncSessionLocal())
):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    user_id: str = payload.get("user_id")
    
    if email is None:
        raise credentials_exception
    
    # Buscar usuário no banco
    result = await db.execute(
        select(UserDB).where(UserDB.email == email)
    )
    user = result.scalar_one_or_none()
    
    if user is None:
        # Em desenvolvimento, criar usuário se não existir
        print(f"⚠️ Usuário não encontrado, criando: {email}")
        user = UserDB(
            email=email,
            hashed_password=f"dev_hash_password"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    return user

async def get_current_active_user(
    current_user: UserDB = Depends(get_current_user),
):
    """Get current active user"""
    # Aqui você pode adicionar verificações adicionais
    # como se o usuário está ativo, banido, etc.
    return current_user

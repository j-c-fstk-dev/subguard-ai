"""
Authentication endpoints for development (simplified)
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db, UserDB
from app.core.security import create_access_token
from app.core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Simplified login for development"""
    
    # Buscar usuário
    result = await db.execute(
        select(UserDB).where(UserDB.email == form_data.username)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        # Criar usuário automaticamente em desenvolvimento
        print(f"⚠️ Usuário não encontrado, criando: {form_data.username}")
        user = UserDB(
            email=form_data.username,
            hashed_password=f"dev_hash_{form_data.password}"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    # Verificar senha (simplificado para dev)
    # Em desenvolvimento, aceita qualquer senha se hash começar com 'dev_hash_'
    if user.hashed_password.startswith("dev_hash_"):
        # Hash de desenvolvimento - verificar senha simples
        expected_password = user.hashed_password.replace("dev_hash_", "")
        if form_data.password != expected_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
                headers={"WWW-Authenticate": "Bearer"},
            )
    else:
        # Tentar verificação normal (pode falhar se bcrypt tiver problemas)
        try:
            from app.core.security import verify_password
            if not verify_password(form_data.password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except:
            # Fallback: aceita qualquer coisa em desenvolvimento
            print(f"⚠️ Bypass de senha em modo desenvolvimento para: {form_data.username}")
    
    # Criar token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email
    }

@router.post("/register")
async def register_user(
    email: str,
    password: str,
    db: AsyncSession = Depends(get_db)
):
    """Register new user (development version)"""
    
    # Verificar se usuário já existe
    result = await db.execute(
        select(UserDB).where(UserDB.email == email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Criar usuário com hash simples
    user = UserDB(
        email=email,
        hashed_password=f"dev_hash_{password}"  # Hash simples para dev
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return {
        "id": user.id,
        "email": user.email,
        "message": "User created successfully (development mode)"
    }

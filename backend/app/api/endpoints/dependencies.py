from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, get_db
from app.core.security import get_current_user
from app.models.schemas import User

# Dependência para obter a sessão do banco de dados
async def get_database_session() -> Generator:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Dependência para obter o usuário atual
async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return current_user

# Dependência para obter o usuário atual opcional
async def get_current_user_optional(
    current_user: Optional[User] = Depends(get_current_user),
) -> Optional[User]:
    return current_user

# Dependência para verificar se o usuário é admin
async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    # Aqui você pode adicionar lógica para verificar se o usuário é admin
    return current_user
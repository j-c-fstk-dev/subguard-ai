from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings

# Criar token manualmente
data = {
    "sub": "test-user-id",  # Será substituído pelo ID real
    "email": "usuario@teste.com",
    "exp": datetime.utcnow() + timedelta(minutes=30)
}

# Primeiro precisamos do ID real do usuário
import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import select
from app.core.database import UserDB

async def get_user_id():
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(UserDB).where(UserDB.email == "usuario@teste.com")
        )
        user = result.scalar_one_or_none()
        if user:
            return user.id
    return "test-user-id"

async def main():
    user_id = await get_user_id()
    print(f"User ID: {user_id}")
    
    data["sub"] = user_id
    token = jwt.encode(data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    print(f"\n🔐 TOKEN PARA TESTE:")
    print(f"Bearer {token}")
    
    # Testar decodificação
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    print(f"\n✅ Token decodificado: {decoded}")

if __name__ == "__main__":
    asyncio.run(main())

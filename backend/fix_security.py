import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import select
from app.core.database import UserDB
from app.core.security import get_password_hash

async def test_auth():
    async with AsyncSessionLocal() as session:
        # Testar se usuário existe
        result = await session.execute(
            select(UserDB).where(UserDB.email == "usuario@teste.com")
        )
        user = result.scalar_one_or_none()
        
        if user:
            print(f"✅ Usuário encontrado no banco:")
            print(f"   ID: {user.id}")
            print(f"   Email: {user.email}")
            print(f"   Hash: {user.hashed_password[:50]}...")
            
            # Testar hash
            from app.core.security import verify_password
            is_valid = verify_password("senha123", user.hashed_password)
            print(f"   Senha válida: {is_valid}")
        else:
            print("❌ Usuário não encontrado")

if __name__ == "__main__":
    asyncio.run(test_auth())

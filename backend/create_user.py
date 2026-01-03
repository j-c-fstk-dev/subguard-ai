import asyncio
from app.core.database import AsyncSessionLocal, UserDB
from app.core.security import get_password_hash

async def create_test_user():
    async with AsyncSessionLocal() as session:
        # Verificar se já existe
        from sqlalchemy import select
        
        result = await session.execute(
            select(UserDB).where(UserDB.email == "usuario@teste.com")
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            print("✅ Usuário já existe")
            return existing
        
        # Criar novo usuário
        hashed_password = get_password_hash("senha123")
        user = UserDB(
            email="usuario@teste.com",
            hashed_password=hashed_password
        )
        
        session.add(user)
        await session.commit()
        await session.refresh(user)
        print(f"✅ Usuário criado: {user.email} (ID: {user.id})")
        return user

if __name__ == "__main__":
    asyncio.run(create_test_user())

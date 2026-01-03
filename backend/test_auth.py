import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def test():
    try:
        from app.core.database import AsyncSessionLocal, UserDB
        from app.core.security import get_password_hash
        from sqlalchemy import select
        
        async with AsyncSessionLocal() as session:
            # Verificar/criar usuário
            result = await session.execute(
                select(UserDB).where(UserDB.email == "test@example.com")
            )
            user = result.scalar_one_or_none()
            
            if not user:
                user = UserDB(
                    email="test@example.com",
                    hashed_password=get_password_hash("test123")
                )
                session.add(user)
                await session.commit()
                print("✅ Usuário criado: test@example.com")
            else:
                print("✅ Usuário já existe: test@example.com")
                
    except Exception as e:
        print(f"❌ Erro: {e}")

asyncio.run(test())

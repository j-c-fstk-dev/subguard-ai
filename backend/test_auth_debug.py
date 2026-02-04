import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, UserDB
from app.core.security import verify_password, get_password_hash

async def debug_auth():
    async with AsyncSessionLocal() as db:
        # Buscar usuário
        result = await db.execute(
            select(UserDB).where(UserDB.email == "dev@subguard.ai")
        )
        user = result.scalar_one_or_none()
        
        if not user:
            print("❌ Usuário não encontrado!")
            return
        
        print(f"✅ Usuário encontrado: {user.email}")
        print(f"🔐 Hash no banco: {user.hashed_password[:50]}...")
        
        # Testar senha
        test_password = "Dev123456!"
        print(f"\n🧪 Testando senha: {test_password}")
        
        try:
            result = verify_password(test_password, user.hashed_password)
            print(f"✅ Verificação: {result}")
        except Exception as e:
            print(f"❌ Erro na verificação: {e}")
        
        # Gerar novo hash para comparar
        new_hash = get_password_hash(test_password)
        print(f"\n🆕 Hash novo gerado: {new_hash[:50]}...")
        print(f"📊 Hashes são diferentes? {user.hashed_password != new_hash}")

if __name__ == "__main__":
    asyncio.run(debug_auth())

#!/usr/bin/env python3
"""
Script para criar usuário de teste com senha funcional
"""
import asyncio
import sys
from pathlib import Path

# Adicionar diretório do backend ao path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.core.database import AsyncSessionLocal, UserDB, Base, engine
from app.core.security import get_password_hash

async def create_test_user():
    """Criar usuário de teste"""
    
    print("🚀 Criando usuário de teste...")
    
    # Criar tabelas se não existirem
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db:
        # Verificar se usuário já existe
        from sqlalchemy import select
        
        test_email = "dev@subguard.ai"
        
        result = await db.execute(
            select(UserDB).where(UserDB.email == test_email)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print(f"⚠️ Usuário {test_email} já existe. Deletando...")
            await db.delete(existing_user)
            await db.commit()
        
        # Criar novo usuário
        test_password = "Dev123456!"
        hashed = get_password_hash(test_password)
        
        print(f"📧 Email: {test_email}")
        print(f"🔑 Senha: {test_password}")
        print(f"🔐 Hash: {hashed[:30]}...")
        
        new_user = UserDB(
            email=test_email,
            hashed_password=hashed
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        print(f"✅ Usuário criado com sucesso!")
        print(f"📋 ID: {new_user.id}")
        print(f"📧 Email: {new_user.email}")
        print(f"\n🧪 Teste o login com:")
        print(f"   Email: {test_email}")
        print(f"   Senha: {test_password}")

if __name__ == "__main__":
    asyncio.run(create_test_user())

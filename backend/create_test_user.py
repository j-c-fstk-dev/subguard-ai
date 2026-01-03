#!/usr/bin/env python3
"""
Script para criar usuário de teste para o SubGuard AI.
Execute antes de testar o login.
"""

import asyncio
import sys
import os

# Adicionar o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def create_test_user():
    try:
        print("🔧 Configurando usuário de teste...")
        
        from app.core.database import AsyncSessionLocal, UserDB
        from app.core.security import get_password_hash
        from sqlalchemy import select
        
        async with AsyncSessionLocal() as session:
            # Verificar se usuário já existe
            result = await session.execute(
                select(UserDB).where(UserDB.email == "usuario@teste.com")
            )
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                print("✅ Usuário já existe: usuario@teste.com")
                print(f"   ID: {existing_user.id}")
                return existing_user
            
            # Criar novo usuário
            hashed_password = get_password_hash("senha123")
            new_user = UserDB(
                email="usuario@teste.com",
                hashed_password=hashed_password
            )
            
            session.add(new_user)
            await session.commit()
            await session.refresh(new_user)
            
            print("✅ Usuário criado com sucesso!")
            print(f"   Email: usuario@teste.com")
            print(f"   Senha: senha123")
            print(f"   ID: {new_user.id}")
            
            return new_user
            
    except Exception as e:
        print(f"❌ Erro ao criar usuário: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("=" * 50)
    print("SubGuard AI - User Setup Utility")
    print("=" * 50)
    asyncio.run(create_test_user())

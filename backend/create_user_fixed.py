#!/usr/bin/env python3
"""
Script robusto para criar usuário de teste
"""
import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def create_user():
    try:
        print("=" * 50)
        print("SubGuard AI - User Creation (Robust Version)")
        print("=" * 50)
        
        from app.core.database import AsyncSessionLocal, UserDB
        from app.core.security import get_password_hash, verify_password
        from sqlalchemy import select
        from datetime import datetime
        
        async with AsyncSessionLocal() as session:
            # Email e senha de teste
            test_email = "usuario@teste.com"
            test_password = "senha123"
            
            print(f"📧 Email: {test_email}")
            print(f"🔑 Senha: {test_password}")
            
            # Verificar se usuário já existe
            result = await session.execute(
                select(UserDB).where(UserDB.email == test_email)
            )
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                print("✅ Usuário já existe no banco!")
                
                # Testar se a senha funciona
                is_valid = verify_password(test_password, existing_user.hashed_password)
                print(f"🔐 Senha válida: {is_valid}")
                
                if not is_valid:
                    print("⚠️ Senha não corresponde. Atualizando hash...")
                    existing_user.hashed_password = get_password_hash(test_password)
                    existing_user.updated_at = datetime.utcnow()
                    await session.commit()
                    print("✅ Hash de senha atualizado!")
                
                print(f"📊 ID do usuário: {existing_user.id}")
                return existing_user
            
            # Criar novo usuário
            print("🆕 Criando novo usuário...")
            
            hashed_password = get_password_hash(test_password)
            print(f"🔐 Hash gerado: {hashed_password[:50]}...")
            
            new_user = UserDB(
                email=test_email,
                hashed_password=hashed_password,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            session.add(new_user)
            await session.commit()
            await session.refresh(new_user)
            
            print("🎉 Usuário criado com sucesso!")
            print(f"📊 ID: {new_user.id}")
            print(f"📅 Criado em: {new_user.created_at}")
            
            # Verificar que podemos fazer login
            test_valid = verify_password(test_password, new_user.hashed_password)
            print(f"✅ Login testado: {test_valid}")
            
            return new_user
            
    except Exception as e:
        print(f"❌ Erro crítico: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    result = asyncio.run(create_user())
    if result:
        print("\n" + "=" * 50)
        print("✅ PRONTO PARA TESTAR LOGIN!")
        print("=" * 50)
        print("\nUse no frontend:")
        print(f"Email: usuario@teste.com")
        print(f"Senha: senha123")
    else:
        print("\n❌ Falha ao criar usuário")

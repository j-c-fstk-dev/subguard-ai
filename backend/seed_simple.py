import asyncio
import sys
import os

# Adicionar o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def main():
    try:
        from app.core.database import AsyncSessionLocal, UserDB, SubscriptionDB, OptimizationDB
        from sqlalchemy import select
        from datetime import datetime, timedelta
        import uuid
        
        async with AsyncSessionLocal() as session:
            # Buscar usuário
            result = await session.execute(
                select(UserDB).where(UserDB.email == "usuario@teste.com")
            )
            user = result.scalar_one_or_none()
            
            if not user:
                print("❌ Usuário não encontrado. Faça login primeiro via frontend.")
                return
            
            print(f"✅ Usuário encontrado: {user.email}")
            
            # Criar assinaturas simples
            subscriptions_data = [
                {
                    "id": str(uuid.uuid4()),
                    "user_id": user.id,
                    "service_name": "Netflix",
                    "service_category": "Entretenimento",
                    "plan_name": "Premium 4K",
                    "monthly_cost": 55.90,
                    "billing_cycle": "monthly",
                    "status": "active",
                    "detection_source": "manual",
                    "start_date": datetime.utcnow() - timedelta(days=180),
                    "next_billing_date": datetime.utcnow() + timedelta(days=15),
                },
                {
                    "id": str(uuid.uuid4()),
                    "user_id": user.id,
                    "service_name": "Spotify",
                    "service_category": "Música",
                    "plan_name": "Família",
                    "monthly_cost": 34.90,
                    "billing_cycle": "monthly",
                    "status": "active",
                    "detection_source": "manual",
                    "start_date": datetime.utcnow() - timedelta(days=120),
                    "next_billing_date": datetime.utcnow() + timedelta(days=8),
                },
            ]
            
            for data in subscriptions_data:
                subscription = SubscriptionDB(**data)
                session.add(subscription)
                print(f"✅ Criando: {data['service_name']} - R${data['monthly_cost']}")
            
            await session.commit()
            print("✅ Dados criados com sucesso!")
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())

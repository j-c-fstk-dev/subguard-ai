import asyncio
from datetime import datetime, timedelta
from app.core.database import AsyncSessionLocal, UserDB, SubscriptionDB, OptimizationDB
from sqlalchemy import select
import uuid

async def seed_database():
    async with AsyncSessionLocal() as session:
        # Verificar se já existe o usuário teste
        result = await session.execute(
            select(UserDB).where(UserDB.email == "usuario@teste.com")
        )
        user = result.scalar_one_or_none()
        
        if not user:
            print("Usuário não encontrado. Execute o registro primeiro via frontend.")
            return
        
        print(f"Usuário encontrado: {user.email}")
        
        # Criar assinaturas mock
        subscriptions = [
            {
                "service_name": "Netflix",
                "service_category": "Entretenimento",
                "plan_name": "Premium 4K",
                "monthly_cost": 55.90,
                "billing_cycle": "monthly",
                "status": "active",
                "start_date": datetime.utcnow() - timedelta(days=180),
                "next_billing_date": datetime.utcnow() + timedelta(days=15),
            },
            {
                "service_name": "Spotify",
                "service_category": "Música",
                "plan_name": "Família",
                "monthly_cost": 34.90,
                "billing_cycle": "monthly",
                "status": "active",
                "start_date": datetime.utcnow() - timedelta(days=120),
                "next_billing_date": datetime.utcnow() + timedelta(days=8),
            },
            {
                "service_name": "Amazon Prime",
                "service_category": "Entretenimento",
                "plan_name": "Anual",
                "monthly_cost": 14.90,  # convertido de anual para mensal
                "billing_cycle": "yearly",
                "status": "active",
                "start_date": datetime.utcnow() - timedelta(days=60),
                "next_billing_date": datetime.utcnow() + timedelta(days=300),
            },
            {
                "service_name": "GymPass",
                "service_category": "Fitness",
                "plan_name": "Basic",
                "monthly_cost": 99.90,
                "billing_cycle": "monthly",
                "status": "active",
                "start_date": datetime.utcnow() - timedelta(days=90),
                "next_billing_date": datetime.utcnow() + timedelta(days=22),
            },
        ]
        
        # Adicionar assinaturas
        for sub_data in subscriptions:
            subscription = SubscriptionDB(
                user_id=user.id,
                **sub_data
            )
            session.add(subscription)
            print(f"Criando assinatura: {sub_data['service_name']}")
        
        await session.commit()
        
        # Criar otimizações mock
        optimizations = [
            {
                "subscription_id": None,  # Será preenchido depois
                "action_type": "downgrade",
                "current_plan": "Premium 4K",
                "recommended_plan": "Standard HD",
                "current_cost": 55.90,
                "new_cost": 39.90,
                "monthly_savings": 16.00,
                "yearly_savings": 192.00,
                "confidence_score": 0.85,
                "reasoning": "Você assiste apenas em 2 dispositivos simultaneamente.",
                "steps_required": ["Acessar conta Netflix", "Ir para configurações de plano", "Selecionar plano Standard"],
                "estimated_time_minutes": 5,
                "presented_to_user": True,
                "user_feedback": "pending",
                "executed": False,
            },
            {
                "subscription_id": None,
                "action_type": "cancel",
                "current_plan": "Basic",
                "recommended_plan": "Cancelar",
                "current_cost": 99.90,
                "new_cost": 0.00,
                "monthly_savings": 99.90,
                "yearly_savings": 1198.80,
                "confidence_score": 0.92,
                "reasoning": "Você não frequentou a academia nos últimos 60 dias.",
                "steps_required": ["Acessar site GymPass", "Ir para configurações de conta", "Solicitar cancelamento"],
                "estimated_time_minutes": 10,
                "presented_to_user": True,
                "user_feedback": "pending",
                "executed": False,
            },
        ]
        
        # Pegar IDs das assinaturas criadas
        result = await session.execute(
            select(SubscriptionDB).where(SubscriptionDB.user_id == user.id)
        )
        user_subscriptions = result.scalars().all()
        
        # Associar otimizações às assinaturas
        if len(user_subscriptions) >= 2:
            optimizations[0]["subscription_id"] = user_subscriptions[0].id
            optimizations[1]["subscription_id"] = user_subscriptions[3].id
            
            for opt_data in optimizations:
                optimization = OptimizationDB(
                    user_id=user.id,
                    **opt_data
                )
                session.add(optimization)
                print(f"Criando otimização para: {opt_data['action_type']}")
        
        await session.commit()
        print("✅ Dados de teste criados com sucesso!")
        print(f"Total de assinaturas: {len(user_subscriptions)}")

if __name__ == "__main__":
    asyncio.run(seed_database())

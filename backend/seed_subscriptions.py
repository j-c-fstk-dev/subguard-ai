"""
Script para popular o banco de dados com assinaturas e otimizações de teste
"""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import engine, UserDB, SubscriptionDB, OptimizationDB, Base

async def seed_data():
    """Popula banco com dados de teste"""
    
    # Criar tabelas se não existirem
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Buscar usuário dev@subguard.ai
    from app.core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(UserDB).where(UserDB.email == "dev@subguard.ai")
        )
        user = result.scalar_one_or_none()
        
        if not user:
            print("❌ Usuário dev@subguard.ai não encontrado!")
            print("Execute create_working_user.py primeiro")
            return
        
        print(f"✅ Usuário encontrado: {user.email} (ID: {user.id})")
        
        # Limpar assinaturas e otimizações antigas
        await session.execute(
            select(OptimizationDB).where(OptimizationDB.user_id == user.id)
        )
        await session.commit()
        
        # Criar assinaturas realistas
        subscriptions_data = [
            {
                "service_name": "Netflix",
                "service_category": "streaming",
                "plan_name": "Premium 4 Telas",
                "monthly_cost": 55.90,
                "billing_cycle": "monthly",
                "status": "active",
                "start_date": datetime.now() - timedelta(days=365),
                "next_billing_date": datetime.now() + timedelta(days=10),
                "last_used_date": datetime.now() - timedelta(days=2),
                "confidence_score": 100
            },
            {
                "service_name": "Spotify",
                "service_category": "music",
                "plan_name": "Individual",
                "monthly_cost": 21.90,
                "billing_cycle": "monthly",
                "status": "active",
                "start_date": datetime.now() - timedelta(days=730),
                "next_billing_date": datetime.now() + timedelta(days=5),
                "last_used_date": datetime.now() - timedelta(hours=3),
                "confidence_score": 100
            },
            {
                "service_name": "Amazon Prime",
                "service_category": "ecommerce",
                "plan_name": "Prime Mensal",
                "monthly_cost": 14.90,
                "billing_cycle": "monthly",
                "status": "active",
                "start_date": datetime.now() - timedelta(days=180),
                "next_billing_date": datetime.now() + timedelta(days=15),
                "last_used_date": datetime.now() - timedelta(days=7),
                "confidence_score": 95
            },
            {
                "service_name": "ChatGPT Plus",
                "service_category": "ai",
                "plan_name": "Plus",
                "monthly_cost": 20.00,
                "billing_cycle": "monthly",
                "status": "active",
                "start_date": datetime.now() - timedelta(days=90),
                "next_billing_date": datetime.now() + timedelta(days=20),
                "last_used_date": datetime.now() - timedelta(days=45),
                "confidence_score": 90
            },
            {
                "service_name": "Adobe Creative Cloud",
                "service_category": "software",
                "plan_name": "Fotografia",
                "monthly_cost": 149.00,
                "billing_cycle": "monthly",
                "status": "active",
                "start_date": datetime.now() - timedelta(days=200),
                "next_billing_date": datetime.now() + timedelta(days=25),
                "last_used_date": datetime.now() - timedelta(days=1),
                "confidence_score": 100
            }
        ]
        
        created_subs = []
        total_monthly = 0
        
        for sub_data in subscriptions_data:
            subscription = SubscriptionDB(
                user_id=user.id,
                **sub_data
            )
            session.add(subscription)
            created_subs.append(subscription)
            total_monthly += sub_data["monthly_cost"]
        
        await session.flush()  # Para obter IDs
        
        print(f"\n✅ {len(created_subs)} assinaturas criadas:")
        for sub in created_subs:
            print(f"   - {sub.service_name} ({sub.plan_name}): R$ {sub.monthly_cost:.2f}/mês")
        print(f"\n💰 Total mensal: R$ {total_monthly:.2f}")
        
        # Criar otimizações de IA (apenas campos que existem no modelo)
        optimizations_data = [
            {
                "subscription_id": created_subs[0].id,  # Netflix
                "action_type": "downgrade",
                "current_plan": "Premium 4 Telas",
                "recommended_plan": "Padrão 2 Telas",
                "current_cost": 55.90,
                "new_cost": 39.90,
                "monthly_savings": 16.00,
                "yearly_savings": 192.00,
                "reasoning": "Você usa apenas 1 tela simultaneamente. Downgrade para o plano Padrão (2 telas) economiza R$ 16/mês mantendo a qualidade Full HD.",
                "confidence_score": 92,
                "executed": False
            },
            {
                "subscription_id": created_subs[3].id,  # ChatGPT
                "action_type": "cancel",
                "current_plan": "Plus",
                "recommended_plan": "Free",
                "current_cost": 20.00,
                "new_cost": 0.00,
                "monthly_savings": 20.00,
                "yearly_savings": 240.00,
                "reasoning": "Não utilizado há 45 dias. Considere cancelar e reativar quando necessário, economizando R$ 20/mês.",
                "confidence_score": 85,
                "executed": False
            },
            {
                "subscription_id": created_subs[1].id,  # Spotify
                "action_type": "switch",
                "current_plan": "Individual",
                "recommended_plan": "Família",
                "current_cost": 21.90,
                "new_cost": 34.90,
                "monthly_savings": -13.00,
                "yearly_savings": -156.00,
                "reasoning": "Plano Família (R$ 34.90) permite até 6 usuários. Dividindo com 5 pessoas, você pagaria apenas R$ 5.82/mês, economizando R$ 16.08/mês.",
                "confidence_score": 78,
                "executed": False
            }
        ]
        
        total_savings = 0
        for opt_data in optimizations_data:
            optimization = OptimizationDB(
                user_id=user.id,
                **opt_data
            )
            session.add(optimization)
            total_savings += opt_data["monthly_savings"]
        
        await session.commit()
        
        print(f"\n✅ {len(optimizations_data)} otimizações criadas")
        print(f"💡 Economia potencial: R$ {total_savings:.2f}/mês (R$ {total_savings * 12:.2f}/ano)")
        
        # Atualizar totais do usuário
        user.total_monthly_spend = total_monthly
        user.total_subscriptions = len(created_subs)
        await session.commit()
        
        print(f"\n✅ Usuário atualizado:")
        print(f"   - Gasto mensal: R$ {user.total_monthly_spend:.2f}")
        print(f"   - Total de assinaturas: {user.total_subscriptions}")
        print(f"\n🎉 Banco de dados populado com sucesso!")

if __name__ == "__main__":
    asyncio.run(seed_data())

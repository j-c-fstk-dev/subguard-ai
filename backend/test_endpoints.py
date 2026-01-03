from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/test/subscriptions")
async def get_test_subscriptions():
    """Endpoint mock para assinaturas"""
    return [
        {
            "id": "1",
            "service_name": "Netflix",
            "service_category": "Entretenimento",
            "plan_name": "Premium 4K",
            "monthly_cost": 55.90,
            "billing_cycle": "monthly",
            "status": "active",
            "next_billing_date": "2024-01-15T00:00:00",
            "last_used_date": "2024-01-01T00:00:00",
        },
        {
            "id": "2",
            "service_name": "Spotify",
            "service_category": "Música",
            "plan_name": "Família",
            "monthly_cost": 34.90,
            "billing_cycle": "monthly",
            "status": "active",
            "next_billing_date": "2024-01-10T00:00:00",
            "last_used_date": "2024-01-02T00:00:00",
        },
        {
            "id": "3",
            "service_name": "Amazon Prime",
            "service_category": "Entretenimento",
            "plan_name": "Anual",
            "monthly_cost": 14.90,
            "billing_cycle": "yearly",
            "status": "active",
            "next_billing_date": "2024-12-01T00:00:00",
            "last_used_date": "2024-01-03T00:00:00",
        },
    ]

@app.get("/api/test/optimizations")
async def get_test_optimizations():
    """Endpoint mock para otimizações"""
    return [
        {
            "id": "1",
            "subscription_id": "1",
            "action_type": "downgrade",
            "current_plan": "Premium 4K",
            "recommended_plan": "Standard HD",
            "current_cost": 55.90,
            "new_cost": 39.90,
            "monthly_savings": 16.00,
            "confidence_score": 0.85,
            "reasoning": "Você assiste apenas em 2 dispositivos",
            "estimated_time_minutes": 5,
            "executed": False,
        },
        {
            "id": "2",
            "subscription_id": "3",
            "action_type": "cancel",
            "current_plan": "Anual",
            "recommended_plan": "Cancelar",
            "current_cost": 99.90,
            "new_cost": 0.00,
            "monthly_savings": 99.90,
            "confidence_score": 0.92,
            "reasoning": "Baixo uso nos últimos 60 dias",
            "estimated_time_minutes": 10,
            "executed": False,
        },
    ]

@app.get("/api/test/dashboard/summary")
async def get_test_dashboard():
    """Endpoint mock para dashboard"""
    return {
        "total_monthly_spend": 205.70,
        "total_subscriptions": 3,
        "potential_savings": 115.90,
        "optimizations_completed": 0,
        "recent_activity": [
            {"id": "1", "action": "created", "service": "Netflix", "date": "2024-01-01T10:00:00"},
            {"id": "2", "action": "created", "service": "Spotify", "date": "2024-01-02T11:00:00"},
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import uuid
import logging

from app.core.database import get_db, NegotiationDB
from app.models.activity import Activity
from app.core.security import get_current_user
from app.models.schemas import (
    NegotiationResponse,
    NegotiationCreate,
    NegotiationUpdate,
    NegotiationMessage
)
from app.core.database import UserDB as User

router = APIRouter()
logger = logging.getLogger(__name__)

# ============================================================================
# GET - Listar negociações
# ============================================================================
@router.get("/", response_model=List[NegotiationResponse])
async def get_negotiations(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all negotiations for user"""
    try:
        query = select(NegotiationDB).where(
            NegotiationDB.user_id == str(current_user.id)
        )
        
        if status:
            query = query.where(NegotiationDB.status == status)
        
        result = await db.execute(query)
        negotiations = result.scalars().all()
        
        return negotiations
    except Exception as e:
        logger.error(f"Error fetching negotiations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# GET - Negociação específica
# ============================================================================
@router.get("/{negotiation_id}", response_model=NegotiationResponse)
async def get_negotiation(
    negotiation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific negotiation"""
    try:
        result = await db.execute(
            select(NegotiationDB).where(
                NegotiationDB.id == negotiation_id,
                NegotiationDB.user_id == str(current_user.id)
            )
        )
        negotiation = result.scalar_one_or_none()
        
        if not negotiation:
            raise HTTPException(status_code=404, detail="Negotiation not found")
        
        return negotiation
    except Exception as e:
        logger.error(f"Error fetching negotiation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# POST - Criar negociação
# ============================================================================
@router.post("/", response_model=NegotiationResponse)
async def create_negotiation(
    negotiation: NegotiationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new negotiation"""
    try:
        negotiation_id = str(uuid.uuid4())
        
        # Mensagem inicial do provedor (mock)
        initial_message = {
            "role": "provider",
            "content": f"Olá! Recebemos sua solicitação de negociação. Vi que você é cliente desde {(datetime.utcnow() - timedelta(days=365)).strftime('%B de %Y')}. Qual desconto você gostaria de solicitar?",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        db_negotiation = NegotiationDB(
            id=negotiation_id,
            optimization_id=negotiation.optimization_id,
            subscription_id=negotiation.subscription_id,
            user_id=str(current_user.id),
            provider_name=negotiation.provider_name,
            current_plan=negotiation.current_plan,
            proposed_savings=negotiation.proposed_savings,
            messages=[initial_message],
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        
        db.add(db_negotiation)
        await db.commit()
        await db.refresh(db_negotiation)
        
        # Log activity
        activity = Activity(
            id=str(uuid.uuid4()),
            user_id=str(current_user.id),
            activity_type="negotiation_started",
            title=f"Started negotiation for {negotiation.provider_name}",
            description=f"Negotiation initiated - potential savings: R$ {negotiation.proposed_savings:.2f}",
            meta_data=str({
                "negotiation_id": negotiation_id,
                "subscription_id": negotiation.subscription_id,
                "provider": negotiation.provider_name,
                "proposed_savings": negotiation.proposed_savings
            }),
            read=0
        )
        db.add(activity)
        await db.commit()
        
        return db_negotiation
    except Exception as e:
        logger.error(f"Error creating negotiation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# POST - Enviar mensagem no chat
# ============================================================================
@router.post("/{negotiation_id}/message")
async def send_message(
    negotiation_id: str,
    message: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send message in negotiation chat"""
    try:
        # Buscar negociação
        result = await db.execute(
            select(NegotiationDB).where(
                NegotiationDB.id == negotiation_id,
                NegotiationDB.user_id == str(current_user.id)
            )
        )
        negotiation = result.scalar_one_or_none()
        
        if not negotiation:
            raise HTTPException(status_code=404, detail="Negotiation not found")
        
        if negotiation.status == "expired":
            raise HTTPException(status_code=400, detail="Negotiation expired")
        
        # Adicionar mensagem do user
        user_message = {
            "role": "user",
            "content": message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        messages = negotiation.messages or []
        messages.append(user_message)
        
        # Resposta simulada do provedor (mock)
        provider_response = _get_provider_response(message, negotiation.provider_name)
        provider_message = {
            "role": "provider",
            "content": provider_response,
            "timestamp": datetime.utcnow().isoformat()
        }
        messages.append(provider_message)
        
        # Atualizar negociação
        negotiation.messages = messages
        negotiation.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(negotiation)
        
        # Log activity
        activity = Activity(
            id=str(uuid.uuid4()),
            user_id=str(current_user.id),
            activity_type="negotiation_message",
            title=f"Message in {negotiation.provider_name} negotiation",
            description=f"Sent: {message[:50]}...",
            meta_data=str({
                "negotiation_id": negotiation_id,
                "message_count": len(messages)
            }),
            read=0
        )
        db.add(activity)
        await db.commit()
        
        return {
            "success": True,
            "messages": messages,
            "provider_response": provider_response
        }
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# POST - Aceitar oferta
# ============================================================================
@router.post("/{negotiation_id}/accept")
async def accept_offer(
    negotiation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Accept negotiation offer"""
    try:
        result = await db.execute(
            select(NegotiationDB).where(
                NegotiationDB.id == negotiation_id,
                NegotiationDB.user_id == str(current_user.id)
            )
        )
        negotiation = result.scalar_one_or_none()
        
        if not negotiation:
            raise HTTPException(status_code=404, detail="Negotiation not found")
        
        # Simular oferta final
        final_offer = {
            "plan": negotiation.current_plan,
            "price": negotiation.proposed_savings * 0.6,  # 60% of proposed savings
            "savings": negotiation.proposed_savings * 0.6,
            "terms": "12-month contract with loyalty discount"
        }
        
        negotiation.offer_accepted = True
        negotiation.status = "accepted"
        negotiation.final_offer = final_offer
        negotiation.updated_at = datetime.utcnow()
        
        await db.commit()
        
        # Log activity
        activity = Activity(
            id=str(uuid.uuid4()),
            user_id=str(current_user.id),
            activity_type="negotiation_accepted",
            title=f"Accepted offer from {negotiation.provider_name}",
            description=f"Negotiation successful - savings: R$ {final_offer['savings']:.2f}/month",
            meta_data=str({
                "negotiation_id": negotiation_id,
                "savings": final_offer['savings'],
                "provider": negotiation.provider_name
            }),
            read=0
        )
        db.add(activity)
        await db.commit()
        
        return {
            "success": True,
            "message": "Offer accepted",
            "final_offer": final_offer
        }
    except Exception as e:
        logger.error(f"Error accepting offer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# POST - Rejeitar negociação
# ============================================================================
@router.post("/{negotiation_id}/reject")
async def reject_negotiation(
    negotiation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Reject negotiation"""
    try:
        result = await db.execute(
            select(NegotiationDB).where(
                NegotiationDB.id == negotiation_id,
                NegotiationDB.user_id == str(current_user.id)
            )
        )
        negotiation = result.scalar_one_or_none()
        
        if not negotiation:
            raise HTTPException(status_code=404, detail="Negotiation not found")
        
        negotiation.status = "rejected"
        negotiation.updated_at = datetime.utcnow()
        
        await db.commit()
        
        # Log activity
        activity = Activity(
            id=str(uuid.uuid4()),
            user_id=str(current_user.id),
            activity_type="negotiation_rejected",
            title=f"Rejected {negotiation.provider_name} negotiation",
            description="Negotiation closed",
            meta_data=str({
                "negotiation_id": negotiation_id,
                "provider": negotiation.provider_name
            }),
            read=0
        )
        db.add(activity)
        await db.commit()
        
        return {"success": True, "message": "Negotiation rejected"}
    except Exception as e:
        logger.error(f"Error rejecting negotiation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Helper - Resposta mock do provedor
# ============================================================================
def _get_provider_response(user_message: str, provider_name: str) -> str:
    """Generate mock provider response based on user message"""
    
    responses = {
        "Netflix": [
            "Ótimo! Posso oferecer 15% de desconto no seu plano Premium.",
            "Temos um plano especial para clientes leais. Você gostaria de tentar?",
            "Perfeito! Vou processar seu desconto. Você verá a mudança no próximo ciclo de cobrança."
        ],
        "Spotify": [
            "Entendo. Para clientes de longa data, posso oferecer a versão Premium a preço promocional.",
            "Que tal uma redução de 20% no seu plano Spotify Premium?",
            "Aceito! Você receberá um email de confirmação em breve."
        ],
        "ChatGPT Plus": [
            "Obrigado pela fidelidade! Posso oferecer um desconto exclusivo para você.",
            "Temos uma promoção especial de 25% para clientes como você.",
            "Aprovado! Seu novo preço entrará em vigor imediatamente."
        ],
        "Adobe Creative Cloud": [
            "Excelente! Como cliente de longa data, você merece um desconto.",
            "Posso oferecer 18% de desconto no seu plano anual.",
            "Perfeito! Vou confirmar isso para você agora."
        ]
    }
    
    provider_responses = responses.get(provider_name, [
        "Entendo sua situação. Deixe-me verificar o que posso fazer por você.",
        "Ótimo! Temos algumas opções disponíveis.",
        "Concordo! Vou processar isso para você."
    ])
    
    # Retorna resposta pseudo-aleatória
    return provider_responses[len(user_message) % len(provider_responses)]
@router.post("/{negotiation_id}/message")
async def send_message(
    negotiation_id: str,
    message: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message in negotiation (AI will respond as provider)"""
    from sqlalchemy import select, update
    from app.core.database import NegotiationDB
    from app.services.ai_negotiator import AINegotiator
    import json
    
    # Get negotiation
    result = await db.execute(
        select(NegotiationDB).where(
            NegotiationDB.id == negotiation_id,
            NegotiationDB.user_id == current_user.id
        )
    )
    negotiation = result.scalar_one_or_none()
    
    if not negotiation:
        raise HTTPException(status_code=404, detail="Negotiation not found")
    
    # Parse current messages
    current_messages = json.loads(negotiation.messages) if isinstance(negotiation.messages, str) else negotiation.messages
    
    # Add user message
    current_messages.append({
        "role": "user",
        "content": message,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    # AI generates provider response
    ai_negotiator = AINegotiator()
    provider_response = await ai_negotiator.generate_provider_response(
        provider_name=negotiation.provider_name,
        current_plan=negotiation.current_plan,
        proposed_savings=negotiation.proposed_savings,
        message_history=current_messages
    )
    
    current_messages.append({
        "role": "provider",
        "content": provider_response["content"],
        "timestamp": datetime.utcnow().isoformat()
    })
    
    # Check if should generate final offer
    if provider_response.get("ready_for_offer"):
        final_offer = {
            "plan": negotiation.current_plan,
            "price": provider_response["offer_price"],
            "savings": negotiation.proposed_savings,
            "terms": provider_response["offer_terms"]
        }
        
        await db.execute(
            update(NegotiationDB)
            .where(NegotiationDB.id == negotiation_id)
            .values(
                messages=json.dumps(current_messages),
                final_offer=json.dumps(final_offer),
                updated_at=datetime.utcnow()
            )
        )
    else:
        await db.execute(
            update(NegotiationDB)
            .where(NegotiationDB.id == negotiation_id)
            .values(
                messages=json.dumps(current_messages),
                updated_at=datetime.utcnow()
            )
        )
    
    await db.commit()
    
    return {
        "messages": current_messages,
        "final_offer": final_offer if provider_response.get("ready_for_offer") else None
    }

@router.post("/{negotiation_id}/accept")
async def accept_offer(
    negotiation_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Accept the final offer"""
    from sqlalchemy import select, update
    from app.core.database import NegotiationDB, Activity
    import json
    import uuid
    
    result = await db.execute(
        select(NegotiationDB).where(
            NegotiationDB.id == negotiation_id,
            NegotiationDB.user_id == current_user.id
        )
    )
    negotiation = result.scalar_one_or_none()
    
    if not negotiation:
        raise HTTPException(status_code=404, detail="Negotiation not found")
    
    # Update negotiation
    await db.execute(
        update(NegotiationDB)
        .where(NegotiationDB.id == negotiation_id)
        .values(
            status="accepted",
            offer_accepted=True,
            updated_at=datetime.utcnow()
        )
    )
    
    # Log activity
    activity = Activity(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        activity_type="negotiation_accepted",
        title=f"Offer accepted for {negotiation.provider_name}",
        description=f"Accepted negotiation with savings of R$ {negotiation.proposed_savings:.2f}/month",
        meta_data=json.dumps({
            "negotiation_id": negotiation_id,
            "provider": negotiation.provider_name,
            "savings": negotiation.proposed_savings
        }),
        read=0
    )
    db.add(activity)
    
    await db.commit()
    
    return {"success": True, "message": "Offer accepted successfully!"}

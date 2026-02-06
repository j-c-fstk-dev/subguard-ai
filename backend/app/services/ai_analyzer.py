import google.generativeai as genai
import logging
import json
from typing import Dict, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIAnalyzer:
    """AI-powered subscription analysis using Gemini"""
    
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
            self.enabled = True
            logger.info("✅ Gemini AI configurado com sucesso")
        else:
            self.enabled = False
            logger.warning("⚠️ GEMINI_API_KEY não configurada - usando mock")
    
    async def analyze_subscription(self, subscription: Dict) -> Dict:
        """Analisa uma subscription e retorna recomendações"""
        
        if not self.enabled:
            return self._mock_analysis(subscription)
        
        try:
            prompt = f"""
Você é um especialista em otimização de gastos com assinaturas.

Analise esta assinatura:
- Serviço: {subscription['service_name']}
- Plano: {subscription['plan_name']}
- Custo Mensal: R$ {subscription['monthly_cost']}
- Categoria: {subscription.get('service_category', 'N/A')}
- Último uso: {subscription.get('last_used_date', 'Desconhecido')}

Forneça uma análise em JSON com:
{{
  "recommendation_type": "cancel" | "downgrade" | "keep" | "negotiate",
  "confidence": 0.0-1.0,
  "monthly_savings": número,
  "reasoning": "explicação detalhada",
  "suggested_plan": "nome do plano sugerido ou null",
  "action_steps": ["passo 1", "passo 2"]
}}

IMPORTANTE: Retorne APENAS o JSON, sem markdown ou texto adicional.
"""
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Remove markdown se houver
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
            
            result = json.loads(result_text)
            logger.info(f"✅ Análise IA concluída para {subscription['service_name']}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Erro na análise IA: {e}")
            return self._mock_analysis(subscription)
    
    def _mock_analysis(self, subscription: Dict) -> Dict:
        """Mock de análise para desenvolvimento"""
        cost = subscription['monthly_cost']
        
        # Lógica simples baseada em custo
        if cost > 100:
            return {
                "recommendation_type": "downgrade",
                "confidence": 0.85,
                "monthly_savings": cost * 0.3,
                "reasoning": f"O plano {subscription['plan_name']} parece caro. Considere um plano mais básico que pode atender suas necessidades.",
                "suggested_plan": "Plano Básico",
                "action_steps": [
                    "Revise suas funcionalidades mais usadas",
                    "Compare com planos mais baratos",
                    "Entre em contato com suporte para downgrade"
                ]
            }
        elif cost > 50:
            return {
                "recommendation_type": "negotiate",
                "confidence": 0.75,
                "monthly_savings": cost * 0.15,
                "reasoning": "Como cliente de longa data, você pode conseguir um desconto de fidelidade.",
                "suggested_plan": None,
                "action_steps": [
                    "Entre em contato com suporte",
                    "Mencione que é cliente há muito tempo",
                    "Peça desconto de fidelidade"
                ]
            }
        else:
            return {
                "recommendation_type": "keep",
                "confidence": 0.9,
                "monthly_savings": 0,
                "reasoning": "O custo está bom para o serviço oferecido. Continue monitorando o uso.",
                "suggested_plan": None,
                "action_steps": [
                    "Continue usando normalmente",
                    "Monitore seu uso mensalmente"
                ]
            }

# Singleton
ai_analyzer = AIAnalyzer()

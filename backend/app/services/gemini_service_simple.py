# backend/app/services/gemini_service_simple.py
import google.generativeai as genai
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class GeminiServiceSimple:
    """Serviço Gemini simplificado para MVP"""
    
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY não configurada. Usando modo mock.")
            self.mock_mode = True
        else:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
            self.mock_mode = False
    
    async def generate_text(self, prompt: str) -> str:
        """Gera texto usando Gemini"""
        if self.mock_mode:
            # Mock para desenvolvimento
            mock_responses = {
                "análise de assinatura": "Recomendo cancelar o serviço X e manter o Y.",
                "otimização": "Você pode economizar R$ 50/mês com estas mudanças.",
                "negociação": "Template de email para negociar desconto gerado.",
            }
            
            for key, response in mock_responses.items():
                if key in prompt.lower():
                    return response
            
            return "Análise concluída. Recomendação: revise suas assinaturas mensalmente."
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Erro ao chamar Gemini API: {e}")
            return f"Erro na análise: {str(e)}"
            
import google.generativeai as genai
from typing import Dict, Any, List, Optional
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google Gemini AI"""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        self.system_prompts = self._load_system_prompts()
    
    def _load_system_prompts(self) -> Dict[str, str]:
        """Load system prompts for different tasks"""
        return {
            "email_analysis": """
            You are a subscription detection expert. Analyze this email and extract subscription information.
            Return JSON with: service_name, plan_name, amount, currency, billing_date, next_billing_date, is_trial.
            If not a subscription email, return null.
            """,
            
            "optimization_analysis": """
            You are a personal finance AI assistant. Analyze this subscription and suggest optimizations.
            Consider: usage patterns, alternative plans, market prices, user profile.
            Return JSON with: current_plan_fit_score, optimal_plan, monthly_savings, reasoning.
            """,
            
            "negotiation_script": """
            You are a negotiation assistant. Generate a polite, persuasive message to request:
            1. Better pricing for loyal customers
            2. Plan downgrade/upgrade based on actual usage
            3. Retention offers
            Keep it professional and friendly.
            """
        }
    
    async def analyze_email(self, email_content: str) -> Optional[Dict[str, Any]]:
        """Analyze email content for subscription information"""
        try:
            prompt = f"""
            {self.system_prompts["email_analysis"]}
            
            Email Content:
            {email_content[:5000]}  # Limit content length
            
            Return valid JSON or null.
            """
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Clean response (remove markdown code blocks)
            if result_text.startswith("```json"):
                result_text = result_text[7:-3]
            elif result_text.startswith("```"):
                result_text = result_text[3:-3]
            
            if result_text.lower() == "null":
                return None
                
            return json.loads(result_text)
            
        except Exception as e:
            logger.error(f"Error analyzing email with Gemini: {e}")
            return None
    
    async def optimize_subscription(self, subscription_data: Dict[str, Any], 
                                   usage_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Generate optimization suggestions for a subscription"""
        try:
            prompt = f"""
            {self.system_prompts["optimization_analysis"]}
            
            Subscription Data:
            {json.dumps(subscription_data, indent=2)}
            
            Usage Data (if available):
            {json.dumps(usage_data or {}, indent=2)}
            
            User Profile:
            - Total monthly spend: ${subscription_data.get('user_total_spend', 0)}
            - Number of subscriptions: {subscription_data.get('user_total_subs', 1)}
            - Risk tolerance: {subscription_data.get('risk_tolerance', 0.5)}/1.0
            
            Return JSON with:
            - current_plan_fit_score (0-1)
            - optimal_plan (name)
            - monthly_savings (amount)
            - yearly_savings (amount)
            - reasoning (detailed explanation)
            - confidence (0-1)
            - suggested_actions (list)
            """
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Clean response
            if result_text.startswith("```json"):
                result_text = result_text[7:-3]
            elif result_text.startswith("```"):
                result_text = result_text[3:-3]
            
            result = json.loads(result_text)
            result["ai_model_used"] = settings.GEMINI_MODEL
            
            return result
            
        except Exception as e:
            logger.error(f"Error optimizing subscription with Gemini: {e}")
            return {
                "error": str(e),
                "current_plan_fit_score": 0.5,
                "monthly_savings": 0,
                "confidence": 0
            }
    
    async def generate_negotiation_script(self, service_name: str, 
                                         user_context: Dict[str, Any]) -> str:
        """Generate negotiation script for customer service"""
        prompt = f"""
        {self.system_prompts["negotiation_script"]}
        
        Service: {service_name}
        User Context: {json.dumps(user_context, indent=2)}
        
        Generate a friendly, professional message that:
        1. States the user is a loyal customer
        2. Mentions their specific usage patterns
        3. Requests better pricing or more suitable plan
        4. Is polite and likely to get positive response
        """
        
        response = self.model.generate_content(prompt)
        return response.text.strip()

# Singleton instance
gemini_service = GeminiService()
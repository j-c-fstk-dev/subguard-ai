import google.generativeai as genai
from app.core.config import settings
from typing import List, Dict
import json

genai.configure(api_key=settings.GEMINI_API_KEY)

class AINegotiator:
    def __init__(self):
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
    
    async def generate_provider_response(
        self,
        provider_name: str,
        current_plan: str,
        proposed_savings: float,
        message_history: List[Dict]
    ) -> Dict:
        """Generate realistic provider response"""
        
        # Build context
        context = f"""You are a customer service representative for {provider_name}. 
A customer's AI assistant is negotiating a discount on their {current_plan} plan.
The AI is trying to get a discount of R$ {proposed_savings:.2f}/month.

Message history:
{json.dumps(message_history[-3:], indent=2)}

Your goal:
1. Be professional and friendly
2. Acknowledge loyalty if mentioned
3. Offer a counter-discount (slightly less than requested)
4. After 2-3 messages, make a final offer

Respond as the provider in English. Keep it concise (2-3 sentences).
If this is the 3rd+ message, include: FINAL_OFFER:price:terms
"""
        
        response = self.model.generate_content(context)
        content = response.text
        
        # Check if final offer
        ready_for_offer = "FINAL_OFFER:" in content
        
        if ready_for_offer:
            parts = content.split("FINAL_OFFER:")
            content = parts[0].strip()
            offer_data = parts[1].strip().split(":")
            
            return {
                "content": content,
                "ready_for_offer": True,
                "offer_price": float(offer_data[0]),
                "offer_terms": offer_data[1] if len(offer_data) > 1 else "12 month commitment"
            }
        
        return {
            "content": content,
            "ready_for_offer": False
        }

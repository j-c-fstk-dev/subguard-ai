import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta

from app.services.gemini_service import gemini_service
from app.models.schemas import (
    Subscription, 
    SubscriptionAnalysis, 
    OptimizationRecommendationCreate
)

logger = logging.getLogger(__name__)

class SubscriptionOptimizer:
    """Optimize subscriptions based on usage and alternatives"""
    
    # Optimization rules based on usage patterns
    OPTIMIZATION_RULES = {
        'low_usage_cancel': {
            'condition': lambda sub: (
                sub.usage_frequency in ['rarely', 'never'] and
                sub.status == 'active'
            ),
            'action': 'cancel',
            'priority': 1.0
        },
        'plan_mismatch': {
            'condition': lambda sub: (
                sub.plan_name.lower().find('premium') != -1 and
                sub.estimated_value_score and
                sub.estimated_value_score < 0.3
            ),
            'action': 'downgrade',
            'priority': 0.9
        },
        'bundle_opportunity': {
            'condition': lambda sub: (
                sub.service_category in ['streaming', 'software'] and
                sub.billing_cycle == 'monthly'
            ),
            'action': 'bundle',
            'priority': 0.7
        },
        'loyalty_discount': {
            'condition': lambda sub: (
                sub.start_date and
                (datetime.utcnow() - sub.start_date).days > 365
            ),
            'action': 'negotiate',
            'priority': 0.8
        }
    }
    
    # Market data for common services (could be fetched from API)
    MARKET_DATA = {
        'netflix': {
            'plans': [
                {'name': 'Basic', 'price': 23.90, 'features': ['1 screen', 'HD']},
                {'name': 'Standard', 'price': 38.90, 'features': ['2 screens', 'Full HD']},
                {'name': 'Premium', 'price': 45.90, 'features': ['4 screens', 'Ultra HD']}
            ]
        },
        'spotify': {
            'plans': [
                {'name': 'Individual', 'price': 21.90, 'features': ['1 account']},
                {'name': 'Duo', 'price': 27.90, 'features': ['2 accounts']},
                {'name': 'Family', 'price': 34.90, 'features': ['6 accounts']},
                {'name': 'Student', 'price': 10.95, 'features': ['1 account']}
            ]
        }
    }
    
    def __init__(self):
        self.gemini = gemini_service
    
    async def analyze(self, subscription: Subscription, 
                     usage_data: Optional[Dict] = None) -> SubscriptionAnalysis:
        """Analyze subscription for optimization opportunities"""
        
        # Prepare data for AI analysis
        analysis_data = {
            'subscription': subscription.dict(),
            'usage_data': usage_data or {},
            'market_data': self._get_market_data(subscription.service_name),
            'user_context': self._get_user_context(subscription.user_id)
        }
        
        # Get AI analysis
        ai_analysis = await self.gemini.optimize_subscription(
            analysis_data['subscription'],
            analysis_data['usage_data']
        )
        
        # Apply business rules
        rule_based_analysis = self._apply_optimization_rules(subscription)
        
        # Combine AI and rule-based analysis
        final_analysis = self._combine_analyses(
            ai_analysis, 
            rule_based_analysis
        )
        
        return SubscriptionAnalysis(
            subscription_id=subscription.id,
            **final_analysis
        )
    
    async def generate_recommendations(self, 
                                     subscription: Subscription,
                                     analysis: SubscriptionAnalysis) -> List[OptimizationRecommendationCreate]:
        """Generate optimization recommendations"""
        
        recommendations = []
        
        # Generate recommendations based on suggested actions
        for action in analysis.suggested_actions:
            recommendation = await self._create_recommendation(
                subscription, 
                analysis, 
                action
            )
            
            if recommendation:
                recommendations.append(recommendation)
        
        # Sort by potential savings
        recommendations.sort(
            key=lambda x: x.monthly_savings, 
            reverse=True
        )
        
        return recommendations
    
    async def _create_recommendation(self, 
                                   subscription: Subscription,
                                   analysis: SubscriptionAnalysis,
                                   action: str) -> Optional[OptimizationRecommendationCreate]:
        """Create a specific recommendation"""
        
        try:
            # Determine optimal plan based on action
            if action == 'downgrade':
                optimal_plan = self._find_downgrade_plan(
                    subscription.service_name,
                    subscription.plan_name,
                    subscription.monthly_cost
                )
                new_cost = self._get_plan_price(
                    subscription.service_name, 
                    optimal_plan
                )
                
            elif action == 'cancel':
                optimal_plan = 'Cancel subscription'
                new_cost = 0.0
                
            else:  # switch, bundle, negotiate
                optimal_plan = analysis.optimal_plan
                new_cost = subscription.monthly_cost * 0.8  # Assume 20% discount
            
            # Calculate savings
            monthly_savings = subscription.monthly_cost - new_cost
            yearly_savings = monthly_savings * 12
            
            # Generate reasoning
            reasoning = self._generate_reasoning(
                subscription, 
                action, 
                optimal_plan,
                monthly_savings
            )
            
            # Estimate time required
            estimated_time = self._estimate_time_required(action)
            
            return OptimizationRecommendationCreate(
                subscription_id=subscription.id,
                user_id=subscription.user_id,
                action_type=action,
                current_plan=subscription.plan_name,
                recommended_plan=optimal_plan,
                current_cost=subscription.monthly_cost,
                new_cost=new_cost,
                monthly_savings=monthly_savings,
                yearly_savings=yearly_savings,
                confidence_score=min(analysis.confidence / 100, 1.0),  # Convert % to decimal and cap at 1.0
                reasoning=reasoning,
                steps_required=self._get_steps_required(action),
                estimated_time_minutes=estimated_time or 30  # Default 30 mins
            )
            
        except Exception as e:
            logger.error(f"Error creating recommendation: {e}")
            return None
    
    def _apply_optimization_rules(self, subscription: Subscription) -> Dict:
        """Apply business rules to subscription"""
        
        applicable_rules = []
        
        for rule_name, rule in self.OPTIMIZATION_RULES.items():
            try:
                if rule['condition'](subscription):
                    applicable_rules.append({
                        'rule': rule_name,
                        'action': rule['action'],
                        'priority': rule['priority']
                    })
            except Exception as e:
                logger.warning(f"Error applying rule {rule_name}: {e}")
        
        # Sort by priority
        applicable_rules.sort(key=lambda x: x['priority'], reverse=True)
        
        if applicable_rules:
            best_rule = applicable_rules[0]
            return {
                'suggested_actions': [best_rule['action']],
                'confidence': best_rule['priority'],
                'reasoning': f"Matched rule: {best_rule['rule']}"
            }
        
        return {
            'suggested_actions': [],
            'confidence': 0.5,
            'reasoning': 'No optimization rules matched'
        }
    
    def _combine_analyses(self, ai_analysis: Dict, rule_analysis: Dict) -> Dict:
        """Combine AI and rule-based analyses"""
        
        # Combine suggested actions
        all_actions = set()
        if 'suggested_actions' in ai_analysis:
            all_actions.update(ai_analysis['suggested_actions'])
        if 'suggested_actions' in rule_analysis:
            all_actions.update(rule_analysis['suggested_actions'])
        
        # Use higher confidence score
        confidence = max(
            ai_analysis.get('confidence', 0.5),
            rule_analysis.get('confidence', 0.5)
        )
        
        # Combine reasoning
        reasoning = f"{ai_analysis.get('reasoning', '')}\n\n{rule_analysis.get('reasoning', '')}"
        
        return {
            'current_plan_fit_score': ai_analysis.get('current_plan_fit_score', 0.5),
            'optimal_plan': ai_analysis.get('optimal_plan', 'Current plan'),
            'monthly_savings': ai_analysis.get('monthly_savings', 0),
            'yearly_savings': ai_analysis.get('yearly_savings', 0),
            'reasoning': reasoning.strip(),
            'confidence': confidence,
            'suggested_actions': list(all_actions),
            'ai_model_used': ai_analysis.get('ai_model_used', 'Gemini')
        }
    
    def _find_downgrade_plan(self, service: str, current_plan: str, current_price: float) -> str:
        """Find appropriate downgrade plan"""
        
        if service in self.MARKET_DATA:
            plans = self.MARKET_DATA[service]['plans']
            
            # Find cheaper plans
            cheaper_plans = [
                p for p in plans 
                if p['price'] < current_price
            ]
            
            if cheaper_plans:
                # Return the most expensive cheaper plan (best value)
                return max(cheaper_plans, key=lambda x: x['price'])['name']
        
        return f"{current_plan} (Standard)"
    
    def _get_plan_price(self, service: str, plan_name: str) -> float:
        """Get price for a specific plan"""
        
        if service in self.MARKET_DATA:
            for plan in self.MARKET_DATA[service]['plans']:
                if plan['name'].lower() == plan_name.lower():
                    return plan['price']
        
        # Default: assume 30% cheaper
        return 0.0
    
    def _generate_reasoning(self, subscription: Subscription, 
                          action: str, optimal_plan: str, 
                          savings: float) -> str:
        """Generate human-readable reasoning"""
        
        base_reasoning = {
            'cancel': f"Cancel {subscription.service_name} because you haven't used it recently.",
            'downgrade': f"Downgrade {subscription.service_name} from {subscription.plan_name} to {optimal_plan}. You're paying for features you don't use.",
            'switch': f"Switch to {optimal_plan} for better value.",
            'bundle': f"Bundle {subscription.service_name} with other services for a package discount.",
            'negotiate': f"Negotiate a better price with {subscription.service_name} as a loyal customer."
        }
        
        reasoning = base_reasoning.get(action, "Optimize this subscription.")
        
        if savings > 0:
            reasoning += f" Save R${savings:.2f}/month (R${savings*12:.2f}/year)."
        
        return reasoning
    
    def _estimate_time_required(self, action: str) -> int:
        """Estimate time required to execute action (in minutes)"""
        
        time_estimates = {
            'cancel': 5,
            'downgrade': 10,
            'switch': 15,
            'bundle': 20,
            'negotiate': 30
        }
        
        return time_estimates.get(action, 10)
    
    def _get_steps_required(self, action: str) -> List[str]:
        """Get steps required to execute action"""
        
        steps = {
            'cancel': [
                "Login to service account",
                "Navigate to subscription settings",
                "Click cancel subscription",
                "Confirm cancellation"
            ],
            'downgrade': [
                "Login to service account",
                "Navigate to plan settings",
                "Select lower tier plan",
                "Confirm changes"
            ],
            'negotiate': [
                "Contact customer support",
                "Explain usage patterns",
                "Request loyalty discount",
                "Accept/negotiate offer"
            ]
        }
        
        return steps.get(action, ["Follow service-specific instructions"])
    
    def _get_market_data(self, service_name: str) -> Dict:
        """Get market data for service"""
        service_lower = service_name.lower()
        
        for service_key, data in self.MARKET_DATA.items():
            if service_key in service_lower:
                return data
        
        return {'plans': []}
    
    def _get_user_context(self, user_id: str) -> Dict:
        """Get user context (simplified for demo)"""
        # In production, this would fetch from database
        return {
            'total_monthly_spend': 0,
            'total_subscriptions': 0,
            'risk_tolerance': 0.5
        }
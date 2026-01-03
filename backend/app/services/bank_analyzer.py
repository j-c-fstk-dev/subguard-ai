import logging
import re
from typing import List, Dict, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class BankAnalyzer:
    """Analyze bank statements for recurring subscriptions"""
    
    # Patterns for common subscription services in bank transactions
    TRANSACTION_PATTERNS = {
        'netflix': [r'netflix', r'nflx'],
        'spotify': [r'spotify'],
        'amazon': [r'amazon prime', r'amazon video'],
        'youtube': [r'youtube premium'],
        'apple': [r'applе', r'itunes'],
        'microsoft': [r'microsoft 365'],
        'adobe': [r'adobe'],
        'gympass': [r'gympass'],
        'ifood': [r'ifood'],
        'uber': [r'uber one'],
    }
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    async def analyze_transactions(self, transactions: List[Dict]) -> List[Dict]:
        """Analyze bank transactions for recurring subscriptions"""
        
        subscriptions = []
        
        # Group transactions by description
        grouped_transactions = self._group_transactions(transactions)
        
        # Identify recurring charges
        for description, txns in grouped_transactions.items():
            if len(txns) >= 2 and self._is_recurring(txns):
                service = self._identify_service(description)
                if service:
                    subscription = self._create_subscription(service, txns)
                    subscriptions.append(subscription)
        
        return subscriptions
    
    def _group_transactions(self, transactions: List[Dict]) -> Dict[str, List]:
        """Group transactions by normalized description"""
        grouped = {}
        
        for txn in transactions:
            desc = self._normalize_description(txn.get('description', ''))
            amount = txn.get('amount', 0)
            
            key = f"{desc}_{amount:.2f}"
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(txn)
        
        return grouped
    
    def _normalize_description(self, description: str) -> str:
        """Normalize transaction description"""
        # Remove special characters and extra spaces
        desc = re.sub(r'[^\w\s]', ' ', description.lower())
        desc = re.sub(r'\s+', ' ', desc).strip()
        
        # Remove common prefixes
        prefixes = ['pagamento', 'compra', 'debito', 'cartao', 'tb']
        for prefix in prefixes:
            if desc.startswith(prefix):
                desc = desc[len(prefix):].strip()
        
        return desc
    
    def _is_recurring(self, transactions: List[Dict]) -> bool:
        """Check if transactions appear regularly"""
        if len(transactions) < 2:
            return False
        
        # Sort by date
        sorted_txns = sorted(transactions, key=lambda x: x.get('date'))
        
        # Calculate intervals between transactions
        dates = [txn.get('date') for txn in sorted_txns]
        
        # Check for monthly pattern (approximately 30 days)
        for i in range(1, len(dates)):
            if isinstance(dates[i], str):
                try:
                    date_i = datetime.fromisoformat(dates[i].replace('Z', '+00:00'))
                    date_prev = datetime.fromisoformat(dates[i-1].replace('Z', '+00:00'))
                    
                    diff_days = (date_i - date_prev).days
                    if 25 <= diff_days <= 35:  # Monthly pattern
                        return True
                except (ValueError, TypeError):
                    continue
        
        return False
    
    def _identify_service(self, description: str) -> Optional[str]:
        """Identify subscription service from transaction description"""
        for service, patterns in self.TRANSACTION_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, description, re.IGNORECASE):
                    return service
        return None
    
    def _create_subscription(self, service: str, transactions: List[Dict]) -> Dict:
        """Create subscription object from transactions"""
        
        # Use the most recent transaction
        latest_txn = max(transactions, key=lambda x: x.get('date'))
        
        # Calculate average amount
        avg_amount = sum(txn.get('amount', 0) for txn in transactions) / len(transactions)
        
        # Determine billing cycle
        billing_cycle = self._determine_billing_cycle(transactions)
        
        # Estimate next billing date
        next_billing = self._estimate_next_billing(transactions)
        
        return {
            'service_name': service.title(),
            'plan_name': f'{service.title()} Subscription',
            'monthly_cost': avg_amount,
            'billing_cycle': billing_cycle,
            'detection_source': 'bank',
            'confidence_score': 0.8,
            'next_billing_date': next_billing.isoformat() if next_billing else None,
            'raw_data': {
                'transactions_count': len(transactions),
                'last_transaction': latest_txn
            }
        }
    
    def _determine_billing_cycle(self, transactions: List[Dict]) -> str:
        """Determine billing cycle from transaction dates"""
        if len(transactions) < 2:
            return 'monthly'
        
        dates = sorted([txn.get('date') for txn in transactions])
        try:
            date1 = datetime.fromisoformat(dates[0].replace('Z', '+00:00'))
            date2 = datetime.fromisoformat(dates[1].replace('Z', '+00:00'))
            
            diff_days = (date2 - date1).days
            
            if 25 <= diff_days <= 35:
                return 'monthly'
            elif 80 <= diff_days <= 100:
                return 'quarterly'
            elif 350 <= diff_days <= 380:
                return 'yearly'
            else:
                return 'monthly'
        except (ValueError, TypeError):
            return 'monthly'
    
    def _estimate_next_billing(self, transactions: List[Dict]) -> Optional[datetime]:
        """Estimate next billing date"""
        if len(transactions) < 2:
            return None
        
        dates = sorted([txn.get('date') for txn in transactions])
        try:
            last_date = datetime.fromisoformat(dates[-1].replace('Z', '+00:00'))
            second_last = datetime.fromisoformat(dates[-2].replace('Z', '+00:00'))
            
            interval = (last_date - second_last).days
            
            # Add interval to last date
            return last_date + timedelta(days=interval)
        except (ValueError, TypeError):
            return None
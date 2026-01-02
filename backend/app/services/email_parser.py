import re
import logging
from typing import List, Dict, Optional
from datetime import datetime
import email
from email import policy
from email.parser import BytesParser

from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

class EmailParser:
    """Parse emails to extract subscription information"""
    
    # Common subscription service patterns
    SUBSCRIPTION_PATTERNS = {
        'netflix': [r'netflix', r'nflx'],
        'spotify': [r'spotify'],
        'amazon': [r'amazon prime', r'amazon video'],
        'youtube': [r'youtube premium'],
        'disney': [r'disney\+', r'disney plus'],
        'hbo': [r'hbo max', r'max'],
        'apple': [r'applе', r'itunes', r'apple tv'],
        'microsoft': [r'microsoft 365', r'office 365'],
        'adobe': [r'adobe creative'],
        'notion': [r'notion'],
        'figma': [r'figma'],
        'github': [r'github'],
        'linkedin': [r'linkedin premium'],
        'gympass': [r'gympass'],
        'ifood': [r'ifood'],
        'uber': [r'uber one'],
    }
    
    # Common billing keywords
    BILLING_KEYWORDS = [
        'invoice', 'receipt', 'payment', 'billing',
        'subscription', 'renewal', 'auto-renew',
        'charge', 'charged', 'payment confirmation'
    ]
    
    def __init__(self):
        self.gemini = gemini_service
    
    async def parse_email(self, email_content: str) -> Optional[Dict]:
        """Parse email content using Gemini AI"""
        try:
            # First, check if it's likely a billing email
            if not self._is_billing_email(email_content):
                return None
            
            # Use Gemini for structured extraction
            result = await self.gemini.analyze_email(email_content)
            
            if result and self._validate_subscription_data(result):
                # Enhance with pattern matching
                result = self._enhance_with_patterns(result, email_content)
                return result
            
            return None
            
        except Exception as e:
            logger.error(f"Error parsing email: {e}")
            return None
    
    def _is_billing_email(self, content: str) -> bool:
        """Check if email is likely a billing/subscription email"""
        content_lower = content.lower()
        
        # Check for billing keywords
        has_billing_keyword = any(
            keyword in content_lower for keyword in self.BILLING_KEYWORDS
        )
        
        # Check for currency patterns
        has_currency = bool(
            re.search(r'R\$\s*\d+[,.]\d{2}|\$\s*\d+[,.]\d{2}', content)
        )
        
        # Check for subscription service patterns
        has_service = bool(
            self._detect_service(content_lower)
        )
        
        return has_billing_keyword and (has_currency or has_service)
    
    def _detect_service(self, content: str) -> Optional[str]:
        """Detect subscription service from email content"""
        for service, patterns in self.SUBSCRIPTION_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, content, re.IGNORECASE):
                    return service
        return None
    
    def _validate_subscription_data(self, data: Dict) -> bool:
        """Validate extracted subscription data"""
        required_fields = ['service_name', 'amount']
        
        for field in required_fields:
            if field not in data or not data[field]:
                return False
        
        # Validate amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return False
        except (ValueError, TypeError):
            return False
        
        return True
    
    def _enhance_with_patterns(self, data: Dict, email_content: str) -> Dict:
        """Enhance data with additional pattern matching"""
        content_lower = email_content.lower()
        
        # Detect billing cycle
        if 'billing_date' not in data or not data['billing_date']:
            data['billing_date'] = self._extract_date(email_content)
        
        if 'billing_cycle' not in data or not data['billing_cycle']:
            if 'annual' in content_lower or 'yearly' in content_lower:
                data['billing_cycle'] = 'yearly'
            elif 'quarter' in content_lower:
                data['billing_cycle'] = 'quarterly'
            else:
                data['billing_cycle'] = 'monthly'
        
        # Detect if it's a trial
        if 'is_trial' not in data:
            data['is_trial'] = 'trial' in content_lower or 'free trial' in content_lower
        
        return data
    
    def _extract_date(self, content: str) -> Optional[str]:
        """Extract date from email content"""
        date_patterns = [
            r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}',
            r'\d{4}[-/]\d{1,2}[-/]\d{1,2}',
            r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, content)
            if match:
                try:
                    date_str = match.group()
                    # Try to parse as datetime
                    for fmt in ['%Y-%m-%d', '%d-%m-%Y', '%m/%d/%Y', '%b %d, %Y']:
                        try:
                            dt = datetime.strptime(date_str, fmt)
                            return dt.isoformat()
                        except ValueError:
                            continue
                except:
                    continue
        
        return None
    
    async def parse_email_file(self, email_file) -> List[Dict]:
        """Parse email file (eml format)"""
        try:
            # Parse email file
            msg = BytesParser(policy=policy.default).parsebytes(email_file)
            
            # Get email content
            content = ""
            if msg.is_multipart():
                for part in msg.iter_parts():
                    if part.get_content_type() == 'text/plain':
                        content = part.get_content()
                        break
            else:
                content = msg.get_content()
            
            # Parse content
            return await self.parse_email(content)
            
        except Exception as e:
            logger.error(f"Error parsing email file: {e}")
            return None
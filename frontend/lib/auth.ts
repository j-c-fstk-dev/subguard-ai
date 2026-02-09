export interface User {
  id: string;
  email: string;
  total_monthly_spend: number;
  total_subscriptions: number;
}

export async function getCurrentUser(): Promise<User | null> {
  // In production, this would verify JWT token from localStorage or API call
  // For demo, return mock user if we're in browser
  
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    return null;
  }
  
  // Mock user for demo
  return {
    id: 'user-123',
    email: 'demo@subguard.ai',
    total_monthly_spend: 487.50,
    total_subscriptions: 14
  };
}

export async function login(email: string, password: string): Promise<boolean> {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would call your backend
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Store token in localStorage (changed from cookies for client-side)
      localStorage.setItem('auth_token', data.token || 'mock-token');
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Login failed:', error);
    // Fallback: set mock token for demo
    localStorage.setItem('auth_token', 'mock-token-' + Date.now());
    return true;
  }
}

export async function logout(): Promise<void> {
  // Clear auth token from localStorage
  localStorage.removeItem('auth_token');
  
  // Redirect to login
  window.location.href = '/login';
}

import { cookies } from 'next/headers';

export interface User {
  id: string;
  email: string;
  total_monthly_spend: number;
  total_subscriptions: number;
}

export async function getCurrentUser(): Promise<User | null> {
  // In production, this would verify JWT token
  // For demo, return mock user
  
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth_token');
  
  if (!authToken) {
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
      
      // Store token (in production)
      document.cookie = `auth_token=${data.token}; path=/; max-age=86400`;
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
}

export async function logout(): Promise<void> {
  // Clear auth token
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  
  // Redirect to login
  window.location.href = '/login';
}
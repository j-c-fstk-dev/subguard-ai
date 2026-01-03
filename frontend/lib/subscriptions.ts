import api from './api';

export interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  service_category: string;
  plan_name: string;
  monthly_cost: number;
  billing_cycle: string;
  status: string;
  detection_source?: string;
  start_date: string;
  next_billing_date?: string;
  last_used_date?: string;
  confidence_score: number;
  notes?: string;
  usage_frequency?: string;
  estimated_value_score?: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionDto {
  service_name: string;
  service_category: string;
  plan_name: string;
  monthly_cost: number;
  billing_cycle: string;
  status?: string;
  detection_source?: string;
  start_date?: string;
  next_billing_date?: string;
  last_used_date?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export async function fetchSubscriptions(userId: string): Promise<Subscription[]> {
  try {
    console.log('🔄 fetchSubscriptions chamado para userId:', userId);
    
    // Obter token do localStorage
    const token = localStorage.getItem('access_token');
    console.log('🔑 Token disponível:', token ? 'Sim' : 'Não');
    
    if (!token) {
      console.warn('⚠️ Token não encontrado, retornando mock data');
      return getMockSubscriptions();
    }
    
    // Tentar API real com autenticação
    const response = await api.get('/api/subscriptions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Resposta da API:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Erro em fetchSubscriptions:', error.message);
    console.error('Detalhes do erro:', error.response?.data || error);
    
    // Se for erro 401 (não autorizado)
    if (error.response?.status === 401) {
      console.log('🔒 Token expirado/inválido');
      localStorage.removeItem('access_token');
      // Não redirecionamos aqui, deixamos o componente lidar
    }
    
    // Fallback para mock data
    console.log('�� Usando mock data como fallback');
    return getMockSubscriptions();
  }
}

export async function createSubscription(data: CreateSubscriptionDto): Promise<Subscription> {
  const token = localStorage.getItem('access_token');
  const response = await api.post('/api/subscriptions', data, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

export async function updateSubscription(id: string, data: Partial<CreateSubscriptionDto>): Promise<Subscription> {
  const token = localStorage.getItem('access_token');
  const response = await api.put(`/api/subscriptions/${id}`, data, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

export async function deleteSubscription(id: string): Promise<void> {
  const token = localStorage.getItem('access_token');
  await api.delete(`/api/subscriptions/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function analyzeSubscription(id: string): Promise<any> {
  const token = localStorage.getItem('access_token');
  const response = await api.get(`/api/subscriptions/${id}/analyze`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

// Mock data for development
function getMockSubscriptions(): Subscription[] {
  console.log('📋 Retornando mock data');
  return [
    {
      id: '1',
      user_id: 'user-123',
      service_name: 'Netflix',
      service_category: 'streaming',
      plan_name: 'Premium',
      monthly_cost: 45.90,
      billing_cycle: 'monthly',
      status: 'active',
      detection_source: 'email',
      start_date: '2023-01-15T00:00:00Z',
      next_billing_date: '2024-02-15T00:00:00Z',
      last_used_date: '2024-01-10T00:00:00Z',
      confidence_score: 0.95,
      usage_frequency: 'daily',
      estimated_value_score: 0.8,
      metadata: {},
      created_at: '2023-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      user_id: 'user-123',
      service_name: 'Spotify',
      service_category: 'music',
      plan_name: 'Individual',
      monthly_cost: 21.90,
      billing_cycle: 'monthly',
      status: 'active',
      detection_source: 'bank',
      start_date: '2022-08-22T00:00:00Z',
      next_billing_date: '2024-02-10T00:00:00Z',
      last_used_date: '2024-01-28T00:00:00Z',
      confidence_score: 0.98,
      usage_frequency: 'daily',
      estimated_value_score: 0.9,
      metadata: {},
      created_at: '2022-08-22T00:00:00Z',
      updated_at: '2024-01-22T00:00:00Z'
    },
    {
      id: '3',
      user_id: 'user-123',
      service_name: 'GymPass',
      service_category: 'fitness',
      plan_name: 'Platinum',
      monthly_cost: 99.90,
      billing_cycle: 'monthly',
      status: 'active',
      detection_source: 'manual',
      start_date: '2023-11-05T00:00:00Z',
      next_billing_date: '2024-02-05T00:00:00Z',
      last_used_date: '2023-12-15T00:00:00Z',
      confidence_score: 0.85,
      usage_frequency: 'rarely',
      estimated_value_score: 0.2,
      metadata: {},
      created_at: '2023-11-05T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z'
    }
  ];
}

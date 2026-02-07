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

export async function fetchSubscriptions(): Promise<Subscription[]> {
  try {
    console.log('🔄 Buscando assinaturas da API...');
    const response = await api.get('/api/subscriptions/');
    console.log('✅ Assinaturas recebidas:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao buscar assinaturas:', error);
    if (error.response?.status === 401) {
      console.log('🔒 Não autorizado - redirecionando para login');
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    throw error;
  }
}

export async function createSubscription(data: CreateSubscriptionDto): Promise<Subscription> {
  const response = await api.post('/api/subscriptions/', data);
  return response.data;
}

export async function updateSubscription(id: string, data: Partial<CreateSubscriptionDto>): Promise<Subscription> {
  const response = await api.put(`/api/subscriptions/${id}`, data);
  return response.data;
}

export async function deleteSubscription(id: string): Promise<void> {
  await api.delete(`/api/subscriptions/${id}`);
}

export async function analyzeSubscription(id: string) {
  const response = await api.post(`/api/subscriptions/${id}/analyze`);
  return response.data;
}

export async function applyRecommendation(
  id: string, 
  data: {
    action: string;
    suggested_plan?: string;
    new_cost?: number;
    savings: number;
  }
) {
  const response = await api.post(`/api/subscriptions/${id}/apply-recommendation`, data);
  return response.data;
}
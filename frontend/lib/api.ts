import axios from 'axios';

// URL fixa - sem variáveis de ambiente complicadas
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

// Mock data para desenvolvimento (quando backend não está rodando)
const USE_MOCK_DATA = true; // Mude para false quando backend estiver pronto

export default api;

// Funções mock para desenvolvimento
export const mockApi = {
  getSubscriptions: () => Promise.resolve([
    {
      id: '1',
      service_name: 'Netflix',
      plan_name: 'Premium',
      monthly_cost: 45.90,
      status: 'active',
      last_used_date: '2024-01-10'
    },
    {
      id: '2',
      service_name: 'Spotify',
      plan_name: 'Individual',
      monthly_cost: 21.90,
      status: 'active',
      last_used_date: '2024-01-28'
    },
    {
      id: '3',
      service_name: 'GymPass',
      plan_name: 'Platinum',
      monthly_cost: 99.90,
      status: 'active',
      last_used_date: '2023-12-15'
    }
  ]),
  
  getDashboardSummary: () => Promise.resolve({
    total_monthly_spend: 487.50,
    total_subscriptions: 14,
    potential_savings: 167.00,
    optimizations_completed: 8,
  }),
};
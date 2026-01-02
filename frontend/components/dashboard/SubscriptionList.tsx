'use client';

import { useState, useEffect } from 'react';
import { MoreVertical, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { fetchSubscriptions } from '@/lib/api/subscriptions';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Subscription {
  id: string;
  service_name: string;
  plan_name: string;
  monthly_cost: number;
  status: string;
  next_billing_date?: string;
  last_used_date?: string;
}

export default function SubscriptionList({ userId }: { userId: string }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadSubscriptions();
  }, [userId]);

  async function loadSubscriptions() {
    try {
      // Mock data for demo
      const mockData: Subscription[] = [
        {
          id: '1',
          service_name: 'Netflix',
          plan_name: 'Premium',
          monthly_cost: 45.90,
          status: 'active',
          next_billing_date: '2024-02-15',
          last_used_date: '2024-01-10'
        },
        {
          id: '2',
          service_name: 'Spotify',
          plan_name: 'Individual',
          monthly_cost: 21.90,
          status: 'active',
          next_billing_date: '2024-02-10',
          last_used_date: '2024-01-28'
        },
        {
          id: '3',
          service_name: 'GymPass',
          plan_name: 'Platinum',
          monthly_cost: 99.90,
          status: 'active',
          next_billing_date: '2024-02-05',
          last_used_date: '2023-12-15'
        },
        {
          id: '4',
          service_name: 'Amazon Prime',
          plan_name: 'Monthly',
          monthly_cost: 14.90,
          status: 'active',
          next_billing_date: '2024-02-20',
          last_used_date: '2024-01-25'
        }
      ];
      
      setSubscriptions(mockData);
      
      // Real API call (uncomment when backend is ready)
      // const data = await fetchSubscriptions(userId);
      // setSubscriptions(data);
      
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filter === 'active') return sub.status === 'active';
    if (filter === 'inactive') return sub.status !== 'active';
    if (filter === 'unused') {
      const lastUsed = sub.last_used_date ? new Date(sub.last_used_date) : null;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastUsed && lastUsed < thirtyDaysAgo;
    }
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Subscriptions
          </h2>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Your Subscriptions
        </h2>
        
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Subscriptions</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="unused">Unused (30+ days)</option>
          </select>
          
          <button className="btn-primary text-sm">
            Add Subscription
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Service</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Plan</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Monthly Cost</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Next Billing</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((sub) => (
              <tr key={sub.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="font-bold text-blue-600">
                        {sub.service_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {sub.service_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last used: {sub.last_used_date || 'Never'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {sub.plan_name}
                  </span>
                </td>
                <td className="py-4 px-4 font-semibold">
                  {formatCurrency(sub.monthly_cost)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    {getStatusIcon(sub.status)}
                    <span className="ml-2 capitalize">{sub.status}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {sub.next_billing_date || 'N/A'}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Analyze
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            No subscriptions found
          </div>
          <button className="btn-primary">
            Connect Your Email to Find Subscriptions
          </button>
        </div>
      )}

      <div className="mt-6 pt-6 border-t">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            Total: {subscriptions.length} subscriptions
          </div>
          <div className="font-semibold">
            Monthly Total: {formatCurrency(
              subscriptions.reduce((sum, sub) => sum + sub.monthly_cost, 0)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
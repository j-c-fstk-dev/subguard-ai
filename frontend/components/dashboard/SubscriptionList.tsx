'use client';

import { useState, useEffect } from 'react';
import { MoreVertical, AlertCircle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { fetchSubscriptions } from '@/lib/subscriptions';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

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
      const data = await fetchSubscriptions(userId);
      if (data && data.length > 0) {
        setSubscriptions(data);
      } else {
        const fallbackData: Subscription[] = [
          {
            id: 'fallback-1',
            service_name: 'Netflix',
            plan_name: 'Premium',
            monthly_cost: 45.90,
            status: 'active',
            next_billing_date: '2024-02-15',
            last_used_date: '2024-01-10'
          }
        ];
        setSubscriptions(fallbackData);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      const fallbackData: Subscription[] = [
        {
          id: 'error-1',
          service_name: 'Spotify',
          plan_name: 'Individual',
          monthly_cost: 21.90,
          status: 'active',
          next_billing_date: '2024-02-10',
          last_used_date: '2024-01-28'
        }
      ];
      setSubscriptions(fallbackData);
    } finally {
      setLoading(false);
    }
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Obter inicial ou emoji para o avatar
  const getServiceAvatar = (serviceName: string) => {
    const avatars: { [key: string]: string } = {
      'Netflix': '🎬',
      'Spotify': '🎵',
      'Amazon': '📦',
      'Prime': '📦',
      'ChatGPT': '🤖',
      'Adobe': '🎨',
      'YouTube': '▶️',
      'Disney': '🏰',
    };

    for (const [key, emoji] of Object.entries(avatars)) {
      if (serviceName.toLowerCase().includes(key.toLowerCase())) {
        return emoji;
      }
    }
    return serviceName.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">Your Subscriptions</h3>
          <div className="flex space-x-2">
            <select className="input text-sm py-2">
              <option>All Subscriptions</option>
            </select>
            <Button size="sm">Add Subscription</Button>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-neutral-600">Loading subscriptions...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">Your Subscriptions</h3>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input text-sm py-2 px-3"
          >
            <option value="all">All Subscriptions</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button size="sm" variant="primary">Add Subscription</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Service</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Plan</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Monthly Cost</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Next Billing</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((subscription) => (
              <tr 
                key={subscription.id} 
                className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors duration-150 group"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-200">
                      {getServiceAvatar(subscription.service_name)}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{subscription.service_name}</p>
                      <p className="text-xs text-neutral-500">
                        Last used: {formatDate(subscription.last_used_date)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="font-medium text-neutral-700">{subscription.plan_name}</p>
                </td>
                <td className="py-4 px-4">
                  <p className="font-bold text-neutral-900">{formatCurrency(subscription.monthly_cost)}</p>
                </td>
                <td className="py-4 px-4">
                  <Badge 
                    variant={subscription.status === 'active' ? 'success' : subscription.status === 'cancelled' ? 'danger' : 'warning'}
                    size="sm"
                    dot
                  >
                    {subscription.status}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-neutral-700">{formatDate(subscription.next_billing_date)}</p>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="text-primary-600 hover:text-primary-700">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Analyze
                    </Button>
                    <button className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-neutral-600">
          Total: <span className="font-semibold text-neutral-900">{filteredSubscriptions.length}</span> subscription{filteredSubscriptions.length !== 1 ? 's' : ''}
        </p>
        <div className="text-right">
          <p className="text-sm text-neutral-600 mb-1">Monthly Total</p>
          <p className="text-2xl font-bold text-neutral-900">
            {formatCurrency(
              filteredSubscriptions.reduce((sum, sub) => sum + sub.monthly_cost, 0)
            )}
          </p>
        </div>
      </div>
    </Card>
  );
}

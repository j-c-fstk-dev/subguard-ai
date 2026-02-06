'use client';
import { useState, useEffect } from 'react';
import { MoreVertical, Search, Plus, Pencil, Trash2, Sparkles } from 'lucide-react';
import { fetchSubscriptions, deleteSubscription } from '@/lib/subscriptions';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Input } from '@/components/ui/input';
import SubscriptionModal from './SubscriptionModal';
import AIAnalysisModal from './AIAnalysisModal';
import api from '@/lib/api';

interface Subscription {
  id: string;
  service_name: string;
  plan_name: string;
  monthly_cost: number;
  status: string;
  next_billing_date?: string;
  last_used_date?: string;
  service_category?: string;
  billing_cycle?: string;
}

interface AIAnalysis {
  recommendation_type: string;
  monthly_savings: number;
  confidence: number;
  reasoning: string;
  suggested_plan?: string;
  action_steps: string[];
}

export default function SubscriptionList({ userId }: { userId: string }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  
  // AI Analysis Modal State
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzedServiceName, setAnalyzedServiceName] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, [userId]);

  async function loadSubscriptions() {
    try {
      setLoading(true);
      const data = await fetchSubscriptions();
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await deleteSubscription(id);
      await loadSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Failed to delete subscription');
    }
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSubscription(sub);
    setModalOpen(true);
  };

  const handleAnalyze = async (id: string, name: string) => {
    setAnalyzingId(id);
    setAnalyzedServiceName(name);
    setAnalysisModalOpen(true);
    setCurrentAnalysis(null);
    
    try {
      const response = await api.post(`/api/subscriptions/${id}/analyze`);
      const { analysis } = response.data;
      setCurrentAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing subscription:', error);
      setCurrentAnalysis(null);
      alert('Failed to analyze subscription. Please try again.');
      setAnalysisModalOpen(false);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingSubscription(null);
  };

  const handleAnalysisModalClose = () => {
    setAnalysisModalOpen(false);
    setCurrentAnalysis(null);
    setAnalyzedServiceName('');
  };

  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.service_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.monthly_cost, 0);

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

  // Obter emoji para o avatar
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-neutral-600">Loading subscriptions...</span>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Your Subscriptions</h2>
            <p className="text-neutral-600 mt-1">Manage all your recurring payments</p>
          </div>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus className="w-5 h-5" />
            Add Subscription
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 mb-4">No subscriptions found</p>
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              Add your first subscription
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Service</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Monthly Cost</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Next Billing</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">Actions</th>
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
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAnalyze(subscription.id, subscription.service_name)}
                            disabled={analyzingId === subscription.id}
                            title="Analyze with AI"
                          >
                            {analyzingId === subscription.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                            ) : (
                              <Sparkles className="w-4 h-4 text-purple-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(subscription)}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(subscription.id, subscription.service_name)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-6 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-neutral-600">
                Total: <span className="font-semibold text-neutral-900">{filteredSubscriptions.length}</span> subscription{filteredSubscriptions.length !== 1 ? 's' : ''}
              </p>
              <div className="text-right">
                <p className="text-sm text-neutral-600 mb-1">Monthly Total</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {formatCurrency(totalMonthly)}
                </p>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Subscription Modal (Add/Edit) */}
      <SubscriptionModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={loadSubscriptions}
        subscription={editingSubscription}
      />

      {/* AI Analysis Modal */}
      <AIAnalysisModal
        open={analysisModalOpen}
        onClose={handleAnalysisModalClose}
        serviceName={analyzedServiceName}
        analysis={currentAnalysis}
        loading={analyzingId !== null}
      />
    </>
  );
}

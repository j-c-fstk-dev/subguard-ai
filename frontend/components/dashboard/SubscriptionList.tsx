'use client';
import { useState, useEffect } from 'react';
import { MoreVertical, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { fetchSubscriptions, deleteSubscription } from '@/lib/subscriptions';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Input } from '@/components/ui/input';
import SubscriptionModal from './SubscriptionModal';

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

export default function SubscriptionList({ userId }: { userId: string }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

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
      await loadSubscriptions(); // Reload
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Failed to delete subscription');
    }
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSubscription(sub);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingSubscription(null);
  };

  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.service_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.monthly_cost, 0);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
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
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Service</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Monthly Cost</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-neutral-900">{sub.service_name}</div>
                        {sub.last_used_date && (
                          <div className="text-sm text-neutral-500">
                            Last used: {new Date(sub.last_used_date).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-neutral-700">{sub.plan_name}</td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-neutral-900">
                          R$ {sub.monthly_cost.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={sub.status === 'active' ? 'success' : 'default'}>
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(sub)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(sub.id, sub.service_name)}
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
            <div className="mt-6 pt-6 border-t border-neutral-200 flex justify-between items-center">
              <div className="text-neutral-600">
                Total: <span className="font-semibold">{filteredSubscriptions.length}</span> subscriptions
              </div>
              <div className="text-right">
                <div className="text-sm text-neutral-600">Monthly Total</div>
                <div className="text-2xl font-bold text-neutral-900">
                  R$ {totalMonthly.toFixed(2)}
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modal */}
      <SubscriptionModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={loadSubscriptions}
        subscription={editingSubscription}
      />
    </>
  );
}

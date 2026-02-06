'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Button from '@/components/ui/Button';
import { createSubscription, updateSubscription } from '@/lib/subscriptions';

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription?: any; // Para edição
}

const CATEGORIES = [
  { value: 'streaming', label: 'Streaming' },
  { value: 'music', label: 'Music' },
  { value: 'software', label: 'Software' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'ai', label: 'AI Tools' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'other', label: 'Other' },
];

const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'quarterly', label: 'Quarterly' },
];

export default function SubscriptionModal({
  open,
  onClose,
  onSuccess,
  subscription,
}: SubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_name: '',
    plan_name: '',
    monthly_cost: '',
    billing_cycle: 'monthly',
    service_category: 'other',
    notes: '',
  });

  const isEditing = !!subscription;

  // Preenche form quando editando
  useEffect(() => {
    if (subscription) {
      setFormData({
        service_name: subscription.service_name || '',
        plan_name: subscription.plan_name || '',
        monthly_cost: subscription.monthly_cost?.toString() || '',
        billing_cycle: subscription.billing_cycle || 'monthly',
        service_category: subscription.service_category || 'other',
        notes: subscription.notes || '',
      });
    } else {
      // Reset quando for adicionar
      setFormData({
        service_name: '',
        plan_name: '',
        monthly_cost: '',
        billing_cycle: 'monthly',
        service_category: 'other',
        notes: '',
      });
    }
  }, [subscription, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        service_name: formData.service_name,
        plan_name: formData.plan_name,
        monthly_cost: parseFloat(formData.monthly_cost),
        billing_cycle: formData.billing_cycle,
        service_category: formData.service_category,
        notes: formData.notes || undefined,
        status: 'active',
        detection_source: 'manual',
      };

      if (isEditing) {
        await updateSubscription(subscription.id, data);
      } else {
        await createSubscription(data);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving subscription:', error);
      alert('Failed to save subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Subscription' : 'Add Subscription'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your subscription details below.'
              : 'Add a new subscription to track your spending.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="service_name">Service Name *</Label>
            <Input
              id="service_name"
              placeholder="e.g., Netflix, Spotify"
              value={formData.service_name}
              onChange={(e) =>
                setFormData({ ...formData, service_name: e.target.value })
              }
              required
            />
          </div>

          {/* Plan Name */}
          <div className="space-y-2">
            <Label htmlFor="plan_name">Plan Name *</Label>
            <Input
              id="plan_name"
              placeholder="e.g., Premium, Individual"
              value={formData.plan_name}
              onChange={(e) =>
                setFormData({ ...formData, plan_name: e.target.value })
              }
              required
            />
          </div>

          {/* Monthly Cost & Billing Cycle */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_cost">Monthly Cost (R$) *</Label>
              <Input
                id="monthly_cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.monthly_cost}
                onChange={(e) =>
                  setFormData({ ...formData, monthly_cost: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_cycle">Billing Cycle *</Label>
              <Select
                value={formData.billing_cycle}
                onValueChange={(value) =>
                  setFormData({ ...formData, billing_cycle: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_CYCLES.map((cycle) => (
                    <SelectItem key={cycle.value} value={cycle.value}>
                      {cycle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="service_category">Category *</Label>
            <Select
              value={formData.service_category}
              onValueChange={(value) =>
                setFormData({ ...formData, service_category: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              fullWidth
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              {isEditing ? 'Update' : 'Add'} Subscription
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

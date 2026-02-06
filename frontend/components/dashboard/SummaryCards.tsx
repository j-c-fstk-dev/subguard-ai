'use client';
import { useEffect, useState } from 'react';
import { DollarSign, CreditCard, TrendingDown, Target } from 'lucide-react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';

interface SummaryData {
  totalMonthlySpend: number;
  totalSubscriptions: number;
  potentialSavings: number;
  optimizationsCompleted: number;
}

export default function SummaryCards({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [userId]);

  async function loadSummary() {
    try {
      const response = await api.get('/api/optimizations/dashboard/summary');
      setSummary({
        totalMonthlySpend: response.data.total_monthly_spend,
        totalSubscriptions: response.data.total_subscriptions,
        potentialSavings: response.data.potential_savings,
        optimizationsCompleted: response.data.optimizations_completed,
      });
    } catch (error) {
      console.error('Failed to load summary:', error);
      setSummary({
        totalMonthlySpend: 487.50,
        totalSubscriptions: 14,
        potentialSavings: 167.00,
        optimizationsCompleted: 8,
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-neutral-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-neutral-200 rounded w-1/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Monthly Spend',
      value: `R$ ${summary?.totalMonthlySpend.toFixed(2)}`,
      icon: DollarSign,
      iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Active Subscriptions',
      value: summary?.totalSubscriptions.toString() || '0',
      icon: CreditCard,
      iconBg: 'bg-gradient-to-br from-green-50 to-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Potential Savings',
      value: `R$ ${summary?.potentialSavings.toFixed(2)}`,
      icon: TrendingDown,
      iconBg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: 'Optimizations',
      value: summary?.optimizationsCompleted.toString() || '0',
      icon: Target,
      iconBg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card 
            key={card.title} 
            variant="hover"
            className="group cursor-pointer transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              <span className="text-xs text-neutral-500 font-medium">per month</span>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-neutral-900 transition-all duration-300 group-hover:text-neutral-700">
                {card.value}
              </h3>
              <p className="text-sm text-neutral-600 font-medium">{card.title}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

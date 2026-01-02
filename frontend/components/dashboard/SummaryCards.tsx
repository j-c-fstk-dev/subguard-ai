'use client';

import { useEffect, useState } from 'react';
import { DollarSign, CreditCard, TrendingDown, Target } from 'lucide-react';
import { mockApi } from '@/lib/api';

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
      // Usa mock data por enquanto
      const data = await mockApi.getDashboardSummary();
      setSummary({
        totalMonthlySpend: data.total_monthly_spend,
        totalSubscriptions: data.total_subscriptions,
        potentialSavings: data.potential_savings,
        optimizationsCompleted: data.optimizations_completed,
      });
    } catch (error) {
      console.error('Failed to load summary:', error);
      // Fallback hardcoded
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Monthly Spend',
      value: `R$ ${summary?.totalMonthlySpend.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Subscriptions',
      value: summary?.totalSubscriptions.toString() || '0',
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Potential Savings',
      value: `R$ ${summary?.potentialSavings.toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Optimizations',
      value: summary?.optimizationsCompleted.toString() || '0',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <span className="text-sm text-gray-500">per month</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            <p className="text-gray-600">{card.title}</p>
          </div>
        );
      })}
    </div>
  );
}
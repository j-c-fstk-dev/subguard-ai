'use client';

import { useState } from 'react';
import { TrendingDown, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Recommendation {
  id: string;
  subscription_name: string;
  action: string;
  savings: number;
  confidence: number;
  reasoning: string;
  estimated_time: number;
}

export default function Recommendations({ userId }: { userId: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: '1',
      subscription_name: 'Netflix',
      action: 'Downgrade to Basic',
      savings: 22.00,
      confidence: 0.92,
      reasoning: 'You only use 1 screen, paying for 4 screens',
      estimated_time: 5
    },
    {
      id: '2',
      subscription_name: 'GymPass',
      action: 'Cancel subscription',
      savings: 99.90,
      confidence: 0.85,
      reasoning: 'Haven\'t used in 45 days',
      estimated_time: 3
    },
    {
      id: '3',
      subscription_name: 'Spotify',
      action: 'Switch to Family Plan',
      savings: -13.00, // Negative means cost increase but better value
      confidence: 0.78,
      reasoning: 'Share with 4 family members',
      estimated_time: 10
    }
  ]);

  const [executing, setExecuting] = useState<string | null>(null);

  const handleExecute = async (id: string) => {
    setExecuting(id);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
    setExecuting(null);
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Cancel')) return AlertCircle;
    if (action.includes('Downgrade') || action.includes('Switch')) return TrendingDown;
    return CheckCircle;
  };

  const getActionColor = (action: string) => {
    if (action.includes('Cancel')) return 'text-red-600 bg-red-50';
    if (action.includes('Downgrade')) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(amount));
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          AI Recommendations
        </h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {recommendations.length} suggestions
        </span>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => {
          const ActionIcon = getActionIcon(rec.action);
          const isSaving = rec.savings > 0;
          
          return (
            <div key={rec.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <ActionIcon className={`w-5 h-5 ${getActionColor(rec.action).split(' ')[0]}`} />
                    <h3 className="font-semibold text-gray-900">
                      {rec.subscription_name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{rec.reasoning}</p>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${isSaving ? 'text-green-600' : 'text-blue-600'}`}>
                    {isSaving ? `Save ${formatCurrency(rec.savings)}` : `+${formatCurrency(-rec.savings)} value`}
                  </div>
                  <div className="text-sm text-gray-500">
                    /month
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{rec.estimated_time} min</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${rec.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {Math.round(rec.confidence * 100)}%
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button 
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      isSaving 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    } transition`}
                    onClick={() => handleExecute(rec.id)}
                    disabled={executing === rec.id}
                  >
                    {executing === rec.id ? (
                      <span className="flex items-center">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </span>
                    ) : (
                      rec.action
                    )}
                  </button>
                  
                  <button className="px-3 py-2 text-gray-400 hover:text-gray-600">
                    ⋮
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            All Optimized! 🎉
          </h3>
          <p className="text-gray-600">
            Your subscriptions are fully optimized. We'll notify you of new opportunities.
          </p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t">
        <div className="flex justify-between items-center text-sm">
          <div className="text-gray-600">
            Total monthly savings:
          </div>
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(
              recommendations
                .filter(r => r.savings > 0)
                .reduce((sum, r) => sum + r.savings, 0)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, TrendingDown, Users, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Recommendation {
  id: string;
  subscription_id: string;
  recommendation_type: string;
  suggestion: string;
  potential_savings: number;
  confidence_score: number;
  status: string;
  service_name?: string;
}

export default function Recommendations({ userId }: { userId: string }) {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  async function loadRecommendations() {
    try {
      const response = await api.get('/api/optimizations/');
      setRecommendations(response.data.slice(0, 3)); // Top 3
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }

async function executeRecommendation(optimizationId: string, actionType: string) {
    try {
      setExecuting(optimizationId);
      await api.post(`/api/optimizations/${optimizationId}/execute`);
      
      // Recarregar recommendations
      loadRecommendations();
      
      // Se for negotiate, redirecionar
      if (actionType === 'negotiate') {
        setTimeout(() => router.push('/dashboard/negotiations'), 500);
      }
    } catch (error) {
      console.error('Failed to execute recommendation:', error);
    } finally {
      setExecuting(null);
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'cancel':
        return AlertCircle;
      case 'downgrade':
        return TrendingDown;
      case 'family_plan':
        return Users;
      default:
        return Sparkles;
    }
  };

  const getRecommendationAction = (type: string) => {
    switch (type) {
      case 'cancel':
        return 'Cancel subscription';
      case 'downgrade':
        return 'Downgrade Plan';
      case 'family_plan':
        return 'Switch to Family Plan';
      default:
        return 'Apply';
    }
  };

  const totalSavings = recommendations.reduce((sum, rec) => sum + rec.potential_savings, 0);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-100 rounded-xl"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900">AI Recommendations</h3>
        </div>
        <Badge variant="info" size="sm">
          {recommendations.length} suggestion{recommendations.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500">No recommendations yet</p>
          <p className="text-sm text-neutral-400 mt-1">Keep using your subscriptions and we'll find savings!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {recommendations.map((rec, index) => {
              const Icon = getRecommendationIcon(rec.recommendation_type);
              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 hover:shadow-md transition-all duration-300 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900">{rec.service_name || 'Subscription'}</h4>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {rec.suggestion.split('.')[0]}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success" size="sm" className="font-bold">
                      Save R$ {rec.potential_savings.toFixed(2)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-neutral-200 rounded-full h-1.5 w-16">
                        <div
                          className="bg-success-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${rec.confidence_score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-neutral-500 font-medium">
                        {rec.confidence_score}% match
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => executeRecommendation(rec.id, rec.recommendation_type)}
                      disabled={executing === rec.id}
                    >
                      {executing === rec.id ? '⏳ Processing...' : getRecommendationAction(rec.recommendation_type)}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalSavings > 0 && (
            <div className="pt-4 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 font-medium">Total monthly savings:</span>
                <span className="text-xl font-bold text-success-600">R$ {totalSavings.toFixed(2)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

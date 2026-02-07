'use client';
import { useState } from 'react';
import { X, Sparkles, TrendingDown, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { applyRecommendation } from '@/lib/subscriptions';
import { showSuccess, showError } from '@/lib/toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface AIAnalysis {
  recommendation_type: string;
  monthly_savings: number;
  confidence: number;
  reasoning: string;
  suggested_plan?: string;
  action_steps: string[];
}

interface AIAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscriptionId: string;
  currentCost: number;
  serviceName: string;
  analysis: AIAnalysis | null;
  loading?: boolean;
}

export default function AIAnalysisModal({ 
  open, 
  onClose,
  onSuccess,
  subscriptionId,
  currentCost,
  serviceName, 
  analysis,
  loading = false
}: AIAnalysisModalProps) {
  if (!open) return null;

const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (!analysis) return;
    
    setApplying(true);
    try {
      await applyRecommendation(subscriptionId, {
        action: analysis.recommendation_type,
        suggested_plan: analysis.suggested_plan,
        new_cost: analysis.monthly_savings > 0 
          ? currentCost - analysis.monthly_savings 
          : currentCost,
        savings: analysis.monthly_savings
      });
      
      showSuccess(`✅ Recommendation applied successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      showError('Failed to apply recommendation');
    } finally {
      setApplying(false);
    }
  };

  const getSavingsBadge = () => {
    if (!analysis) return null;
    if (analysis.monthly_savings > 0) {
      return (
        <Badge variant="success" size="lg" className="text-base font-bold">
          💰 Save R$ {analysis.monthly_savings.toFixed(2)}/month
        </Badge>
      );
    }
    return (
      <Badge variant="info" size="lg" className="text-base font-bold">
        ✅ Keep Current Plan
      </Badge>
    );
  };

  const getRecommendationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'downgrade':
        return <TrendingDown className="w-6 h-6 text-warning-600" />;
      case 'cancel':
        return <AlertCircle className="w-6 h-6 text-danger-600" />;
      case 'keep':
        return <CheckCircle className="w-6 h-6 text-success-600" />;
      default:
        return <Target className="w-6 h-6 text-primary-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl"
        padding="none"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Analysis</h2>
                <p className="text-primary-100 mt-1">{serviceName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
              <p className="text-neutral-600">Analyzing subscription...</p>
              <p className="text-sm text-neutral-500 mt-2">This may take a few seconds</p>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Savings Badge */}
              <div className="flex justify-center">
                {getSavingsBadge()}
              </div>

              {/* Recommendation */}
              <div className="bg-gradient-to-br from-neutral-50 to-white border border-neutral-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  {getRecommendationIcon(analysis.recommendation_type)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 text-lg mb-1">
                      Recommendation
                    </h3>
                    <p className="text-neutral-600 capitalize">
                      {analysis.recommendation_type.replace('_', ' ')}
                    </p>
                  </div>
                  <Badge variant="info" size="sm">
                    {(analysis.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  Why this recommendation?
                </h3>
                <p className="text-neutral-700 leading-relaxed bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                  {analysis.reasoning}
                </p>
              </div>

              {/* Suggested Plan */}
              {analysis.suggested_plan && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                  <h3 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
                    <span>📋</span>
                    Suggested Plan
                  </h3>
                  <p className="text-primary-700 font-medium">
                    {analysis.suggested_plan}
                  </p>
                </div>
              )}

              {/* Action Steps */}
              {analysis.action_steps.length > 0 && (
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    Next Steps
                  </h3>
                  <div className="space-y-3">
                    {analysis.action_steps.map((step, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 bg-neutral-50 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-neutral-700 pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">No analysis available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4 rounded-b-xl flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {analysis && analysis.monthly_savings > 0 && (
            <Button 
              variant="success" 
              onClick={handleApply}
              loading={applying}
              disabled={applying}
            >
    {applying ? 'Applying...' : 'Apply Recommendation'}
  </Button>
)}
        </div>
      </Card>
    </div>
  );
}

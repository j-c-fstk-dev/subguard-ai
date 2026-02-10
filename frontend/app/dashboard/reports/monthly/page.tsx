'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Calendar,
  CheckCircle,
  Activity,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { MonthlyReport } from '@/lib/types/reports';
import { getMonthlyReport as fetchMonthlyReport } from '@/lib/reportsWrapper';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function MonthlyReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    try {
      setLoading(true);
      const data = await fetchMonthlyReport();
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  }

  async function exportToPDF() {
    setExporting(true);
    try {
      // Usar window.print() para gerar PDF
      window.print();
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading monthly report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">No Report Available</h2>
          <p className="text-neutral-600 mb-6">Unable to generate monthly report</p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const spendChange = report.previous_month_comparison?.spend_change || 0;
  const spendChangePercent = report.previous_month_comparison?.spend_change_percent || 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header - Hidden on print */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Monthly Report</h1>
            <p className="text-neutral-600 mt-1">
              {report.month} {report.year}
            </p>
          </div>
        </div>

        <Button onClick={exportToPDF} disabled={exporting}>
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export PDF
        </Button>
      </div>

      {/* Print Header - Only visible on print */}
      <div className="hidden print:block mb-8 pb-4 border-b border-neutral-200">
        <h1 className="text-3xl font-bold text-neutral-900">Subscription Management Report</h1>
        <p className="text-neutral-600 mt-2">{report.month} {report.year}</p>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="gradient">
          <CardContent className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Monthly Spend</p>
              <p className="text-3xl font-bold text-neutral-900">
                ${report.total_monthly_spend.toFixed(2)}
              </p>
              {report.previous_month_comparison && (
                <div className="flex items-center gap-1 mt-2">
                  {spendChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-danger-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-success-600" />
                  )}
                  <span className={`text-sm font-medium ${spendChange >= 0 ? 'text-danger-600' : 'text-success-600'}`}>
                    {Math.abs(spendChangePercent).toFixed(1)}% vs last month
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Active Subscriptions</p>
              <p className="text-3xl font-bold text-neutral-900">
                {report.active_subscriptions}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Savings</p>
              <p className="text-3xl font-bold text-success-600">
                ${report.total_savings.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-success-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Negotiations</p>
              <p className="text-3xl font-bold text-neutral-900">
                {report.negotiations_completed}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Completed</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending by Category */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(report.spending_by_category)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const percentage = (amount / report.total_monthly_spend) * 100;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700 capitalize">
                        {category}
                      </span>
                      <span className="text-sm font-semibold text-neutral-900">
                        ${amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{percentage.toFixed(1)}% of total</p>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Active Subscriptions ({report.active_subscriptions})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Category</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">Monthly Cost</th>
                </tr>
              </thead>
              <tbody>
                {report.active_subscriptions_list.map((sub) => (
                  <tr key={sub.id} className="border-b border-neutral-100">
                    <td className="py-3 px-4 text-sm font-medium text-neutral-900">{sub.service_name}</td>
                    <td className="py-3 px-4 text-sm text-neutral-600">{sub.plan_name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="info" size="sm">{sub.category}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-right text-neutral-900">
                      ${sub.monthly_cost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Activities Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Activities This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(report.activities_summary).map(([type, count]) => (
              <div key={type} className="text-center p-4 bg-neutral-50 rounded-lg">
                <p className="text-2xl font-bold text-neutral-900">{count}</p>
                <p className="text-xs text-neutral-600 mt-1 capitalize">
                  {type.replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-neutral-700 mb-3">Recent Activities</h4>
            {report.recent_activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                <Activity className="w-5 h-5 text-primary-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-neutral-600 mt-1">{activity.description}</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Negotiations Summary */}
      {report.negotiations_summary.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Negotiations Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{report.negotiations_summary.total}</p>
                <p className="text-sm text-neutral-600 mt-1">Total Negotiations</p>
              </div>
              <div className="text-center p-4 bg-success-50 rounded-lg">
                <p className="text-3xl font-bold text-success-600">{report.negotiations_summary.completed}</p>
                <p className="text-sm text-neutral-600 mt-1">Completed</p>
              </div>
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <p className="text-3xl font-bold text-primary-600">
                  ${report.negotiations_summary.total_savings.toFixed(2)}
                </p>
                <p className="text-sm text-neutral-600 mt-1">Total Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Print Footer */}
      <div className="hidden print:block mt-8 pt-4 border-t border-neutral-200 text-center text-sm text-neutral-500">
        <p>Generated on {new Date().toLocaleDateString()} • SubGuard AI</p>
      </div>
    </div>
  );
}
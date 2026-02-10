export interface MonthlyReport {
  total_monthly_spend: number;
  active_subscriptions: number;
  total_savings: number;
  negotiations_completed: number;
  month: string;
  year: number;
  spending_by_category: Record<string, number>;
  active_subscriptions_list: Array<{
    id: string;
    service_name: string;
    plan_name: string;
    monthly_cost: number;
    category: string;
    status: string;
  }>;
  activities_summary: Record<string, number>;
  recent_activities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    created_at: string;
  }>;
  negotiations_summary: {
    total: number;
    completed: number;
    in_progress: number;
    total_savings: number;
  };
  previous_month_comparison: {
    previous_month: number;
    previous_year: number;
    previous_spend: number;
    spend_change: number;
    spend_change_percent: number;
  } | null;
}

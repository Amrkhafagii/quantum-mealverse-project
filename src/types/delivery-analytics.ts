
export interface DeliveryEarningsDetailed {
  id: string;
  delivery_user_id: string;
  order_id?: string;
  assignment_id?: string;
  base_fee: number;
  distance_fee: number;
  time_fee: number;
  surge_multiplier: number;
  tip_amount: number;
  bonus_amount: number;
  penalty_amount: number;
  total_earnings: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'disputed';
  payment_method: string;
  payout_batch_id?: string;
  earned_at: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAnalyticsDaily {
  id: string;
  delivery_user_id: string;
  date: string;
  total_deliveries: number;
  completed_deliveries: number;
  cancelled_deliveries: number;
  total_earnings: number;
  total_tips: number;
  total_bonuses: number;
  average_delivery_time: number;
  total_distance_km: number;
  online_time_minutes: number;
  peak_hours_worked: number;
  customer_ratings: any[];
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryPerformanceMetrics {
  id: string;
  delivery_user_id: string;
  metric_date: string;
  acceptance_rate: number;
  completion_rate: number;
  on_time_rate: number;
  cancellation_rate: number;
  earnings_per_hour: number;
  earnings_per_delivery: number;
  total_hours_worked: number;
  efficiency_score: number;
  customer_satisfaction: number;
  penalties_count: number;
  bonuses_earned: number;
  peak_hours_bonus: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryWeeklySummary {
  id: string;
  delivery_user_id: string;
  week_start_date: string;
  week_end_date: string;
  total_earnings: number;
  total_deliveries: number;
  total_hours: number;
  average_hourly_rate: number;
  best_day_earnings: number;
  best_day_date?: string;
  total_tips: number;
  total_bonuses: number;
  efficiency_rating: number;
  goal_achievement_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryFinancialReport {
  id: string;
  delivery_user_id: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  gross_earnings: number;
  net_earnings: number;
  total_tips: number;
  total_bonuses: number;
  total_penalties: number;
  tax_deductions: number;
  expenses: number;
  delivery_count: number;
  hours_worked: number;
  fuel_costs: number;
  maintenance_costs: number;
  performance_metrics: Record<string, any>;
  generated_at: string;
  created_at: string;
}

export interface EarningsSummaryData {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalDeliveries: number;
  averageRating: number;
  totalHours: number;
  earningsPerHour: number;
  completionRate: number;
}

export interface PerformanceTrend {
  date: string;
  earnings: number;
  deliveries: number;
  rating: number;
  efficiency: number;
}

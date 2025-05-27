
import { supabase } from '@/integrations/supabase/client';
import type {
  DeliveryEarningsDetailed,
  DeliveryAnalyticsDaily,
  DeliveryPerformanceMetrics,
  DeliveryWeeklySummary,
  DeliveryFinancialReport,
  EarningsSummaryData,
  PerformanceTrend
} from '@/types/delivery-analytics';

class DeliveryAnalyticsService {
  // Earnings Methods
  async getDetailedEarnings(
    deliveryUserId: string,
    startDate?: string,
    endDate?: string,
    limit = 50
  ): Promise<DeliveryEarningsDetailed[]> {
    let query = supabase
      .from('delivery_earnings_detailed')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .order('earned_at', { ascending: false })
      .limit(limit);

    if (startDate) query = query.gte('earned_at', startDate);
    if (endDate) query = query.lte('earned_at', endDate);

    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'pending' | 'processing' | 'paid' | 'disputed'
    }));
  }

  async createEarningsRecord(earnings: Omit<DeliveryEarningsDetailed, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryEarningsDetailed> {
    const { data, error } = await supabase
      .from('delivery_earnings_detailed')
      .insert(earnings)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      status: data.status as 'pending' | 'processing' | 'paid' | 'disputed'
    };
  }

  // Daily Analytics
  async getDailyAnalytics(
    deliveryUserId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DeliveryAnalyticsDaily[]> {
    let query = supabase
      .from('delivery_analytics_daily')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .order('date', { ascending: false });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map(item => ({
      ...item,
      customer_ratings: Array.isArray(item.customer_ratings) 
        ? item.customer_ratings 
        : JSON.parse(item.customer_ratings as string || '[]')
    }));
  }

  async calculateDailyAnalytics(deliveryUserId: string, date: string): Promise<void> {
    const { error } = await supabase.rpc('calculate_delivery_daily_analytics', {
      p_delivery_user_id: deliveryUserId,
      p_date: date
    });

    if (error) throw error;
  }

  // Performance Metrics
  async getPerformanceMetrics(
    deliveryUserId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DeliveryPerformanceMetrics[]> {
    let query = supabase
      .from('delivery_performance_metrics')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .order('metric_date', { ascending: false });

    if (startDate) query = query.gte('metric_date', startDate);
    if (endDate) query = query.lte('metric_date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async updatePerformanceMetrics(
    deliveryUserId: string,
    date: string,
    metrics: Partial<Omit<DeliveryPerformanceMetrics, 'id' | 'delivery_user_id' | 'metric_date' | 'created_at' | 'updated_at'>>
  ): Promise<DeliveryPerformanceMetrics> {
    const { data, error } = await supabase
      .from('delivery_performance_metrics')
      .upsert({
        delivery_user_id: deliveryUserId,
        metric_date: date,
        ...metrics
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Weekly Summaries
  async getWeeklySummaries(
    deliveryUserId: string,
    limit = 12
  ): Promise<DeliveryWeeklySummary[]> {
    const { data, error } = await supabase
      .from('delivery_weekly_summaries')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .order('week_start_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async generateWeeklySummary(deliveryUserId: string, weekStartDate: string): Promise<void> {
    const { error } = await supabase.rpc('generate_weekly_summary', {
      p_delivery_user_id: deliveryUserId,
      p_week_start: weekStartDate
    });

    if (error) throw error;
  }

  // Financial Reports
  async getFinancialReports(
    deliveryUserId: string,
    reportType?: string,
    limit = 10
  ): Promise<DeliveryFinancialReport[]> {
    let query = supabase
      .from('delivery_financial_reports')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .order('period_start', { ascending: false })
      .limit(limit);

    if (reportType) query = query.eq('report_type', reportType);

    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map(item => ({
      ...item,
      report_type: item.report_type as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
      performance_metrics: typeof item.performance_metrics === 'string' 
        ? JSON.parse(item.performance_metrics) 
        : (item.performance_metrics || {})
    }));
  }

  async generateFinancialReport(
    deliveryUserId: string,
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    periodStart: string,
    periodEnd: string
  ): Promise<DeliveryFinancialReport> {
    // Get all earnings for the period
    const earnings = await this.getDetailedEarnings(deliveryUserId, periodStart, periodEnd);
    const dailyAnalytics = await this.getDailyAnalytics(deliveryUserId, periodStart, periodEnd);
    const performanceMetrics = await this.getPerformanceMetrics(deliveryUserId, periodStart, periodEnd);

    // Calculate report data
    const grossEarnings = earnings.reduce((sum, e) => sum + e.total_earnings, 0);
    const totalTips = earnings.reduce((sum, e) => sum + e.tip_amount, 0);
    const totalBonuses = earnings.reduce((sum, e) => sum + e.bonus_amount, 0);
    const totalPenalties = earnings.reduce((sum, e) => sum + e.penalty_amount, 0);
    const netEarnings = grossEarnings - totalPenalties;
    const deliveryCount = earnings.length;
    const hoursWorked = performanceMetrics.reduce((sum, m) => sum + m.total_hours_worked, 0);

    const reportData = {
      delivery_user_id: deliveryUserId,
      report_type: reportType,
      period_start: periodStart,
      period_end: periodEnd,
      gross_earnings: grossEarnings,
      net_earnings: netEarnings,
      total_tips: totalTips,
      total_bonuses: totalBonuses,
      total_penalties: totalPenalties,
      tax_deductions: 0, // To be calculated based on tax rules
      expenses: 0, // To be populated from expense tracking
      delivery_count: deliveryCount,
      hours_worked: hoursWorked,
      fuel_costs: 0, // To be calculated from vehicle data
      maintenance_costs: 0, // To be calculated from vehicle data
      performance_metrics: {
        averageRating: performanceMetrics.reduce((sum, m) => sum + m.customer_satisfaction, 0) / Math.max(performanceMetrics.length, 1),
        completionRate: performanceMetrics.reduce((sum, m) => sum + m.completion_rate, 0) / Math.max(performanceMetrics.length, 1),
        onTimeRate: performanceMetrics.reduce((sum, m) => sum + m.on_time_rate, 0) / Math.max(performanceMetrics.length, 1),
        efficiencyScore: performanceMetrics.reduce((sum, m) => sum + m.efficiency_score, 0) / Math.max(performanceMetrics.length, 1)
      }
    };

    const { data, error } = await supabase
      .from('delivery_financial_reports')
      .upsert(reportData)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      report_type: data.report_type as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
      performance_metrics: typeof data.performance_metrics === 'string' 
        ? JSON.parse(data.performance_metrics) 
        : (data.performance_metrics || {})
    };
  }

  // Summary Data
  async getEarningsSummary(deliveryUserId: string): Promise<EarningsSummaryData> {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date();
    monthStart.setDate(1);

    const [todayData, weekData, monthData] = await Promise.all([
      this.getDailyAnalytics(deliveryUserId, today, today),
      this.getDailyAnalytics(deliveryUserId, weekStart.toISOString().split('T')[0]),
      this.getDailyAnalytics(deliveryUserId, monthStart.toISOString().split('T')[0])
    ]);

    const todayEarnings = todayData.reduce((sum, d) => sum + d.total_earnings, 0);
    const weekEarnings = weekData.reduce((sum, d) => sum + d.total_earnings, 0);
    const monthEarnings = monthData.reduce((sum, d) => sum + d.total_earnings, 0);
    const totalDeliveries = monthData.reduce((sum, d) => sum + d.total_deliveries, 0);
    const averageRating = monthData.reduce((sum, d) => sum + d.average_rating, 0) / Math.max(monthData.length, 1);
    const totalHours = weekData.reduce((sum, d) => sum + d.online_time_minutes, 0) / 60;
    const earningsPerHour = totalHours > 0 ? weekEarnings / totalHours : 0;
    const completionRate = monthData.reduce((sum, d) => sum + (d.total_deliveries > 0 ? d.completed_deliveries / d.total_deliveries * 100 : 0), 0) / Math.max(monthData.length, 1);

    return {
      todayEarnings,
      weekEarnings,
      monthEarnings,
      totalDeliveries,
      averageRating,
      totalHours,
      earningsPerHour,
      completionRate
    };
  }

  // Performance Trends
  async getPerformanceTrends(
    deliveryUserId: string,
    days = 30
  ): Promise<PerformanceTrend[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyData = await this.getDailyAnalytics(
      deliveryUserId,
      startDate.toISOString().split('T')[0]
    );

    return dailyData.map(day => ({
      date: day.date,
      earnings: day.total_earnings,
      deliveries: day.total_deliveries,
      rating: day.average_rating,
      efficiency: day.total_deliveries > 0 ? day.total_earnings / day.total_deliveries : 0
    }));
  }
}

export const deliveryAnalyticsService = new DeliveryAnalyticsService();

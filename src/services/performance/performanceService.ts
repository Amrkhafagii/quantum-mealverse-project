
import { supabase } from '@/integrations/supabase/client';
import type { RestaurantPerformanceMetrics } from '@/types/notifications';

export class PerformanceService {
  // Get performance metrics for a date range
  async getPerformanceMetrics(
    restaurantId: string,
    startDate: string,
    endDate: string
  ): Promise<RestaurantPerformanceMetrics[]> {
    const { data, error } = await supabase
      .from('restaurant_performance_metrics')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(metric => ({
      ...metric,
      peak_hours: this.parsePeakHours(metric.peak_hours)
    }));
  }

  // Get today's performance metrics
  async getTodayMetrics(restaurantId: string): Promise<RestaurantPerformanceMetrics | null> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('restaurant_performance_metrics')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('metric_date', today)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    
    return {
      ...data,
      peak_hours: this.parsePeakHours(data.peak_hours)
    };
  }

  // Helper function to parse peak hours from JSON
  private parsePeakHours(peakHours: any): any[] {
    if (Array.isArray(peakHours)) {
      return peakHours;
    }
    if (typeof peakHours === 'string') {
      try {
        const parsed = JSON.parse(peakHours);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  // Get weekly summary
  async getWeeklySummary(restaurantId: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    completionRate: number;
  }> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const startDate = weekAgo.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    const metrics = await this.getPerformanceMetrics(restaurantId, startDate, endDate);

    const summary = metrics.reduce(
      (acc, metric) => ({
        totalOrders: acc.totalOrders + metric.total_orders,
        totalRevenue: acc.totalRevenue + metric.total_revenue,
        averageRating: (acc.averageRating + metric.average_rating) / 2,
        completionRate: (acc.completionRate + 
          (metric.total_orders > 0 ? (metric.completed_orders / metric.total_orders) * 100 : 0)) / 2
      }),
      { totalOrders: 0, totalRevenue: 0, averageRating: 0, completionRate: 0 }
    );

    return {
      totalOrders: summary.totalOrders,
      totalRevenue: Number(summary.totalRevenue.toFixed(2)),
      averageRating: Number(summary.averageRating.toFixed(1)),
      completionRate: Number(summary.completionRate.toFixed(1))
    };
  }

  // Update metrics manually (useful for real-time updates)
  async updateMetrics(restaurantId: string, date?: string): Promise<void> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { error } = await supabase.rpc('update_restaurant_performance_metrics', {
      p_restaurant_id: restaurantId,
      p_date: targetDate
    });

    if (error) throw error;
  }

  // Get peak hours analysis
  async getPeakHoursAnalysis(restaurantId: string, days = 7): Promise<Record<string, number>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('orders')
      .select('created_at')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', startDate.toISOString())
      .eq('status', 'delivered');

    if (error) throw error;

    const hourCounts: Record<string, number> = {};
    
    data?.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      const hourKey = `${hour}:00`;
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    });

    return hourCounts;
  }
}

export const performanceService = new PerformanceService();


import { supabase } from '@/integrations/supabase/client';

export interface RestaurantAnalytics {
  id: string;
  restaurant_id: string;
  date: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  order_completion_rate: number;
  average_preparation_time: number;
  customer_satisfaction_score: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSummary {
  todayOrders: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  orderCompletionRate: number;
  customerSatisfactionScore: number;
  totalMenuItems: number;
}

export const restaurantAnalyticsService = {
  async getAnalyticsSummary(restaurantId: string): Promise<AnalyticsSummary> {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);

    // Get today's orders
    const { data: todayData } = await supabase
      .from('restaurant_analytics')
      .select('total_orders')
      .eq('restaurant_id', restaurantId)
      .eq('date', today)
      .single();

    // Get weekly revenue
    const { data: weeklyData } = await supabase
      .from('restaurant_analytics')
      .select('total_revenue')
      .eq('restaurant_id', restaurantId)
      .gte('date', weekStart.toISOString().split('T')[0]);

    // Get monthly data for averages
    const { data: monthlyData } = await supabase
      .from('restaurant_analytics')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .gte('date', monthStart.toISOString().split('T')[0]);

    // Get menu items count
    const { count: menuItemsCount } = await supabase
      .from('restaurant_menu_items')
      .select('id', { count: 'exact' })
      .eq('restaurant_id', restaurantId);

    const weeklyRevenue = weeklyData?.reduce((sum, day) => sum + (day.total_revenue || 0), 0) || 0;
    const monthlyRevenue = monthlyData?.reduce((sum, day) => sum + (day.total_revenue || 0), 0) || 0;
    const avgOrderValue = monthlyData?.length ? 
      monthlyData.reduce((sum, day) => sum + (day.average_order_value || 0), 0) / monthlyData.length : 0;
    const avgCompletionRate = monthlyData?.length ?
      monthlyData.reduce((sum, day) => sum + (day.order_completion_rate || 0), 0) / monthlyData.length : 0;
    const avgSatisfactionScore = monthlyData?.length ?
      monthlyData.reduce((sum, day) => sum + (day.customer_satisfaction_score || 0), 0) / monthlyData.length : 0;

    return {
      todayOrders: todayData?.total_orders || 0,
      weeklyRevenue,
      monthlyRevenue,
      averageOrderValue: avgOrderValue,
      orderCompletionRate: avgCompletionRate,
      customerSatisfactionScore: avgSatisfactionScore,
      totalMenuItems: menuItemsCount || 0
    };
  },

  async getDailyAnalytics(restaurantId: string, days: number = 30): Promise<RestaurantAnalytics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('restaurant_analytics')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createOrUpdateAnalytics(restaurantId: string, date: string, analytics: Partial<RestaurantAnalytics>): Promise<RestaurantAnalytics> {
    const { data, error } = await supabase
      .from('restaurant_analytics')
      .upsert({
        restaurant_id: restaurantId,
        date,
        ...analytics,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'restaurant_id,date'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

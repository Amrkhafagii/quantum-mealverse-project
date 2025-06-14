
import { supabase } from '@/integrations/supabase/client';

export interface RestaurantPerformanceMetrics {
  total_orders: number;
  average_rating: number;
  total_revenue: number;
  order_fulfillment_time: number;
  customer_satisfaction: number;
  menu_item_popularity: any[];
}

export const getRestaurantPerformanceMetrics = async (restaurantId: string): Promise<RestaurantPerformanceMetrics | null> => {
  try {
    console.log('Fetching performance metrics for restaurant:', restaurantId);
    
    // Mock data for now
    return {
      total_orders: 0,
      average_rating: 0,
      total_revenue: 0,
      order_fulfillment_time: 0,
      customer_satisfaction: 0,
      menu_item_popularity: []
    };
  } catch (error) {
    console.error('Error fetching restaurant performance metrics:', error);
    return null;
  }
};

export const getTodayMetrics = async (restaurantId: string): Promise<RestaurantPerformanceMetrics | null> => {
  try {
    console.log('Fetching today metrics for restaurant:', restaurantId);
    
    // Mock data for now
    return {
      total_orders: 15,
      average_rating: 4.5,
      total_revenue: 850,
      order_fulfillment_time: 25,
      customer_satisfaction: 92,
      menu_item_popularity: []
    };
  } catch (error) {
    console.error('Error fetching today metrics:', error);
    return null;
  }
};

export const getWeeklySummary = async (restaurantId: string): Promise<RestaurantPerformanceMetrics | null> => {
  try {
    console.log('Fetching weekly summary for restaurant:', restaurantId);
    
    // Mock data for now
    return {
      total_orders: 95,
      average_rating: 4.3,
      total_revenue: 5200,
      order_fulfillment_time: 28,
      customer_satisfaction: 89,
      menu_item_popularity: []
    };
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    return null;
  }
};

export const getPeakHoursAnalysis = async (restaurantId: string): Promise<any> => {
  try {
    console.log('Fetching peak hours analysis for restaurant:', restaurantId);
    
    // Mock data for now
    return {
      peak_hours: [
        { hour: 12, orders: 8 },
        { hour: 13, orders: 12 },
        { hour: 18, orders: 15 },
        { hour: 19, orders: 20 },
        { hour: 20, orders: 18 }
      ],
      busiest_day: 'Saturday',
      average_orders_per_hour: 6.5
    };
  } catch (error) {
    console.error('Error fetching peak hours analysis:', error);
    return null;
  }
};

export const updateRestaurantPerformanceMetrics = async (restaurantId: string, metrics: Partial<RestaurantPerformanceMetrics>) => {
  try {
    console.log('Updating restaurant performance metrics:', restaurantId, metrics);
    return { success: true };
  } catch (error) {
    console.error('Error updating restaurant performance metrics:', error);
    return { success: false, error: 'Failed to update metrics' };
  }
};

export const calculateRestaurantPerformanceScore = async (restaurantId: string): Promise<number> => {
  try {
    const metrics = await getRestaurantPerformanceMetrics(restaurantId);
    if (!metrics) return 0;
    
    // Simple calculation based on available metrics
    const score = (
      (metrics.average_rating / 5) * 0.3 +
      (metrics.customer_satisfaction / 100) * 0.3 +
      (Math.min(metrics.total_orders / 100, 1)) * 0.4
    ) * 100;
    
    return Math.round(score);
  } catch (error) {
    console.error('Error calculating performance score:', error);
    return 0;
  }
};

export const performanceService = {
  getRestaurantPerformanceMetrics,
  getTodayMetrics,
  getWeeklySummary,
  getPeakHoursAnalysis,
  updateRestaurantPerformanceMetrics,
  calculateRestaurantPerformanceScore
};

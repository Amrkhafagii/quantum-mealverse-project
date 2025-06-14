
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
  updateRestaurantPerformanceMetrics,
  calculateRestaurantPerformanceScore
};

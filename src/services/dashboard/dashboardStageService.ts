
import { supabase } from '@/integrations/supabase/client';

export interface OrderWithStages {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  order_status: string;
  total: number;
  created_at: string;
  stage_id: string;
  stage_name: string;
  stage_status: string;
  stage_order: number;
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  stage_started_at?: string;
  stage_completed_at?: string;
  stage_notes?: string;
  overall_progress: number;
}

export interface GroupedOrder {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  order_status: string;
  total: number;
  created_at: string;
  overall_progress: number;
  stages: Array<{
    stage_id: string;
    stage_name: string;
    stage_status: string;
    stage_order: number;
    estimated_duration_minutes: number;
    actual_duration_minutes?: number;
    stage_started_at?: string;
    stage_completed_at?: string;
    stage_notes?: string;
  }>;
}

export class DashboardStageService {
  /**
   * Get all orders with their preparation stages for a restaurant
   */
  static async getRestaurantOrdersWithStages(restaurantId: string): Promise<GroupedOrder[]> {
    const { data, error } = await supabase.rpc('get_restaurant_orders_with_stages', {
      p_restaurant_id: restaurantId
    });

    if (error) {
      console.error('Error fetching orders with stages:', error);
      throw error;
    }

    // Group stages by order
    const ordersMap = new Map<string, GroupedOrder>();
    
    (data as OrderWithStages[]).forEach(row => {
      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          order_id: row.order_id,
          customer_name: row.customer_name,
          customer_phone: row.customer_phone,
          delivery_address: row.delivery_address,
          order_status: row.order_status,
          total: row.total,
          created_at: row.created_at,
          overall_progress: row.overall_progress,
          stages: []
        });
      }

      const order = ordersMap.get(row.order_id)!;
      if (row.stage_id) {
        order.stages.push({
          stage_id: row.stage_id,
          stage_name: row.stage_name,
          stage_status: row.stage_status,
          stage_order: row.stage_order,
          estimated_duration_minutes: row.estimated_duration_minutes,
          actual_duration_minutes: row.actual_duration_minutes,
          stage_started_at: row.stage_started_at,
          stage_completed_at: row.stage_completed_at,
          stage_notes: row.stage_notes
        });
      }
    });

    // Sort stages within each order
    Array.from(ordersMap.values()).forEach(order => {
      order.stages.sort((a, b) => a.stage_order - b.stage_order);
    });

    return Array.from(ordersMap.values());
  }

  /**
   * Get current active stage for an order
   */
  static async getCurrentActiveStage(orderId: string) {
    const { data, error } = await supabase.rpc('get_current_active_stage', {
      p_order_id: orderId
    });

    if (error) {
      console.error('Error fetching current stage:', error);
      throw error;
    }

    return data?.[0] || null;
  }
}

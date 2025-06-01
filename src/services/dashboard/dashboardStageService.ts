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
   * Updated to handle new assignment flow
   */
  static async getRestaurantOrdersWithStages(restaurantId: string): Promise<GroupedOrder[]> {
    console.log('Fetching orders with stages for restaurant:', restaurantId);

    // Get orders that are either assigned to this restaurant OR preparing/ready
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        customer_phone,
        delivery_address,
        status,
        total,
        created_at,
        restaurant_id,
        order_preparation_stages (
          id,
          stage_name,
          status,
          stage_order,
          estimated_duration_minutes,
          actual_duration_minutes,
          started_at,
          completed_at,
          notes
        )
      `)
      .or(`restaurant_id.eq.${restaurantId},and(status.in.(preparing,ready_for_pickup),restaurant_id.is.null)`)
      .in('status', ['restaurant_accepted', 'preparing', 'ready_for_pickup'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders with stages:', error);
      throw error;
    }

    console.log('Raw data fetched:', data);

    // Transform the data to match our interface
    const groupedOrders: GroupedOrder[] = (data || []).map(order => {
      const stages = (order.order_preparation_stages || []).map(stage => ({
        stage_id: stage.id,
        stage_name: stage.stage_name,
        stage_status: stage.status,
        stage_order: stage.stage_order,
        estimated_duration_minutes: stage.estimated_duration_minutes,
        actual_duration_minutes: stage.actual_duration_minutes,
        stage_started_at: stage.started_at,
        stage_completed_at: stage.completed_at,
        stage_notes: stage.notes
      }));

      // Calculate overall progress
      const completedStages = stages.filter(s => s.stage_status === 'completed').length;
      const totalStages = stages.length;
      const overall_progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

      return {
        order_id: order.id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        delivery_address: order.delivery_address,
        order_status: order.status,
        total: order.total,
        created_at: order.created_at,
        overall_progress,
        stages: stages.sort((a, b) => a.stage_order - b.stage_order)
      };
    });

    console.log('Grouped orders:', groupedOrders);
    return groupedOrders;
  }

  /**
   * Get current active stage for an order
   */
  static async getCurrentActiveStage(orderId: string) {
    const { data, error } = await supabase
      .from('order_preparation_stages')
      .select('*')
      .eq('order_id', orderId)
      .eq('status', 'in_progress')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching current stage:', error);
      throw error;
    }

    return data || null;
  }

  /**
   * Advance to next preparation stage
   */
  static async advanceToNextStage(orderId: string, currentStageName: string): Promise<boolean> {
    try {
      console.log('Advancing stage for order:', orderId, 'from stage:', currentStageName);

      // Complete current stage
      const { error: completeError } = await supabase
        .from('order_preparation_stages')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          actual_duration_minutes: 0 // Calculate based on started_at if needed
        })
        .eq('order_id', orderId)
        .eq('stage_name', currentStageName);

      if (completeError) {
        console.error('Error completing current stage:', completeError);
        return false;
      }

      // Get next stage
      const { data: nextStage, error: nextError } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('order_id', orderId)
        .eq('status', 'pending')
        .order('stage_order', { ascending: true })
        .limit(1)
        .single();

      if (nextError || !nextStage) {
        // No more stages, mark order as ready
        await supabase
          .from('orders')
          .update({ status: 'ready_for_pickup' })
          .eq('id', orderId);
        
        console.log('Order marked as ready for pickup');
        return true;
      }

      // Start next stage
      const { error: startError } = await supabase
        .from('order_preparation_stages')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', nextStage.id);

      if (startError) {
        console.error('Error starting next stage:', startError);
        return false;
      }

      console.log('Successfully advanced to next stage:', nextStage.stage_name);
      return true;
    } catch (error) {
      console.error('Error in advanceToNextStage:', error);
      return false;
    }
  }

  /**
   * Data validation and cleanup for preparation stages
   * Fixed UUID syntax error by properly constructing the query
   */
  static async validateAndCleanupPreparationData(restaurantId: string): Promise<{
    cleaned: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let cleaned = 0;

    try {
      // 1. Find orphaned preparation stages (stages without valid orders)
      // Fixed: Get valid order IDs first, then use them properly in the query
      const { data: validOrders } = await supabase
        .from('orders')
        .select('id');

      if (!validOrders || validOrders.length === 0) {
        return { cleaned: 0, errors: ['No valid orders found'] };
      }

      // Extract UUID values without quotes for the not.in filter
      const validOrderIds = validOrders.map(o => o.id);

      const { data: orphanedStages, error: orphanError } = await supabase
        .from('order_preparation_stages')
        .select('id, order_id')
        .eq('restaurant_id', restaurantId)
        .not('order_id', 'in', `(${validOrderIds.join(',')})`);

      if (orphanError) {
        errors.push(`Error finding orphaned stages: ${orphanError.message}`);
      } else if (orphanedStages?.length) {
        const { error: deleteError } = await supabase
          .from('order_preparation_stages')
          .delete()
          .in('id', orphanedStages.map(s => s.id));

        if (deleteError) {
          errors.push(`Error cleaning orphaned stages: ${deleteError.message}`);
        } else {
          cleaned += orphanedStages.length;
          console.log(`Cleaned ${orphanedStages.length} orphaned preparation stages`);
        }
      }

      // 2. Fix inconsistent stage statuses
      const { data: inconsistentOrders, error: inconsistentError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          order_preparation_stages!inner(id, status, stage_name)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'preparing');

      if (inconsistentError) {
        errors.push(`Error finding inconsistent orders: ${inconsistentError.message}`);
      } else if (inconsistentOrders?.length) {
        for (const order of inconsistentOrders) {
          const stages = order.order_preparation_stages;
          const hasInProgress = stages.some((s: any) => s.status === 'in_progress');
          
          if (!hasInProgress) {
            // Start the first pending stage
            const firstPending = stages
              .filter((s: any) => s.status === 'pending')
              .sort((a: any, b: any) => a.stage_order - b.stage_order)[0];

            if (firstPending) {
              await supabase
                .from('order_preparation_stages')
                .update({
                  status: 'in_progress',
                  started_at: new Date().toISOString()
                })
                .eq('id', firstPending.id);
              
              cleaned++;
            }
          }
        }
      }

      return { cleaned, errors };
    } catch (error) {
      errors.push(`Unexpected error during cleanup: ${error}`);
      return { cleaned, errors };
    }
  }
}

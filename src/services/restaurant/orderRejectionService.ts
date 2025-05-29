
import { supabase } from '@/integrations/supabase/client';

export interface OrderRejection {
  id: string;
  order_id: string;
  restaurant_id: string;
  assignment_id?: string;
  rejection_reason: string;
  rejection_details?: string;
  rejected_at: string;
}

export const orderRejectionService = {
  /**
   * Reject an order assignment with automatic reassignment
   */
  async rejectOrderAssignment(
    assignmentId: string,
    restaurantId: string,
    reason: string,
    details?: string
  ): Promise<{ success: boolean; reassigned: boolean; message: string }> {
    try {
      console.log('Rejecting order assignment:', {
        assignmentId,
        restaurantId,
        reason,
        details
      });

      // Call the database function to handle rejection and reassignment
      const { data, error } = await supabase.rpc('handle_order_rejection', {
        p_assignment_id: assignmentId,
        p_restaurant_id: restaurantId,
        p_rejection_reason: reason,
        p_rejection_details: details || null
      });

      if (error) {
        console.error('Error rejecting order assignment:', error);
        throw error;
      }

      // Check if the rejection was successful
      if (data === true) {
        // Check if order was reassigned or cancelled
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('status, rejection_count')
          .eq('id', await this.getOrderIdFromAssignment(assignmentId))
          .single();

        if (orderError) {
          console.error('Error checking order status after rejection:', orderError);
        }

        const wasReassigned = orderData?.status === 'restaurant_assigned';
        const wasCancelled = orderData?.status === 'cancelled_no_restaurant';

        return {
          success: true,
          reassigned: wasReassigned,
          message: wasCancelled 
            ? 'Order rejected and cancelled (no more restaurants available)'
            : wasReassigned 
              ? 'Order rejected and reassigned to another restaurant'
              : 'Order rejected successfully'
        };
      } else {
        return {
          success: false,
          reassigned: false,
          message: 'Failed to reject order - assignment may no longer be pending'
        };
      }
    } catch (error) {
      console.error('Error in rejectOrderAssignment:', error);
      return {
        success: false,
        reassigned: false,
        message: error instanceof Error ? error.message : 'Failed to reject order'
      };
    }
  },

  /**
   * Get order ID from assignment ID
   */
  async getOrderIdFromAssignment(assignmentId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('restaurant_assignments')
        .select('order_id')
        .eq('id', assignmentId)
        .single();

      if (error) {
        console.error('Error getting order ID from assignment:', error);
        return null;
      }

      return data?.order_id || null;
    } catch (error) {
      console.error('Error in getOrderIdFromAssignment:', error);
      return null;
    }
  },

  /**
   * Get rejection history for an order
   */
  async getOrderRejectionHistory(orderId: string): Promise<OrderRejection[]> {
    try {
      const { data, error } = await supabase
        .from('order_rejections')
        .select(`
          *,
          restaurants!order_rejections_restaurant_id_fkey(name)
        `)
        .eq('order_id', orderId)
        .order('rejected_at', { ascending: false });

      if (error) {
        console.error('Error getting rejection history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getOrderRejectionHistory:', error);
      return [];
    }
  },

  /**
   * Get restaurant's rejection statistics
   */
  async getRestaurantRejectionStats(restaurantId: string, days: number = 30): Promise<{
    total_rejections: number;
    rejection_rate: number;
    common_reasons: Array<{ reason: string; count: number }>;
  }> {
    try {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);

      // Get rejection count
      const { data: rejections, error: rejectionsError } = await supabase
        .from('order_rejections')
        .select('rejection_reason')
        .eq('restaurant_id', restaurantId)
        .gte('rejected_at', sinceDate.toISOString());

      if (rejectionsError) {
        console.error('Error getting rejection stats:', rejectionsError);
        return { total_rejections: 0, rejection_rate: 0, common_reasons: [] };
      }

      // Get total assignments count for rate calculation
      const { data: assignments, error: assignmentsError } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', sinceDate.toISOString());

      if (assignmentsError) {
        console.error('Error getting assignment stats:', assignmentsError);
      }

      const totalRejections = rejections?.length || 0;
      const totalAssignments = assignments?.length || 0;
      const rejectionRate = totalAssignments > 0 ? (totalRejections / totalAssignments) * 100 : 0;

      // Calculate common reasons
      const reasonCounts = rejections?.reduce((acc, rejection) => {
        const reason = rejection.rejection_reason;
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const commonReasons = Object.entries(reasonCounts)
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        total_rejections: totalRejections,
        rejection_rate: Math.round(rejectionRate * 100) / 100,
        common_reasons: commonReasons
      };
    } catch (error) {
      console.error('Error in getRestaurantRejectionStats:', error);
      return { total_rejections: 0, rejection_rate: 0, common_reasons: [] };
    }
  }
};

import { supabase } from '@/integrations/supabase/client';

export interface AssignmentHealth {
  totalPendingAssignments: number;
  expiredAssignments: number;
  orphanedOrders: number;
  inconsistentStates: number;
  lastCleanupTime: string | null;
}

export interface MonitoringAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  details: any;
  created_at: string;
}

export class AssignmentMonitoringService {
  /**
   * Check the health of the assignment system
   */
  static async checkSystemHealth(): Promise<AssignmentHealth> {
    console.log('Monitoring: Checking assignment system health');

    try {
      // Count pending assignments
      const { count: pendingCount } = await supabase
        .from('restaurant_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Count expired assignments
      const { count: expiredCount } = await supabase
        .from('restaurant_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString());

      // Count orders without valid restaurant assignments - fixed ambiguous column reference
      const { data: ordersWithoutAssignments } = await supabase
        .from('orders')
        .select('o.id')
        .eq('o.status', 'pending')
        .is('o.restaurant_id', null);

      const orphanedOrders = ordersWithoutAssignments?.filter(async (order) => {
        const { count } = await supabase
          .from('restaurant_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('order_id', order.id)
          .eq('status', 'pending');
        return (count || 0) === 0;
      }).length || 0;

      // Count inconsistent states (orders with status mismatch) - fixed with explicit aliases
      const { data: inconsistentOrders } = await supabase
        .from('orders')
        .select(`
          o.id,
          o.status,
          o.restaurant_id,
          ra.status
        `)
        .from('orders o')
        .leftJoin('restaurant_assignments ra', 'o.id', 'ra.order_id')
        .neq('o.status', 'pending')
        .is('o.restaurant_id', null);

      return {
        totalPendingAssignments: pendingCount || 0,
        expiredAssignments: expiredCount || 0,
        orphanedOrders,
        inconsistentStates: inconsistentOrders?.length || 0,
        lastCleanupTime: new Date().toISOString()
      };
    } catch (error) {
      console.error('Monitoring: Error checking system health:', error);
      throw error;
    }
  }

  /**
   * Clean up expired and inconsistent assignment data
   */
  static async performSystemCleanup(): Promise<{
    cleanedAssignments: number;
    fixedOrders: number;
    errors: string[];
  }> {
    console.log('Monitoring: Performing system cleanup');
    
    const errors: string[] = [];
    let cleanedAssignments = 0;
    let fixedOrders = 0;

    try {
      // 1. Handle expired assignments
      const { data: expiredAssignments, error: expiredError } = await supabase
        .from('restaurant_assignments')
        .select('id, order_id')
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString());

      if (expiredError) {
        errors.push(`Error finding expired assignments: ${expiredError.message}`);
      } else if (expiredAssignments?.length) {
        // Mark as expired
        const { error: updateError } = await supabase
          .from('restaurant_assignments')
          .update({ status: 'expired' })
          .in('id', expiredAssignments.map(a => a.id));

        if (updateError) {
          errors.push(`Error updating expired assignments: ${updateError.message}`);
        } else {
          cleanedAssignments += expiredAssignments.length;

          // Check if orders need status update
          for (const assignment of expiredAssignments) {
            const { data: pendingAssignments } = await supabase
              .from('restaurant_assignments')
              .select('id')
              .eq('order_id', assignment.order_id)
              .eq('status', 'pending');

            if (!pendingAssignments?.length) {
              // No more pending assignments, update order status
              await supabase
                .from('orders')
                .update({ status: 'no_restaurant_accepted' })
                .eq('id', assignment.order_id);
              
              fixedOrders++;
            }
          }
        }
      }

      // 2. Fix orders with inconsistent states - fixed with explicit column references
      const { data: inconsistentOrders, error: inconsistentError } = await supabase
        .from('orders')
        .select(`
          o.id,
          o.status,
          o.restaurant_id
        `)
        .from('orders o')
        .eq('o.status', 'restaurant_accepted')
        .is('o.restaurant_id', null);

      if (inconsistentError) {
        errors.push(`Error finding inconsistent orders: ${inconsistentError.message}`);
      } else if (inconsistentOrders?.length) {
        for (const order of inconsistentOrders) {
          // Find the accepted assignment
          const { data: acceptedAssignment } = await supabase
            .from('restaurant_assignments')
            .select('restaurant_id')
            .eq('order_id', order.id)
            .eq('status', 'accepted')
            .single();

          if (acceptedAssignment) {
            // Update order with restaurant_id
            await supabase
              .from('orders')
              .update({ restaurant_id: acceptedAssignment.restaurant_id })
              .eq('id', order.id);
            
            fixedOrders++;
          }
        }
      }

      console.log('Monitoring: Cleanup completed', {
        cleanedAssignments,
        fixedOrders,
        errors: errors.length
      });

      return { cleanedAssignments, fixedOrders, errors };
    } catch (error) {
      console.error('Monitoring: Error during cleanup:', error);
      errors.push(`Unexpected cleanup error: ${error}`);
      return { cleanedAssignments, fixedOrders, errors };
    }
  }

  /**
   * Log monitoring events for analysis
   */
  static async logMonitoringEvent(
    eventType: string,
    message: string,
    details?: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('error_logs')
        .insert({
          error_type: `monitoring_${eventType}`,
          error_message: message,
          error_details: details || {},
          is_critical: false
        });

      if (error) {
        console.error('Monitoring: Error logging event:', error);
      } else {
        console.log('Monitoring: Event logged:', { eventType, message });
      }
    } catch (error) {
      console.error('Monitoring: Failed to log event:', error);
    }
  }

  /**
   * Get monitoring alerts for a restaurant
   */
  static async getRestaurantAlerts(restaurantId: string): Promise<MonitoringAlert[]> {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .ilike('error_type', 'monitoring_%')
        .eq('error_details->>restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(log => ({
        id: log.id,
        type: log.is_critical ? 'error' : 'warning',
        message: log.error_message,
        details: log.error_details,
        created_at: log.created_at
      }));
    } catch (error) {
      console.error('Monitoring: Error fetching alerts:', error);
      return [];
    }
  }
}


import { supabase } from '@/integrations/supabase/client';
import { performanceAlertsService } from './performanceAlertsService';

// Simple types to avoid deep type instantiation
interface SimpleDeliveryUser {
  id: string;
  average_rating?: number | null;
  first_name?: string | null;
  last_name?: string | null;
}

interface SimpleOrder {
  status: string;
  delivered_at?: string | null;
  estimated_delivery_time?: string | null;
}

// Alert types
type AlertSeverity = 'critical' | 'high';
type AlertType = 'low_rating' | 'high_cancellation' | 'late_delivery';

interface DeliveryPerformanceAlertData {
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  threshold_value: number;
  actual_value: number;
}

export class PerformanceMonitoringService {
  // Main method: check all active drivers
  async runPerformanceChecks(): Promise<void> {
    try {
      const { data: users, error } = await supabase
        .from('delivery_users')
        .select('id')
        .eq('status', 'active');

      if (error) {
        console.error('Failed to fetch active delivery users:', error);
        return;
      }

      if (!users || users.length === 0) {
        console.log('No active delivery users found');
        return;
      }

      // Check each user with a small delay to avoid overwhelming the system
      for (const user of users) {
        try {
          await this.checkDriverPerformance(user.id);
          // Small delay between checks
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error checking performance for driver ${user.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in runPerformanceChecks:', error);
    }
  }

  // Check all metrics for a specific driver
  async checkDriverPerformance(deliveryUserId: string): Promise<void> {
    try {
      await Promise.all([
        this.checkLowRating(deliveryUserId),
        this.checkHighCancellationRate(deliveryUserId),
        this.checkLateDeliveries(deliveryUserId)
      ]);
    } catch (error) {
      console.error(`Error checking driver performance for ${deliveryUserId}:`, error);
    }
  }

  // Check for low ratings
  private async checkLowRating(deliveryUserId: string): Promise<void> {
    try {
      const { data: user, error } = await supabase
        .from('delivery_users')
        .select('average_rating, first_name, last_name')
        .eq('id', deliveryUserId)
        .single();

      if (error || !user) {
        console.error('Error fetching delivery user:', error);
        return;
      }

      const typedUser = user as SimpleDeliveryUser;
      const rating = typedUser.average_rating;

      if (typeof rating === 'number' && rating < 3.0) {
        const firstName = typedUser.first_name || '';
        const lastName = typedUser.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();

        await this.createAlert(deliveryUserId, {
          alert_type: 'low_rating',
          severity: rating < 2.0 ? 'critical' : 'high',
          title: 'Low Driver Rating',
          description: `Driver ${fullName} has a rating of ${rating.toFixed(2)}`,
          threshold_value: 3.0,
          actual_value: rating
        });
      }
    } catch (error) {
      console.error(`Error checking low rating for ${deliveryUserId}:`, error);
    }
  }

  // Check for high cancellation rate (last 30 days)
  private async checkHighCancellationRate(deliveryUserId: string): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('status')
        .eq('delivery_user_id', deliveryUserId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) {
        console.error('Error fetching orders for cancellation check:', error);
        return;
      }

      if (!orders || orders.length === 0) {
        return; // No orders to analyze
      }

      const typedOrders = orders as SimpleOrder[];
      const cancelledCount = typedOrders.filter(order => order.status === 'cancelled').length;
      const totalOrders = typedOrders.length;
      const cancelRate = (cancelledCount / totalOrders) * 100;

      if (cancelRate > 20) {
        // Get user name for the alert
        const { data: user } = await supabase
          .from('delivery_users')
          .select('first_name, last_name')
          .eq('id', deliveryUserId)
          .single();

        const typedUser = user as SimpleDeliveryUser | null;
        const firstName = typedUser?.first_name || '';
        const lastName = typedUser?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();

        await this.createAlert(deliveryUserId, {
          alert_type: 'high_cancellation',
          severity: cancelRate > 40 ? 'critical' : 'high',
          title: 'High Cancellation Rate',
          description: `Driver ${fullName} has a ${cancelRate.toFixed(1)}% cancellation rate`,
          threshold_value: 20,
          actual_value: cancelRate
        });
      }
    } catch (error) {
      console.error(`Error checking cancellation rate for ${deliveryUserId}:`, error);
    }
  }

  // Check for late deliveries (last 30 days)
  private async checkLateDeliveries(deliveryUserId: string): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('delivered_at, estimated_delivery_time')
        .eq('delivery_user_id', deliveryUserId)
        .eq('status', 'delivered')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) {
        console.error('Error fetching orders for late delivery check:', error);
        return;
      }

      if (!orders || orders.length === 0) {
        return; // No delivered orders to analyze
      }

      const typedOrders = orders as SimpleOrder[];
      const lateCount = typedOrders.filter(order => {
        const deliveredAt = order.delivered_at ? new Date(order.delivered_at) : null;
        const estimatedTime = order.estimated_delivery_time ? new Date(order.estimated_delivery_time) : null;
        
        if (!deliveredAt || !estimatedTime) {
          return false;
        }
        
        return deliveredAt > estimatedTime;
      }).length;

      const totalDelivered = typedOrders.length;
      const lateRate = (lateCount / totalDelivered) * 100;

      if (lateRate > 15) {
        // Get user name for the alert
        const { data: user } = await supabase
          .from('delivery_users')
          .select('first_name, last_name')
          .eq('id', deliveryUserId)
          .single();

        const typedUser = user as SimpleDeliveryUser | null;
        const firstName = typedUser?.first_name || '';
        const lastName = typedUser?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();

        await this.createAlert(deliveryUserId, {
          alert_type: 'late_delivery',
          severity: lateRate > 30 ? 'critical' : 'high',
          title: 'High Late Delivery Rate',
          description: `Driver ${fullName} has a ${lateRate.toFixed(1)}% late delivery rate`,
          threshold_value: 15,
          actual_value: lateRate
        });
      }
    } catch (error) {
      console.error(`Error checking late deliveries for ${deliveryUserId}:`, error);
    }
  }

  // Create alert only if not already present and unresolved
  private async createAlert(
    deliveryUserId: string,
    alertData: DeliveryPerformanceAlertData
  ): Promise<void> {
    try {
      // Check if unresolved alert already exists
      const { data: existing, error: checkError } = await supabase
        .from('delivery_performance_alerts')
        .select('id')
        .eq('delivery_user_id', deliveryUserId)
        .eq('alert_type', alertData.alert_type)
        .eq('is_resolved', false)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing alerts:', checkError);
        return;
      }

      // Only create if no existing unresolved alert
      if (!existing) {
        await performanceAlertsService.createPerformanceAlert({
          delivery_user_id: deliveryUserId,
          is_resolved: false,
          ...alertData
        });
        
        console.log(`Created ${alertData.severity} alert for driver ${deliveryUserId}: ${alertData.title}`);
      }
    } catch (error) {
      console.error(`Error creating alert for ${deliveryUserId}:`, error);
    }
  }
}

// Export singleton instance
export const performanceMonitoringService = new PerformanceMonitoringService();

import { supabase } from '@/integrations/supabase/client';
import { performanceAlertsService } from './performanceAlertsService';
import type { DeliveryPerformanceAlert } from '@/types/admin';

export class PerformanceMonitoringService {
  async checkDriverPerformance(deliveryUserId: string): Promise<void> {
    try {
      // Check low rating
      await this.checkLowRating(deliveryUserId);
      
      // Check high cancellation rate
      await this.checkHighCancellationRate(deliveryUserId);
      
      // Check late deliveries
      await this.checkLateDeliveries(deliveryUserId);
      
    } catch (error) {
      console.error('Error checking driver performance:', error);
    }
  }

  private async checkLowRating(deliveryUserId: string): Promise<void> {
    const { data: user } = await supabase
      .from('delivery_users')
      .select('average_rating, first_name, last_name')
      .eq('id', deliveryUserId)
      .single();

    if (user && user.average_rating !== undefined && user.average_rating < 3.0) {
      await this.createAlert(deliveryUserId, {
        alert_type: 'low_rating',
        severity: user.average_rating < 2.0 ? 'critical' : 'high',
        title: 'Low Driver Rating',
        description: `Driver ${user.first_name ?? ''} ${user.last_name ?? ''} has a rating of ${user.average_rating}`,
        threshold_value: 3.0,
        actual_value: user.average_rating
      });
    }
  }

  private async checkHighCancellationRate(deliveryUserId: string): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orders } = await supabase
      .from('orders')
      .select('status')
      .eq('delivery_user_id', deliveryUserId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .returns<any[]>(); // Enforce the type as any[]

    if (orders && orders.length > 0) {
      const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
      const cancellationRate = (cancelledOrders / orders.length) * 100;

      if (cancellationRate > 20) {
        const { data: user } = await supabase
          .from('delivery_users')
          .select('first_name, last_name')
          .eq('id', deliveryUserId)
          .single();

        await this.createAlert(deliveryUserId, {
          alert_type: 'high_cancellation',
          severity: cancellationRate > 40 ? 'critical' : 'high',
          title: 'High Cancellation Rate',
          description: `Driver ${user?.first_name} ${user?.last_name} has a ${cancellationRate.toFixed(1)}% cancellation rate`,
          threshold_value: 20,
          actual_value: cancellationRate
        });
      }
    }
  }

  private async checkLateDeliveries(deliveryUserId: string): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orders } = await supabase
      .from('orders')
      .select('delivered_at, estimated_delivery_time')
      .eq('delivery_user_id', deliveryUserId)
      .eq('status', 'delivered')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .not('delivered_at', 'is', null)
      .not('estimated_delivery_time', 'is', null)
      .returns<any[]>(); // Enforce any[]

    if (orders && Array.isArray(orders) && orders.length > 0) {
      const lateDeliveries = orders.filter((order: any) => {
        const deliveredAt = new Date(order.delivered_at!);
        const estimatedTime = new Date(order.estimated_delivery_time!);
        return deliveredAt > estimatedTime;
      }).length;

      const lateRate = (lateDeliveries / orders.length) * 100;

      if (lateRate > 15) {
        const { data: user } = await supabase
          .from('delivery_users')
          .select('first_name, last_name')
          .eq('id', deliveryUserId)
          .single();

        await this.createAlert(deliveryUserId, {
          alert_type: 'late_delivery',
          severity: lateRate > 30 ? 'critical' : 'high',
          title: 'High Late Delivery Rate',
          description: `Driver ${user?.first_name} ${user?.last_name} has a ${lateRate.toFixed(1)}% late delivery rate`,
          threshold_value: 15,
          actual_value: lateRate
        });
      }
    }
  }

  private async createAlert(
    deliveryUserId: string,
    alertData: Omit<DeliveryPerformanceAlert, 'id' | 'delivery_user_id' | 'is_resolved' | 'created_at' | 'updated_at'>
  ): Promise<void> {
    // Check if similar alert already exists
    const { data: existingAlert } = await supabase
      .from('delivery_performance_alerts')
      .select('id')
      .eq('delivery_user_id', deliveryUserId)
      .eq('alert_type', alertData.alert_type)
      .eq('is_resolved', false)
      .maybeSingle();

    if (!existingAlert) {
      await performanceAlertsService.createPerformanceAlert({
        delivery_user_id: deliveryUserId,
        is_resolved: false,
        ...alertData
      });
    }
  }

  async runPerformanceChecks(): Promise<void> {
    try {
      // Get all active delivery users
      const { data: activeUsers } = await supabase
        .from('delivery_users')
        .select('id')
        .eq('status', 'active');

      if (activeUsers) {
        for (const user of activeUsers) {
          await this.checkDriverPerformance(user.id);
          // Add small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('Error running performance checks:', error);
    }
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();

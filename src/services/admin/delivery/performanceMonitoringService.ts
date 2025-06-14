
import { supabase } from '@/integrations/supabase/client';
import { performanceAlertsService } from './performanceAlertsService';

// Alert types and severities
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

// Main performance monitoring class
export class PerformanceMonitoringService {
  // Batch run: check all active drivers
  async runPerformanceChecks(): Promise<void> {
    const { data: users, error } = await supabase
      .from('delivery_users')
      .select('id')
      .eq('status', 'active');

    if (error) {
      console.error('Failed to fetch active delivery users:', error);
      return;
    }
    if (!users) return;

    for (const user of users as { id: string }[]) {
      await this.checkDriverPerformance(user.id);
      await new Promise((resolve) => setTimeout(resolve, 100)); // simple delay
    }
  }

  // Check all metrics for a driver
  async checkDriverPerformance(deliveryUserId: string): Promise<void> {
    await this.checkLowRating(deliveryUserId);
    await this.checkHighCancellationRate(deliveryUserId);
    await this.checkLateDeliveries(deliveryUserId);
  }

  // 1. Low Rating
  private async checkLowRating(deliveryUserId: string): Promise<void> {
    const { data: user } = await supabase
      .from('delivery_users')
      .select('average_rating, first_name, last_name')
      .eq('id', deliveryUserId)
      .maybeSingle();

    if (!user || typeof user.average_rating !== 'number') return;

    if (user.average_rating < 3.0) {
      await this.createAlert(deliveryUserId, {
        alert_type: 'low_rating',
        severity: user.average_rating < 2.0 ? 'critical' : 'high',
        title: 'Low Driver Rating',
        description: `Driver ${(user.first_name ?? '')} ${(user.last_name ?? '')} has a rating of ${user.average_rating.toFixed(2)}`,
        threshold_value: 3.0,
        actual_value: user.average_rating
      });
    }
  }

  // 2. High cancellation rate (30d)
  private async checkHighCancellationRate(deliveryUserId: string): Promise<void> {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data: orders } = await supabase
      .from('orders')
      .select('status')
      .eq('delivery_user_id', deliveryUserId)
      .gte('created_at', since.toISOString());

    if (!orders || !Array.isArray(orders) || orders.length === 0) return;
    const cancelledCount = orders.filter((o: any) => o.status === 'cancelled').length;
    const cancelRate = (cancelledCount / orders.length) * 100;

    if (cancelRate > 20) {
      const { data: user } = await supabase
        .from('delivery_users')
        .select('first_name, last_name')
        .eq('id', deliveryUserId)
        .maybeSingle();
      await this.createAlert(deliveryUserId, {
        alert_type: 'high_cancellation',
        severity: cancelRate > 40 ? 'critical' : 'high',
        title: 'High Cancellation Rate',
        description: `Driver ${(user?.first_name ?? '')} ${(user?.last_name ?? '')} has a ${cancelRate.toFixed(1)}% cancellation rate`,
        threshold_value: 20,
        actual_value: cancelRate
      });
    }
  }

  // 3. Late deliveries (30d)
  private async checkLateDeliveries(deliveryUserId: string): Promise<void> {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data: orders } = await supabase
      .from('orders')
      .select('delivered_at, estimated_delivery_time')
      .eq('delivery_user_id', deliveryUserId)
      .eq('status', 'delivered')
      .gte('created_at', since.toISOString());

    if (!orders || !Array.isArray(orders) || orders.length === 0) return;
    const lateCount = orders.filter((o: any) => {
      const delivered = o.delivered_at ? new Date(o.delivered_at) : null;
      const estimated = o.estimated_delivery_time ? new Date(o.estimated_delivery_time) : null;
      if (!delivered || !estimated) return false;
      return delivered > estimated;
    }).length;
    const lateRate = (lateCount / orders.length) * 100;
    if (lateRate > 15) {
      const { data: user } = await supabase
        .from('delivery_users')
        .select('first_name, last_name')
        .eq('id', deliveryUserId)
        .maybeSingle();
      await this.createAlert(deliveryUserId, {
        alert_type: 'late_delivery',
        severity: lateRate > 30 ? 'critical' : 'high',
        title: 'High Late Delivery Rate',
        description: `Driver ${(user?.first_name ?? '')} ${(user?.last_name ?? '')} has a ${lateRate.toFixed(1)}% late delivery rate`,
        threshold_value: 15,
        actual_value: lateRate
      });
    }
  }

  // Only create alert if not already present and unresolved
  private async createAlert(
    deliveryUserId: string,
    alertData: DeliveryPerformanceAlertData
  ): Promise<void> {
    const { data: existing } = await supabase
      .from('delivery_performance_alerts')
      .select('id')
      .eq('delivery_user_id', deliveryUserId)
      .eq('alert_type', alertData.alert_type)
      .eq('is_resolved', false)
      .maybeSingle();

    if (!existing) {
      await performanceAlertsService.createPerformanceAlert({
        delivery_user_id: deliveryUserId,
        is_resolved: false,
        ...alertData
      });
    }
  }
}

// Export a singleton instance
export const performanceMonitoringService = new PerformanceMonitoringService();

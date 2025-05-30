
import { supabase } from '@/integrations/supabase/client';
import { OptimizedPreparationAnalyticsService } from './optimizedPreparationAnalyticsService';

export interface StageProgressionEvent {
  orderId: string;
  restaurantId: string;
  stageName: string;
  previousStage: string | null;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface BottleneckAlert {
  severity: 'low' | 'medium' | 'high';
  stageName: string;
  message: string;
  recommendations: string[];
  detectedAt: Date;
}

export class PreparationIntegrationHub {
  /**
   * Handle stage progression with parallel notifications
   */
  static async handleStageProgression(event: StageProgressionEvent): Promise<void> {
    try {
      console.log(`Handling stage progression for order ${event.orderId}: ${event.previousStage} -> ${event.stageName}`);

      // Create notification promises for parallel execution
      const notificationPromises = [
        this.notifyCustomerOfProgress(event),
        this.notifyRestaurantOfProgress(event),
        this.updateDeliveryETA(event)
      ];

      // Execute notifications in parallel
      const results = await Promise.allSettled(notificationPromises);
      
      // Log any failures
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const notificationTypes = ['customer', 'restaurant', 'delivery'];
          console.error(`Failed to send ${notificationTypes[index]} notification:`, result.reason);
        }
      });

      // Log the progression event
      await this.logPreparationEvent({
        type: 'stage_progression',
        orderId: event.orderId,
        restaurantId: event.restaurantId,
        data: {
          from_stage: event.previousStage,
          to_stage: event.stageName,
          timestamp: event.timestamp,
          metadata: event.metadata
        }
      });

      console.log(`Successfully handled stage progression for order ${event.orderId}`);
    } catch (error) {
      console.error('Error handling stage progression:', error);
      throw error;
    }
  }

  /**
   * Detect and handle bottlenecks with enhanced logging
   */
  static async detectAndHandleBottlenecks(restaurantId: string): Promise<BottleneckAlert[]> {
    try {
      console.log(`Detecting bottlenecks for restaurant ${restaurantId}`);

      // Get analytics data
      const analytics = await OptimizedPreparationAnalyticsService.getOptimizedPreparationAnalytics(
        restaurantId,
        'week'
      );

      const alerts: BottleneckAlert[] = [];

      // Process high and medium severity bottlenecks
      for (const bottleneck of analytics.bottlenecks) {
        if (bottleneck.severity === 'high' || bottleneck.severity === 'medium') {
          const alert: BottleneckAlert = {
            severity: bottleneck.severity,
            stageName: bottleneck.stage,
            message: bottleneck.description,
            recommendations: this.generateBottleneckRecommendations(bottleneck),
            detectedAt: new Date()
          };

          alerts.push(alert);

          // Send alert notifications in parallel
          const alertPromises = [
            this.sendBottleneckAlert(restaurantId, alert),
            this.logBottleneckDetection(restaurantId, bottleneck)
          ];

          await Promise.allSettled(alertPromises);
        }
      }

      // Log bottleneck detection event
      await this.logPreparationEvent({
        type: 'bottleneck_detection',
        orderId: '', // Not order-specific
        restaurantId,
        data: {
          bottlenecks_detected: analytics.bottlenecks.length,
          high_severity: analytics.bottlenecks.filter(b => b.severity === 'high').length,
          medium_severity: analytics.bottlenecks.filter(b => b.severity === 'medium').length,
          timestamp: new Date()
        }
      });

      console.log(`Detected ${alerts.length} bottleneck alerts for restaurant ${restaurantId}`);
      return alerts;
    } catch (error) {
      console.error('Error detecting bottlenecks:', error);
      return [];
    }
  }

  /**
   * Send customer progress notification
   */
  private static async notifyCustomerOfProgress(event: StageProgressionEvent): Promise<void> {
    try {
      // Get order details
      const { data: order } = await supabase
        .from('orders')
        .select('user_id, customer_name, formatted_order_id')
        .eq('id', event.orderId)
        .single();

      if (!order) {
        console.warn(`Order ${event.orderId} not found for customer notification`);
        return;
      }

      const message = this.getStageProgressMessage(event.stageName);
      
      // Use existing notifications table
      await supabase
        .from('notifications')
        .insert({
          user_id: order.user_id,
          title: 'Order Update',
          message: `Your order ${order.formatted_order_id} ${message}`,
          type: 'order_progress',
          link: `/orders/${event.orderId}`
        });

      console.log(`Customer notification sent for order ${event.orderId}`);
    } catch (error) {
      console.error('Error sending customer notification:', error);
      throw error;
    }
  }

  /**
   * Send restaurant progress notification
   */
  private static async notifyRestaurantOfProgress(event: StageProgressionEvent): Promise<void> {
    try {
      // Get restaurant user
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('user_id')
        .eq('id', event.restaurantId)
        .single();

      if (!restaurant) {
        console.warn(`Restaurant ${event.restaurantId} not found for notification`);
        return;
      }

      const message = `Order ${event.orderId} progressed to ${event.stageName.replace('_', ' ')}`;
      
      // Use existing notifications table
      await supabase
        .from('notifications')
        .insert({
          user_id: restaurant.user_id,
          title: 'Order Progress Update',
          message: message,
          type: 'restaurant_progress',
          link: `/restaurant/orders/${event.orderId}`
        });

      console.log(`Restaurant notification sent for order ${event.orderId}`);
    } catch (error) {
      console.error('Error sending restaurant notification:', error);
      throw error;
    }
  }

  /**
   * Update delivery ETA
   */
  private static async updateDeliveryETA(event: StageProgressionEvent): Promise<void> {
    try {
      if (event.stageName === 'ready_for_pickup') {
        // Find delivery assignment
        const { data: assignment } = await supabase
          .from('delivery_assignments')
          .select('id, delivery_user_id')
          .eq('order_id', event.orderId)
          .eq('status', 'accepted')
          .single();

        if (assignment) {
          // Estimate new delivery time (e.g., 20 minutes from now)
          const estimatedDeliveryTime = new Date();
          estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 20);

          await supabase
            .from('delivery_assignments')
            .update({
              estimated_delivery_time: estimatedDeliveryTime.toISOString()
            })
            .eq('id', assignment.id);

          console.log(`Updated delivery ETA for order ${event.orderId}`);
        }
      }
    } catch (error) {
      console.error('Error updating delivery ETA:', error);
      throw error;
    }
  }

  /**
   * Send bottleneck alert to restaurant
   */
  private static async sendBottleneckAlert(restaurantId: string, alert: BottleneckAlert): Promise<void> {
    try {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('user_id, name')
        .eq('id', restaurantId)
        .single();

      if (!restaurant) {
        console.warn(`Restaurant ${restaurantId} not found for bottleneck alert`);
        return;
      }

      const title = `${alert.severity.toUpperCase()} Bottleneck Alert`;
      const message = `${alert.message}\n\nRecommendations:\n${alert.recommendations.join('\n')}`;

      // Use existing notifications table
      await supabase
        .from('notifications')
        .insert({
          user_id: restaurant.user_id,
          title: title,
          message: message,
          type: 'bottleneck_alert',
          link: '/restaurant/analytics'
        });

      console.log(`Bottleneck alert sent to restaurant ${restaurantId}`);
    } catch (error) {
      console.error('Error sending bottleneck alert:', error);
      throw error;
    }
  }

  /**
   * Log bottleneck detection with enhanced data
   */
  private static async logBottleneckDetection(restaurantId: string, bottleneck: any): Promise<void> {
    try {
      await this.logPreparationEvent({
        type: 'bottleneck_detected',
        orderId: '', // Not order-specific
        restaurantId,
        data: {
          stage: bottleneck.stage,
          severity: bottleneck.severity,
          variance: bottleneck.variance,
          impact: bottleneck.impact,
          frequency: bottleneck.frequency,
          avg_delay: bottleneck.avgDelay,
          description: bottleneck.description,
          timestamp: new Date()
        }
      });

      console.log(`Logged bottleneck detection for ${bottleneck.stage} at restaurant ${restaurantId}`);
    } catch (error) {
      console.error('Error logging bottleneck detection:', error);
    }
  }

  /**
   * Enhanced preparation event logging with persistent storage
   */
  private static async logPreparationEvent(event: {
    type: string;
    orderId: string;
    restaurantId: string;
    data: Record<string, any>;
  }): Promise<void> {
    try {
      // Use error_logs table for now since preparation_events doesn't exist
      await supabase.rpc('log_error', {
        p_error_type: `preparation_${event.type}`,
        p_error_message: `Preparation event: ${event.type}`,
        p_error_details: {
          order_id: event.orderId,
          restaurant_id: event.restaurantId,
          event_data: event.data,
          logged_at: new Date().toISOString()
        },
        p_related_order_id: event.orderId || null,
        p_is_critical: false
      });

      console.log(`Logged preparation event: ${event.type} for restaurant ${event.restaurantId}`);
    } catch (error) {
      console.error('Error logging preparation event:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Generate bottleneck recommendations
   */
  private static generateBottleneckRecommendations(bottleneck: any): string[] {
    const recommendations: string[] = [];
    const stageName = bottleneck.stage.replace('_', ' ');

    switch (bottleneck.severity) {
      case 'high':
        recommendations.push(`Review ${stageName} staffing levels`);
        recommendations.push(`Consider additional equipment or workspace optimization`);
        recommendations.push(`Implement immediate process improvements`);
        recommendations.push(`Monitor closely and reassess in 24 hours`);
        break;
        
      case 'medium':
        recommendations.push(`Analyze ${stageName} workflow for inefficiencies`);
        recommendations.push(`Provide additional training if needed`);
        recommendations.push(`Review timing expectations for this stage`);
        break;
        
      case 'low':
        recommendations.push(`Monitor ${stageName} performance trends`);
        recommendations.push(`Consider minor process optimizations`);
        break;
    }

    return recommendations;
  }

  /**
   * Get user-friendly stage progress message
   */
  private static getStageProgressMessage(stageName: string): string {
    const messages: Record<string, string> = {
      'received': 'has been received and is being reviewed',
      'ingredients_prep': 'ingredients are being prepared',
      'cooking': 'is now being cooked',
      'plating': 'is being plated and finished',
      'quality_check': 'is undergoing final quality check',
      'ready': 'is ready for pickup'
    };

    return messages[stageName] || `has progressed to ${stageName.replace('_', ' ')}`;
  }

  /**
   * Get current preparation metrics for a restaurant
   */
  static async getCurrentPreparationMetrics(restaurantId: string): Promise<{
    activeOrders: number;
    averagePreparationTime: number;
    bottleneckCount: number;
    efficiencyScore: number;
  }> {
    try {
      // Get active orders
      const { data: activeOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .in('status', ['restaurant_accepted', 'preparing']);

      // Get recent analytics
      const analytics = await OptimizedPreparationAnalyticsService.getOptimizedPreparationAnalytics(
        restaurantId,
        'week'
      );

      return {
        activeOrders: activeOrders?.length || 0,
        averagePreparationTime: analytics.performanceMetrics.averageCompletionTime,
        bottleneckCount: analytics.bottlenecks.filter(b => b.severity !== 'low').length,
        efficiencyScore: analytics.performanceMetrics.efficiencyScore
      };
    } catch (error) {
      console.error('Error getting current preparation metrics:', error);
      return {
        activeOrders: 0,
        averagePreparationTime: 0,
        bottleneckCount: 0,
        efficiencyScore: 0
      };
    }
  }
}

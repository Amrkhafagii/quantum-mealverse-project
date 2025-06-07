import { supabase } from '@/integrations/supabase/client';
import { PreparationStageService } from './preparationStageService';
import { PreparationTimerService } from './preparationTimerService';

export class PreparationIntegrationHub {
  /**
   * Send notifications in parallel for improved performance
   */
  private static async sendNotificationsInParallel(notifications: Array<{
    userId: string;
    title: string;
    message: string;
    type: string;
    orderId: string;
    data?: any;
  }>): Promise<void> {
    try {
      const notificationPromises = notifications.map(async (notification) => {
        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: notification.userId,
            title: notification.title,
            message: notification.message,
            notification_type: notification.type,
            order_id: notification.orderId,
            data: notification.data
          });

        if (error) {
          console.error('Error sending notification:', error);
        }
      });

      await Promise.all(notificationPromises);
      console.log(`Sent ${notifications.length} notifications in parallel`);
    } catch (error) {
      console.error('Error sending notifications in parallel:', error);
    }
  }

  /**
   * Handle stage progression with parallel notifications
   */
  static async handleStageProgression(
    orderId: string, 
    fromStage: string, 
    toStage: string
  ): Promise<void> {
    try {
      // Get order details for notifications
      const { data: order } = await supabase
        .from('orders')
        .select('customer_id, restaurant_id, customer_name')
        .eq('id', orderId)
        .single();

      if (!order) {
        console.error('Order not found for stage progression');
        return;
      }

      // Prepare notifications for parallel sending
      const notifications = [
        {
          userId: order.customer_id,
          title: 'Order Update',
          message: `Your order has progressed from ${fromStage} to ${toStage}`,
          type: 'preparation_update',
          orderId,
          data: {
            fromStage,
            toStage,
            timestamp: new Date().toISOString()
          }
        }
      ];

      // Add restaurant notification if needed
      if (order.restaurant_id) {
        // Get restaurant owner for notification
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('user_id')
          .eq('id', order.restaurant_id)
          .single();

        if (restaurant?.user_id) {
          notifications.push({
            userId: restaurant.user_id,
            title: 'Stage Progression',
            message: `Order ${orderId} has progressed to ${toStage}`,
            type: 'restaurant_preparation',
            orderId,
            data: {
              fromStage,
              toStage,
              timestamp: new Date().toISOString()
            }
          });
        }
      }

      // Send all notifications in parallel
      await this.sendNotificationsInParallel(notifications);

      // Log the progression event
      await this.logPreparationEvent(
        orderId,
        'stage_progression',
        `Progressed from ${fromStage} to ${toStage}`,
        { fromStage, toStage }
      );

    } catch (error) {
      console.error('Error handling stage progression:', error);
    }
  }

  /**
   * Detect and handle bottlenecks with notifications
   */
  static async detectAndHandleBottlenecks(restaurantId: string): Promise<void> {
    try {
      // Get stages that have been running too long
      const { data: bottleneckStages } = await supabase
        .from('order_preparation_stages')
        .select('order_id, stage_name, started_at, estimated_duration_minutes')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'in_progress')
        .not('started_at', 'is', null);

      if (!bottleneckStages) return;

      const now = new Date();
      const bottlenecks = bottleneckStages.filter(stage => {
        const startTime = new Date(stage.started_at!);
        const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
        return elapsedMinutes > (stage.estimated_duration_minutes * 1.5); // 50% over estimate
      });

      if (bottlenecks.length === 0) return;

      // Get restaurant owner for notifications
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('user_id')
        .eq('id', restaurantId)
        .single();

      if (!restaurant?.user_id) return;

      // Prepare bottleneck notifications
      const notifications = bottlenecks.map(bottleneck => ({
        userId: restaurant.user_id,
        title: 'Bottleneck Alert',
        message: `Stage ${bottleneck.stage_name} for order ${bottleneck.order_id} is running behind schedule`,
        type: 'bottleneck_alert',
        orderId: bottleneck.order_id,
        data: {
          stageName: bottleneck.stage_name,
          alertType: 'bottleneck',
          timestamp: new Date().toISOString()
        }
      }));

      // Send all bottleneck notifications in parallel
      await this.sendNotificationsInParallel(notifications);

      console.log(`Detected and notified about ${bottlenecks.length} bottlenecks`);
    } catch (error) {
      console.error('Error detecting bottlenecks:', error);
    }
  }

  /**
   * Enhanced timer cleanup with lifecycle tracking
   */
  static async cleanupOrderTimers(orderId: string, reason: string = 'cleanup'): Promise<void> {
    try {
      // Stop any active timers
      const stoppedTimer = PreparationTimerService.stopTimer(orderId);
      
      if (stoppedTimer) {
        console.log(`Stopped timer for order ${orderId}: ${reason}`);
        
        // Log the cleanup event
        await this.logPreparationEvent(
          orderId,
          'timer_cleanup',
          `Timer stopped due to: ${reason}`,
          { 
            reason,
            finalElapsedTime: stoppedTimer.elapsedTime,
            stage: stoppedTimer.currentStage
          }
        );
      }

      // Update any in-progress stages if order is cancelled
      if (reason === 'cancelled' || reason === 'completed') {
        await supabase
          .from('order_preparation_stages')
          .update({
            status: reason === 'cancelled' ? 'cancelled' : 'completed',
            completed_at: new Date().toISOString(),
            notes: `Order ${reason} - timer cleanup`
          })
          .eq('order_id', orderId)
          .eq('status', 'in_progress');
      }
    } catch (error) {
      console.error('Error cleaning up order timers:', error);
    }
  }

  /**
   * Persistent event logging with database storage
   */
  private static async logPreparationEvent(
    orderId: string,
    eventType: string,
    message: string,
    metadata?: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('error_logs')
        .insert({
          error_type: `preparation_${eventType}`,
          error_message: message,
          error_details: {
            orderId,
            eventType,
            metadata: metadata || {},
            timestamp: new Date().toISOString()
          },
          related_order_id: orderId,
          is_critical: false
        });

      if (error) {
        console.error('Error logging preparation event:', error);
      } else {
        console.log(`Logged preparation event: ${eventType} for order ${orderId}`);
      }
    } catch (error) {
      console.error('Critical error in preparation event logging:', error);
    }
  }

  /**
   * Enhanced timer updates with versatile event handling
   */
  static emitTimerUpdate(orderId: string, updateData: {
    currentStage: string;
    elapsedTime: number;
    isRunning: boolean;
    progress?: number;
    estimatedCompletion?: Date;
    [key: string]: any;
  }): void {
    const event = new CustomEvent('preparationTimerUpdate', {
      detail: {
        orderId,
        ...updateData,
        timestamp: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(event);
    
    // Also emit a general preparation update event
    const generalEvent = new CustomEvent('preparationUpdate', {
      detail: {
        type: 'timer',
        orderId,
        data: updateData
      }
    });
    
    window.dispatchEvent(generalEvent);
  }

  /**
   * Subscribe to various preparation updates
   */
  static subscribeToPreparationUpdates(
    callback: (updateType: string, data: any) => void
  ): () => void {
    const handler = (event: CustomEvent) => {
      callback(event.detail.type || 'timer', event.detail);
    };

    window.addEventListener('preparationUpdate', handler as EventListener);
    
    return () => {
      window.removeEventListener('preparationUpdate', handler as EventListener);
    };
  }
}


import { supabase } from '@/integrations/supabase/client';
import { PreparationStageService } from './preparationStageService';
import { PreparationTimerService } from './preparationTimerService';
import { preparationNotificationService } from '@/services/notifications/preparationNotificationService';

interface StageProgressionResult {
  success: boolean;
  message: string;
  notificationsResult?: any;
}

interface EventDetails {
  orderId: string;
  stageName: string;
  status: string;
  metadata?: Record<string, any>;
}

export class PreparationIntegrationHub {
  /**
   * Handle stage progression with parallel notifications
   */
  static async handleStageProgression(
    orderId: string,
    targetStage: string,
    userId?: string
  ): Promise<StageProgressionResult> {
    try {
      console.log(`Handling stage progression for order ${orderId} to stage: ${targetStage}`);

      // Advance the stage
      const stageResult = await PreparationStageService.advanceStage(orderId, targetStage);
      
      if (!stageResult.success) {
        return {
          success: false,
          message: stageResult.message || 'Failed to advance stage'
        };
      }

      // Send notifications in parallel if userId is provided
      let notificationsResult;
      if (userId) {
        const notificationPromises = [
          this.sendStageNotification(orderId, targetStage, 'completed', userId),
          this.sendRestaurantNotification(orderId, targetStage, 'completed'),
          this.logPreparationEvent({
            orderId,
            stageName: targetStage,
            status: 'completed',
            metadata: { userId, timestamp: new Date().toISOString() }
          })
        ];

        try {
          notificationsResult = await Promise.all(notificationPromises);
          console.log('All notifications sent successfully');
        } catch (notificationError) {
          console.error('Some notifications failed:', notificationError);
          // Don't fail the entire operation if notifications fail
        }
      }

      return {
        success: true,
        message: `Stage ${targetStage} completed successfully`,
        notificationsResult
      };
    } catch (error) {
      console.error('Error in stage progression:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Detect and handle bottlenecks across multiple orders
   */
  static async detectAndHandleBottlenecks(restaurantId: string): Promise<void> {
    try {
      console.log(`Detecting bottlenecks for restaurant ${restaurantId}`);

      // Get all active preparation stages for the restaurant
      const { data: activeStages, error } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'in_progress')
        .gte('started_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()); // Last 2 hours

      if (error) {
        console.error('Error fetching active stages:', error);
        return;
      }

      if (!activeStages || activeStages.length === 0) {
        console.log('No active stages found for bottleneck detection');
        return;
      }

      // Detect bottlenecks based on timing
      const now = new Date();
      const bottlenecks = activeStages.filter(stage => {
        if (!stage.started_at || !stage.estimated_duration_minutes) return false;
        
        const startTime = new Date(stage.started_at);
        const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
        const threshold = stage.estimated_duration_minutes * 1.5; // 50% over estimated time
        
        return elapsedMinutes > threshold;
      });

      if (bottlenecks.length > 0) {
        console.log(`Found ${bottlenecks.length} bottlenecks`);
        
        // Handle each bottleneck
        const bottleneckPromises = bottlenecks.map(stage => 
          this.handleBottleneck(stage.order_id, stage.stage_name, restaurantId)
        );
        
        await Promise.all(bottleneckPromises);
      }
    } catch (error) {
      console.error('Error detecting bottlenecks:', error);
    }
  }

  /**
   * Handle individual bottleneck
   */
  private static async handleBottleneck(
    orderId: string,
    stageName: string,
    restaurantId: string
  ): Promise<void> {
    try {
      console.log(`Handling bottleneck for order ${orderId} at stage ${stageName}`);

      // Send bottleneck notification to restaurant
      await this.sendBottleneckAlert(orderId, stageName, restaurantId);

      // Log the bottleneck event
      await this.logPreparationEvent({
        orderId,
        stageName,
        status: 'bottleneck_detected',
        metadata: {
          restaurantId,
          detectedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error(`Error handling bottleneck for order ${orderId}:`, error);
    }
  }

  /**
   * Send stage completion notification to customer
   */
  private static async sendStageNotification(
    orderId: string,
    stageName: string,
    status: string,
    userId: string
  ): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Order Progress Update',
          message: `Your order has completed the ${stageName.replace('_', ' ')} stage`,
          notification_type: 'preparation_update',
          order_id: orderId,
          data: {
            stageName,
            status,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error sending stage notification:', error);
    }
  }

  /**
   * Send notification to restaurant staff
   */
  private static async sendRestaurantNotification(
    orderId: string,
    stageName: string,
    status: string
  ): Promise<void> {
    try {
      // Get restaurant info from order
      const { data: order } = await supabase
        .from('orders')
        .select('restaurant_id')
        .eq('id', orderId)
        .single();

      if (!order?.restaurant_id) {
        console.log('No restaurant found for order');
        return;
      }

      await supabase
        .from('notifications')
        .insert({
          restaurant_id: order.restaurant_id,
          title: 'Stage Completed',
          message: `Order ${orderId} has completed ${stageName.replace('_', ' ')} stage`,
          notification_type: 'stage_completion',
          order_id: orderId,
          data: {
            stageName,
            status,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error sending restaurant notification:', error);
    }
  }

  /**
   * Send bottleneck alert to restaurant
   */
  private static async sendBottleneckAlert(
    orderId: string,
    stageName: string,
    restaurantId: string
  ): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .insert({
          restaurant_id: restaurantId,
          title: 'Bottleneck Alert',
          message: `Order ${orderId} is experiencing delays at ${stageName.replace('_', ' ')} stage`,
          notification_type: 'bottleneck_alert',
          order_id: orderId,
          data: {
            stageName,
            alertType: 'bottleneck',
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error sending bottleneck alert:', error);
    }
  }

  /**
   * Log preparation events to database for analytics
   */
  private static async logPreparationEvent(eventDetails: EventDetails): Promise<void> {
    try {
      console.log('Logging preparation event:', eventDetails);

      await supabase
        .from('error_logs')
        .insert({
          error_type: 'preparation_event',
          error_message: `${eventDetails.stageName}: ${eventDetails.status}`,
          error_details: {
            orderId: eventDetails.orderId,
            stageName: eventDetails.stageName,
            status: eventDetails.status,
            ...eventDetails.metadata
          },
          related_order_id: eventDetails.orderId,
          is_critical: false
        });
    } catch (error) {
      console.error('Error logging preparation event:', error);
    }
  }

  /**
   * Get preparation events for analytics
   */
  static async getPreparationEvents(
    restaurantId: string,
    timeRange: 'day' | 'week' | 'month' = 'week'
  ): Promise<any[]> {
    try {
      const timeRangeMap = {
        day: 1,
        week: 7,
        month: 30
      };

      const daysBack = timeRangeMap[timeRange];
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

      const { data: events, error } = await supabase
        .from('error_logs')
        .select('*')
        .eq('error_type', 'preparation_event')
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching preparation events:', error);
        return [];
      }

      return events || [];
    } catch (error) {
      console.error('Error in getPreparationEvents:', error);
      return [];
    }
  }

  /**
   * Initialize preparation tracking when restaurant accepts order
   */
  static async initializePreparationTracking(orderId: string, restaurantId: string): Promise<boolean> {
    try {
      console.log(`Initializing preparation tracking for order ${orderId}`);
      
      // Check if preparation stages already exist
      const existingStages = await PreparationStageService.getOrderPreparationStages(orderId);
      
      if (existingStages.length > 0) {
        console.log('Preparation stages already exist for this order');
        
        // Initialize timer for in-progress stage if exists
        const currentStage = existingStages.find(s => s.status === 'in_progress');
        if (currentStage) {
          PreparationTimerService.initializeExistingTimer(orderId);
        }
        
        return true;
      }

      // Create default preparation stages using database function
      const { error } = await supabase.rpc('create_default_preparation_stages', {
        p_order_id: orderId,
        p_restaurant_id: restaurantId
      });

      if (error) {
        console.error('Error creating preparation stages:', error);
        return false;
      }

      console.log('Preparation stages created successfully');
      return true;
    } catch (error) {
      console.error('Error in initializePreparationTracking:', error);
      return false;
    }
  }

  /**
   * Start preparation when restaurant begins working on order
   */
  static async startPreparation(orderId: string): Promise<boolean> {
    try {
      // Start the ingredients_prep stage (first active stage after received)
      const success = await PreparationStageService.startStage(orderId, 'ingredients_prep');
      
      if (success) {
        // Start timer for the stage
        PreparationTimerService.startTimer(orderId, 'ingredients_prep');
        
        // Update order status to 'preparing'
        await supabase
          .from('orders')
          .update({ status: 'preparing' })
          .eq('id', orderId);
        
        console.log(`Started preparation for order ${orderId}`);
      }
      
      return success;
    } catch (error) {
      console.error('Error starting preparation:', error);
      return false;
    }
  }

  /**
   * Mark order as ready for pickup/delivery
   */
  static async markOrderReady(orderId: string): Promise<boolean> {
    try {
      // Complete the ready stage
      const result = await PreparationStageService.advanceStage(orderId, 'ready');
      
      if (result.success) {
        // Update order status to 'ready_for_pickup'
        await supabase
          .from('orders')
          .update({ status: 'ready_for_pickup' })
          .eq('id', orderId);
        
        // Stop any active timers
        PreparationTimerService.stopTimer(orderId);
        
        console.log(`Order ${orderId} marked as ready`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking order ready:', error);
      return false;
    }
  }

  /**
   * Handle order cancellation - cleanup preparation tracking
   */
  static async handleOrderCancellation(orderId: string): Promise<void> {
    try {
      // Stop any active timers
      PreparationTimerService.stopTimer(orderId);
      
      // Mark all pending/in-progress stages as cancelled (using skipped status)
      await supabase
        .from('order_preparation_stages')
        .update({
          status: 'skipped',
          notes: 'Order cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .in('status', ['pending', 'in_progress']);
      
      console.log(`Cleaned up preparation tracking for cancelled order ${orderId}`);
    } catch (error) {
      console.error('Error handling order cancellation:', error);
    }
  }

  /**
   * Sync preparation status with order status
   */
  static async syncPreparationWithOrderStatus(orderId: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (!order) return;

      const progress = await PreparationStageService.getPreparationProgress(orderId);
      const currentStage = progress.find(p => p.status === 'in_progress');
      
      // Sync order status based on preparation progress
      let newOrderStatus = order.status;
      
      if (currentStage) {
        switch (currentStage.stage_name) {
          case 'received':
          case 'ingredients_prep':
          case 'cooking':
          case 'plating':
          case 'quality_check':
            newOrderStatus = 'preparing';
            break;
          case 'ready':
            newOrderStatus = 'ready_for_pickup';
            break;
        }
      } else {
        // Check if all stages are completed
        const allCompleted = progress.every(p => p.status === 'completed');
        if (allCompleted) {
          newOrderStatus = 'ready_for_pickup';
        }
      }
      
      // Update order status if it has changed
      if (newOrderStatus !== order.status) {
        await supabase
          .from('orders')
          .update({ status: newOrderStatus })
          .eq('id', orderId);
        
        console.log(`Synced order ${orderId} status to ${newOrderStatus}`);
      }
    } catch (error) {
      console.error('Error syncing preparation with order status:', error);
    }
  }

  /**
   * Get preparation summary for restaurant dashboard
   */
  static async getRestaurantPreparationSummary(restaurantId: string): Promise<{
    activeOrders: number;
    averageCompletionTime: number;
    stageBreakdown: Record<string, number>;
  }> {
    try {
      const { data: activeStages } = await supabase
        .from('order_preparation_stages')
        .select('stage_name, status, actual_duration_minutes, order_id')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'in_progress');

      const { data: completedStages } = await supabase
        .from('order_preparation_stages')
        .select('actual_duration_minutes')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'completed')
        .not('actual_duration_minutes', 'is', null);

      const activeOrders = new Set(activeStages?.map(s => s.order_id) || []).size;
      
      const averageCompletionTime = completedStages?.length 
        ? completedStages.reduce((sum, s) => sum + (s.actual_duration_minutes || 0), 0) / completedStages.length
        : 0;

      const stageBreakdown: Record<string, number> = {};
      activeStages?.forEach(stage => {
        stageBreakdown[stage.stage_name] = (stageBreakdown[stage.stage_name] || 0) + 1;
      });

      return {
        activeOrders,
        averageCompletionTime: Math.round(averageCompletionTime),
        stageBreakdown
      };
    } catch (error) {
      console.error('Error getting preparation summary:', error);
      return {
        activeOrders: 0,
        averageCompletionTime: 0,
        stageBreakdown: {}
      };
    }
  }
}

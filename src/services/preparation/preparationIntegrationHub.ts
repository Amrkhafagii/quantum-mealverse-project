
import { supabase } from '@/integrations/supabase/client';
import { PreparationStageService } from './preparationStageService';
import { PreparationTimerService } from './preparationTimerService';

interface NotificationPayload {
  type: 'stage_completed' | 'stage_started' | 'bottleneck_detected' | 'preparation_complete';
  orderId: string;
  stage?: string;
  metadata?: Record<string, any>;
}

interface PreparationEvent {
  order_id: string;
  event_type: string;
  stage_name?: string;
  event_data: Record<string, any>;
  timestamp: string;
}

export class PreparationIntegrationHub {
  /**
   * Handle stage progression with parallel notifications
   */
  static async handleStageProgression(
    orderId: string, 
    currentStage: string, 
    nextStage?: string
  ): Promise<boolean> {
    try {
      console.log(`Handling stage progression for order ${orderId}: ${currentStage} -> ${nextStage || 'complete'}`);
      
      // Complete current stage
      const stageResult = await PreparationStageService.advanceStage(orderId, currentStage);
      
      if (!stageResult.success) {
        console.error(`Failed to advance stage ${currentStage} for order ${orderId}`);
        return false;
      }

      // Start next stage if exists
      if (nextStage) {
        await PreparationStageService.startStage(orderId, nextStage);
        PreparationTimerService.startTimer(orderId, nextStage);
      } else {
        // Order preparation complete
        PreparationTimerService.stopTimer(orderId);
      }

      // Send notifications in parallel for better performance
      const notificationPromises = [
        this.sendStageCompletionNotification(orderId, currentStage),
        nextStage ? this.sendStageStartNotification(orderId, nextStage) : null,
        !nextStage ? this.sendPreparationCompleteNotification(orderId) : null
      ].filter(Boolean);

      await Promise.all(notificationPromises);

      // Log the progression event
      await this.logPreparationEvent({
        order_id: orderId,
        event_type: 'stage_progression',
        stage_name: currentStage,
        event_data: {
          completed_stage: currentStage,
          next_stage: nextStage,
          progression_time: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error in handleStageProgression:', error);
      return false;
    }
  }

  /**
   * Send stage completion notification
   */
  private static async sendStageCompletionNotification(orderId: string, stage: string): Promise<void> {
    try {
      const payload: NotificationPayload = {
        type: 'stage_completed',
        orderId,
        stage,
        metadata: {
          timestamp: new Date().toISOString(),
          completed_at: new Date().toISOString()
        }
      };

      // Here you would integrate with your notification service
      console.log('Stage completion notification sent:', payload);
      
      // For now, we'll use a simple database log
      await supabase
        .from('preparation_notifications')
        .insert({
          order_id: orderId,
          notification_type: 'stage_completed',
          payload: payload,
          sent_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error sending stage completion notification:', error);
    }
  }

  /**
   * Send stage start notification
   */
  private static async sendStageStartNotification(orderId: string, stage: string): Promise<void> {
    try {
      const payload: NotificationPayload = {
        type: 'stage_started',
        orderId,
        stage,
        metadata: {
          timestamp: new Date().toISOString(),
          started_at: new Date().toISOString()
        }
      };

      console.log('Stage start notification sent:', payload);
      
      await supabase
        .from('preparation_notifications')
        .insert({
          order_id: orderId,
          notification_type: 'stage_started',
          payload: payload,
          sent_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error sending stage start notification:', error);
    }
  }

  /**
   * Send preparation complete notification
   */
  private static async sendPreparationCompleteNotification(orderId: string): Promise<void> {
    try {
      const payload: NotificationPayload = {
        type: 'preparation_complete',
        orderId,
        metadata: {
          timestamp: new Date().toISOString(),
          completed_at: new Date().toISOString()
        }
      };

      console.log('Preparation complete notification sent:', payload);
      
      await supabase
        .from('preparation_notifications')
        .insert({
          order_id: orderId,
          notification_type: 'preparation_complete',
          payload: payload,
          sent_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error sending preparation complete notification:', error);
    }
  }

  /**
   * Detect and handle bottlenecks
   */
  static async detectAndHandleBottlenecks(restaurantId: string): Promise<void> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Get stages that are taking longer than expected
      const { data: delayedStages } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'in_progress')
        .gte('started_at', oneHourAgo.toISOString());

      const bottlenecks = (delayedStages || []).filter(stage => {
        if (!stage.started_at || !stage.estimated_duration_minutes) return false;
        
        const startTime = new Date(stage.started_at);
        const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
        
        return elapsedMinutes > stage.estimated_duration_minutes * 1.5; // 50% over estimate
      });

      // Send bottleneck notifications in parallel
      const bottleneckPromises = bottlenecks.map(stage =>
        this.sendBottleneckNotification(stage.order_id, stage.stage_name, {
          elapsed_minutes: (now.getTime() - new Date(stage.started_at).getTime()) / (1000 * 60),
          estimated_minutes: stage.estimated_duration_minutes
        })
      );

      await Promise.all(bottleneckPromises);

      if (bottlenecks.length > 0) {
        await this.logPreparationEvent({
          order_id: 'system',
          event_type: 'bottleneck_detection',
          event_data: {
            restaurant_id: restaurantId,
            bottlenecks_found: bottlenecks.length,
            affected_orders: bottlenecks.map(b => b.order_id),
            detection_time: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error detecting bottlenecks:', error);
    }
  }

  /**
   * Send bottleneck notification
   */
  private static async sendBottleneckNotification(
    orderId: string, 
    stage: string, 
    metrics: { elapsed_minutes: number; estimated_minutes: number }
  ): Promise<void> {
    try {
      const payload: NotificationPayload = {
        type: 'bottleneck_detected',
        orderId,
        stage,
        metadata: {
          elapsed_minutes: metrics.elapsed_minutes,
          estimated_minutes: metrics.estimated_minutes,
          delay_percentage: ((metrics.elapsed_minutes - metrics.estimated_minutes) / metrics.estimated_minutes) * 100,
          detected_at: new Date().toISOString()
        }
      };

      console.log('Bottleneck notification sent:', payload);
      
      await supabase
        .from('preparation_notifications')
        .insert({
          order_id: orderId,
          notification_type: 'bottleneck_detected',
          payload: payload,
          sent_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error sending bottleneck notification:', error);
    }
  }

  /**
   * Log preparation event with persistent storage foundation
   */
  static async logPreparationEvent(event: PreparationEvent): Promise<void> {
    try {
      console.log('Logging preparation event:', event);
      
      // Store in preparation_events table for persistent logging
      const { error } = await supabase
        .from('preparation_events')
        .insert({
          order_id: event.order_id,
          event_type: event.event_type,
          stage_name: event.stage_name,
          event_data: event.event_data,
          timestamp: event.timestamp,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging preparation event to database:', error);
        // Fallback to console logging if database fails
        console.log('Fallback event log:', JSON.stringify(event, null, 2));
      }
    } catch (error) {
      console.error('Critical error in logPreparationEvent:', error);
      // Always ensure events are logged somewhere, even if just to console
      console.log('Emergency event log:', JSON.stringify(event, null, 2));
    }
  }

  /**
   * Get preparation event history
   */
  static async getPreparationEventHistory(
    orderId: string, 
    eventTypes?: string[]
  ): Promise<PreparationEvent[]> {
    try {
      let query = supabase
        .from('preparation_events')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: false });

      if (eventTypes && eventTypes.length > 0) {
        query = query.in('event_type', eventTypes);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching preparation event history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPreparationEventHistory:', error);
      return [];
    }
  }

  /**
   * Clean up old events (retention policy)
   */
  static async cleanupOldEvents(retentionDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const { error } = await supabase
        .from('preparation_events')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
        console.error('Error cleaning up old preparation events:', error);
      } else {
        console.log(`Cleaned up preparation events older than ${retentionDays} days`);
      }
    } catch (error) {
      console.error('Error in cleanupOldEvents:', error);
    }
  }
}

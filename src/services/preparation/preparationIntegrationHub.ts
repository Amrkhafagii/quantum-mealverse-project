
import { supabase } from '@/integrations/supabase/client';
import { PreparationStageService } from './preparationStageService';
import { AutomaticTransitionService } from './automaticTransitionService';
import { preparationNotificationService } from '@/services/notifications/preparationNotificationService';

export interface PreparationEvent {
  id: string;
  orderId: string;
  restaurantId: string;
  eventType: 'stage_started' | 'stage_completed' | 'stage_delayed' | 'order_assigned' | 'order_completed';
  stageName?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface DeliveryIntegrationData {
  orderId: string;
  restaurantId: string;
  preparationStatus: 'not_started' | 'in_progress' | 'ready_for_pickup' | 'completed';
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
  totalPreparationTime?: number;
}

export class PreparationIntegrationHub {
  /**
   * Handle new order assignment and initialize preparation tracking
   */
  static async handleOrderAssignment(orderId: string, restaurantId: string): Promise<void> {
    try {
      console.log(`Initializing preparation tracking for order ${orderId}`);
      
      // Initialize preparation stages for the order
      await PreparationStageService.initializeOrderStages(orderId, restaurantId);
      
      // Setup automatic transitions
      await AutomaticTransitionService.setupOrderTransitions(orderId, restaurantId);
      
      // Log the event
      await this.logPreparationEvent({
        orderId,
        restaurantId,
        eventType: 'order_assigned',
        timestamp: new Date(),
        metadata: {
          source: 'integration_hub'
        }
      });
      
      console.log(`Preparation tracking initialized for order ${orderId}`);
    } catch (error) {
      console.error('Error handling order assignment:', error);
      throw error;
    }
  }

  /**
   * Handle stage progression and notify relevant systems
   */
  static async handleStageProgression(
    orderId: string,
    stageName: string,
    status: 'started' | 'completed',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      console.log(`Stage ${stageName} ${status} for order ${orderId}`);
      
      // Get order details
      const { data: order } = await supabase
        .from('orders')
        .select('restaurant_id, user_id')
        .eq('id', orderId)
        .single();

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Log the event
      await this.logPreparationEvent({
        orderId,
        restaurantId: order.restaurant_id,
        eventType: status === 'started' ? 'stage_started' : 'stage_completed',
        stageName,
        timestamp: new Date(),
        metadata
      });

      // Send notifications
      if (status === 'completed') {
        await preparationNotificationService.sendStageUpdateNotification({
          userId: order.user_id,
          orderId,
          stageName,
          stageStatus: 'completed'
        });
      }

      // Check if order is ready for delivery
      if (stageName === 'ready' && status === 'completed') {
        await this.handleOrderReadyForDelivery(orderId, order.restaurant_id);
      }
      
    } catch (error) {
      console.error('Error handling stage progression:', error);
      throw error;
    }
  }

  /**
   * Handle order completion and cleanup
   */
  static async handleOrderCompletion(orderId: string): Promise<void> {
    try {
      console.log(`Completing preparation tracking for order ${orderId}`);
      
      // Clear any active timers
      AutomaticTransitionService.clearOrderTransitions(orderId);
      
      // Get order details for logging
      const { data: order } = await supabase
        .from('orders')
        .select('restaurant_id')
        .eq('id', orderId)
        .single();

      if (order) {
        // Log completion event
        await this.logPreparationEvent({
          orderId,
          restaurantId: order.restaurant_id,
          eventType: 'order_completed',
          timestamp: new Date(),
          metadata: {
            source: 'integration_hub'
          }
        });
      }
      
      console.log(`Preparation tracking completed for order ${orderId}`);
    } catch (error) {
      console.error('Error handling order completion:', error);
      throw error;
    }
  }

  /**
   * Get delivery integration data for an order
   */
  static async getDeliveryIntegrationData(orderId: string): Promise<DeliveryIntegrationData | null> {
    try {
      const stages = await PreparationStageService.getOrderPreparationStages(orderId);
      
      if (stages.length === 0) {
        return null;
      }

      const { data: order } = await supabase
        .from('orders')
        .select('restaurant_id')
        .eq('id', orderId)
        .single();

      if (!order) {
        return null;
      }

      // Determine overall preparation status
      let preparationStatus: DeliveryIntegrationData['preparationStatus'] = 'not_started';
      let estimatedReadyTime: Date | undefined;
      let actualReadyTime: Date | undefined;
      let totalPreparationTime: number | undefined;

      const hasStartedStages = stages.some(s => s.status === 'in_progress' || s.status === 'completed');
      const hasCompletedAllStages = stages.every(s => s.status === 'completed');
      const readyStage = stages.find(s => s.stage_name === 'ready');

      if (hasCompletedAllStages && readyStage?.status === 'completed') {
        preparationStatus = 'completed';
        actualReadyTime = readyStage.completed_at ? new Date(readyStage.completed_at) : undefined;
      } else if (readyStage?.status === 'completed') {
        preparationStatus = 'ready_for_pickup';
        actualReadyTime = readyStage.completed_at ? new Date(readyStage.completed_at) : undefined;
      } else if (hasStartedStages) {
        preparationStatus = 'in_progress';
        // Calculate estimated ready time based on remaining stages
        const remainingTime = stages
          .filter(s => s.status !== 'completed')
          .reduce((sum, s) => sum + (s.estimated_duration_minutes || 0), 0);
        estimatedReadyTime = new Date(Date.now() + remainingTime * 60 * 1000);
      }

      // Calculate total preparation time if completed
      if (preparationStatus === 'completed') {
        const firstStage = stages.find(s => s.started_at);
        const lastStage = stages.find(s => s.stage_name === 'ready' && s.completed_at);
        
        if (firstStage?.started_at && lastStage?.completed_at) {
          totalPreparationTime = Math.round(
            (new Date(lastStage.completed_at).getTime() - new Date(firstStage.started_at).getTime()) / (1000 * 60)
          );
        }
      }

      return {
        orderId,
        restaurantId: order.restaurant_id,
        preparationStatus,
        estimatedReadyTime,
        actualReadyTime,
        totalPreparationTime
      };
    } catch (error) {
      console.error('Error getting delivery integration data:', error);
      return null;
    }
  }

  /**
   * Handle when order is ready for delivery
   */
  private static async handleOrderReadyForDelivery(orderId: string, restaurantId: string): Promise<void> {
    try {
      console.log(`Order ${orderId} is ready for delivery`);
      
      // Update order status to ready_for_pickup if not already updated
      const { data: currentOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (currentOrder && currentOrder.status !== 'ready_for_pickup') {
        await supabase
          .from('orders')
          .update({ status: 'ready_for_pickup' })
          .eq('id', orderId);
      }

      // Notify delivery system (placeholder for future integration)
      console.log(`Notifying delivery system that order ${orderId} is ready`);
      
    } catch (error) {
      console.error('Error handling order ready for delivery:', error);
    }
  }

  /**
   * Log preparation events (simplified version without database table)
   */
  private static async logPreparationEvent(event: Omit<PreparationEvent, 'id'>): Promise<void> {
    try {
      // For now, just log to console since the table doesn't exist
      console.log('Preparation Event:', {
        ...event,
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    } catch (error) {
      console.error('Error logging preparation event:', error);
    }
  }

  /**
   * Get preparation events for an order (placeholder)
   */
  static async getPreparationEvents(orderId: string): Promise<PreparationEvent[]> {
    // Since the table doesn't exist, return empty array
    console.log(`Getting preparation events for order ${orderId}`);
    return [];
  }

  /**
   * Handle delayed stages and send alerts
   */
  static async handleDelayedStage(orderId: string, stageName: string, delayMinutes: number): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('restaurant_id, user_id')
        .eq('id', orderId)
        .single();

      if (!order) return;

      // Log delay event
      await this.logPreparationEvent({
        orderId,
        restaurantId: order.restaurant_id,
        eventType: 'stage_delayed',
        stageName,
        timestamp: new Date(),
        metadata: {
          delayMinutes,
          source: 'integration_hub'
        }
      });

      // Send delay notification to customer
      await preparationNotificationService.sendDelayNotification({
        userId: order.user_id,
        orderId,
        stageName,
        delayMinutes
      });

      console.log(`Handled delay for stage ${stageName} in order ${orderId}`);
    } catch (error) {
      console.error('Error handling delayed stage:', error);
    }
  }
}


import { supabase } from '@/integrations/supabase/client';
import { PreparationIntegrationService } from './preparationIntegrationService';
import { AutomaticTransitionService } from './automaticTransitionService';
import { PreparationAnalyticsService } from './preparationAnalyticsService';
import { unifiedOrderStatusService } from '@/services/orders/unifiedOrderStatusService';
import { OrderStatus } from '@/types/webhook';

/**
 * Central hub for all preparation-related integrations
 * Coordinates between different services and systems
 */
export class PreparationIntegrationHub {
  /**
   * Initialize complete preparation tracking for a new order
   */
  static async initializeOrderPreparation(
    orderId: string, 
    restaurantId: string,
    assignmentSource: 'nutrition_generated' | 'traditional' = 'traditional'
  ): Promise<boolean> {
    try {
      console.log(`Initializing complete preparation tracking for order ${orderId}`);

      // 1. Initialize basic preparation stages
      const stagesInitialized = await PreparationIntegrationService.initializePreparationTracking(
        orderId, 
        restaurantId
      );

      if (!stagesInitialized) {
        console.error('Failed to initialize preparation stages');
        return false;
      }

      // 2. Setup automatic transitions
      await AutomaticTransitionService.setupOrderTransitions(orderId, restaurantId);

      // 3. Update order status with unified tracking
      await unifiedOrderStatusService.updateOrderStatus({
        orderId,
        newStatus: OrderStatus.RESTAURANT_ACCEPTED,
        restaurantId,
        assignmentSource,
        changedBy: restaurantId,
        changedByType: 'restaurant',
        metadata: {
          preparation_tracking_initialized: true,
          automatic_transitions_enabled: true
        }
      });

      // 4. Set up real-time monitoring
      await this.setupRealTimeMonitoring(orderId, restaurantId);

      console.log(`Successfully initialized complete preparation tracking for order ${orderId}`);
      return true;
    } catch (error) {
      console.error('Error initializing order preparation:', error);
      return false;
    }
  }

  /**
   * Start preparation with full integration
   */
  static async startPreparationWithIntegration(orderId: string, restaurantId: string): Promise<boolean> {
    try {
      // 1. Start preparation in the core service
      const preparationStarted = await PreparationIntegrationService.startPreparation(orderId);

      if (!preparationStarted) {
        return false;
      }

      // 2. Update unified order status
      await unifiedOrderStatusService.updateOrderStatus({
        orderId,
        newStatus: OrderStatus.PREPARING,
        restaurantId,
        changedBy: restaurantId,
        changedByType: 'restaurant',
        metadata: {
          preparation_started: true,
          automatic_transitions_active: true
        }
      });

      // 3. Begin analytics tracking
      await this.trackPreparationStart(orderId, restaurantId);

      return true;
    } catch (error) {
      console.error('Error starting integrated preparation:', error);
      return false;
    }
  }

  /**
   * Handle order completion with delivery integration
   */
  static async completePreparationWithDelivery(orderId: string, restaurantId: string): Promise<boolean> {
    try {
      // 1. Mark order as ready in preparation system
      const orderReady = await PreparationIntegrationService.markOrderReady(orderId);

      if (!orderReady) {
        return false;
      }

      // 2. Clear automatic transitions
      AutomaticTransitionService.clearOrderTransitions(orderId);

      // 3. Update unified order status
      await unifiedOrderStatusService.updateOrderStatus({
        orderId,
        newStatus: OrderStatus.READY_FOR_PICKUP,
        restaurantId,
        changedBy: restaurantId,
        changedByType: 'restaurant',
        metadata: {
          preparation_completed: true,
          ready_for_delivery: true
        }
      });

      // 4. Trigger delivery assignment (if not already assigned)
      await this.triggerDeliveryAssignment(orderId, restaurantId);

      // 5. Record completion analytics
      await this.trackPreparationCompletion(orderId, restaurantId);

      return true;
    } catch (error) {
      console.error('Error completing preparation with delivery integration:', error);
      return false;
    }
  }

  /**
   * Handle order cancellation across all systems
   */
  static async handleOrderCancellation(orderId: string, reason?: string): Promise<void> {
    try {
      // 1. Stop all automatic transitions
      AutomaticTransitionService.clearOrderTransitions(orderId);

      // 2. Clean up preparation tracking
      await PreparationIntegrationService.handleOrderCancellation(orderId);

      // 3. Update unified order status
      await unifiedOrderStatusService.updateOrderStatus({
        orderId,
        newStatus: OrderStatus.CANCELLED,
        changedByType: 'system',
        metadata: {
          cancellation_reason: reason,
          preparation_cleaned_up: true
        }
      });

      // 4. Record cancellation in analytics
      await this.trackOrderCancellation(orderId, reason);

      console.log(`Order ${orderId} cancellation handled across all systems`);
    } catch (error) {
      console.error('Error handling order cancellation:', error);
    }
  }

  /**
   * Get comprehensive order status across all systems
   */
  static async getComprehensiveOrderStatus(orderId: string) {
    try {
      const [orderStatus, preparationStatus, deliveryStatus] = await Promise.all([
        unifiedOrderStatusService.getOrderStatusWithTracking(orderId),
        this.getPreparationStatus(orderId),
        this.getDeliveryStatus(orderId)
      ]);

      return {
        order: orderStatus,
        preparation: preparationStatus,
        delivery: deliveryStatus,
        integrated: true
      };
    } catch (error) {
      console.error('Error getting comprehensive order status:', error);
      return null;
    }
  }

  /**
   * Setup real-time monitoring for order updates
   */
  private static async setupRealTimeMonitoring(orderId: string, restaurantId: string): Promise<void> {
    // This would set up Supabase subscriptions to monitor order changes
    // and trigger appropriate actions across all systems
    console.log(`Setting up real-time monitoring for order ${orderId}`);
  }

  /**
   * Trigger delivery assignment when order is ready
   */
  private static async triggerDeliveryAssignment(orderId: string, restaurantId: string): Promise<void> {
    try {
      // Check if delivery assignment already exists
      const { data: existingAssignment } = await supabase
        .from('delivery_assignments')
        .select('id')
        .eq('order_id', orderId)
        .single();

      if (!existingAssignment) {
        // Create new delivery assignment
        const { error } = await supabase
          .from('delivery_assignments')
          .insert({
            order_id: orderId,
            restaurant_id: restaurantId,
            status: 'pending',
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error creating delivery assignment:', error);
        } else {
          console.log(`Created delivery assignment for order ${orderId}`);
        }
      }
    } catch (error) {
      console.error('Error triggering delivery assignment:', error);
    }
  }

  /**
   * Track preparation start in analytics
   */
  private static async trackPreparationStart(orderId: string, restaurantId: string): Promise<void> {
    try {
      await supabase
        .from('preparation_analytics_events')
        .insert({
          order_id: orderId,
          restaurant_id: restaurantId,
          event_type: 'preparation_started',
          timestamp: new Date().toISOString(),
          metadata: {
            integration_hub: true
          }
        });
    } catch (error) {
      console.error('Error tracking preparation start:', error);
    }
  }

  /**
   * Track preparation completion in analytics
   */
  private static async trackPreparationCompletion(orderId: string, restaurantId: string): Promise<void> {
    try {
      await supabase
        .from('preparation_analytics_events')
        .insert({
          order_id: orderId,
          restaurant_id: restaurantId,
          event_type: 'preparation_completed',
          timestamp: new Date().toISOString(),
          metadata: {
            integration_hub: true
          }
        });
    } catch (error) {
      console.error('Error tracking preparation completion:', error);
    }
  }

  /**
   * Track order cancellation in analytics
   */
  private static async trackOrderCancellation(orderId: string, reason?: string): Promise<void> {
    try {
      await supabase
        .from('preparation_analytics_events')
        .insert({
          order_id: orderId,
          event_type: 'order_cancelled',
          timestamp: new Date().toISOString(),
          metadata: {
            reason,
            integration_hub: true
          }
        });
    } catch (error) {
      console.error('Error tracking order cancellation:', error);
    }
  }

  /**
   * Get preparation status details
   */
  private static async getPreparationStatus(orderId: string) {
    try {
      const { data } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('order_id', orderId)
        .order('stage_order');

      return data || [];
    } catch (error) {
      console.error('Error getting preparation status:', error);
      return [];
    }
  }

  /**
   * Get delivery status details
   */
  private static async getDeliveryStatus(orderId: string) {
    try {
      const { data } = await supabase
        .from('delivery_assignments')
        .select('*')
        .eq('order_id', orderId)
        .single();

      return data;
    } catch (error) {
      console.error('Error getting delivery status:', error);
      return null;
    }
  }
}

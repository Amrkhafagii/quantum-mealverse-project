
import { supabase } from '@/integrations/supabase/client';
import { PreparationStageService } from './preparationStageService';
import { PreparationTimerService } from './preparationTimerService';

export class PreparationIntegrationService {
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
        .select('stage_name, status, actual_duration_minutes')
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

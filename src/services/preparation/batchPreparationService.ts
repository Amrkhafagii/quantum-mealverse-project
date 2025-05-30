
import { supabase } from '@/integrations/supabase/client';
import { PreparationStageService } from './preparationStageService';
import { toast } from 'react-hot-toast';

export interface BatchStageUpdate {
  orderId: string;
  stageName: string;
  notes?: string;
}

export interface BatchStageResult {
  orderId: string;
  stageName: string;
  success: boolean;
  message: string;
}

export interface BatchOrderStatusUpdate {
  orderId: string;
  newStatus: string;
  notes?: string;
}

export class BatchPreparationService {
  /**
   * Process multiple stage updates in a single batch operation
   */
  static async batchAdvanceStages(updates: BatchStageUpdate[]): Promise<BatchStageResult[]> {
    if (updates.length === 0) return [];

    const results: BatchStageResult[] = [];
    const batchSize = 10; // Process in chunks to avoid overwhelming the database

    // Process updates in batches
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const batchResults = await this.processStageBatch(batch);
      results.push(...batchResults);
    }

    // Show summary toast
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    if (successCount > 0) {
      toast.success(`Successfully advanced ${successCount} stages`);
    }
    if (failureCount > 0) {
      toast.error(`Failed to advance ${failureCount} stages`);
    }

    return results;
  }

  /**
   * Process a single batch of stage updates
   */
  private static async processStageBatch(batch: BatchStageUpdate[]): Promise<BatchStageResult[]> {
    const promises = batch.map(async (update) => {
      try {
        const result = await PreparationStageService.advanceStage(
          update.orderId,
          update.stageName,
          update.notes
        );

        return {
          orderId: update.orderId,
          stageName: update.stageName,
          success: result.success,
          message: result.message
        };
      } catch (error) {
        console.error(`Error processing stage update for order ${update.orderId}:`, error);
        return {
          orderId: update.orderId,
          stageName: update.stageName,
          success: false,
          message: 'Failed to process stage update'
        };
      }
    });

    return Promise.all(promises);
  }

  /**
   * Batch update multiple order statuses
   */
  static async batchUpdateOrderStatuses(updates: BatchOrderStatusUpdate[]): Promise<boolean> {
    if (updates.length === 0) return true;

    try {
      // Use a single transaction for all updates
      const { error } = await supabase.rpc('batch_update_order_statuses', {
        p_updates: updates.map(update => ({
          order_id: update.orderId,
          new_status: update.newStatus,
          notes: update.notes || null
        }))
      });

      if (error) {
        console.error('Batch order status update failed:', error);
        toast.error('Failed to update order statuses');
        return false;
      }

      toast.success(`Successfully updated ${updates.length} orders`);
      return true;
    } catch (error) {
      console.error('Error in batch order status update:', error);
      toast.error('Failed to update order statuses');
      return false;
    }
  }

  /**
   * Batch update stage notes for multiple orders
   */
  static async batchUpdateStageNotes(
    updates: Array<{ orderId: string; stageName: string; notes: string }>
  ): Promise<boolean> {
    if (updates.length === 0) return true;

    try {
      const updatePromises = updates.map(update => 
        supabase
          .from('order_preparation_stages')
          .update({
            notes: update.notes,
            updated_at: new Date().toISOString()
          })
          .eq('order_id', update.orderId)
          .eq('stage_name', update.stageName)
      );

      const results = await Promise.all(updatePromises);
      const hasErrors = results.some(result => result.error);

      if (hasErrors) {
        toast.error('Some notes failed to update');
        return false;
      }

      toast.success(`Updated notes for ${updates.length} stages`);
      return true;
    } catch (error) {
      console.error('Error in batch notes update:', error);
      toast.error('Failed to update stage notes');
      return false;
    }
  }

  /**
   * Batch mark multiple stages as ready
   */
  static async batchMarkOrdersReady(orderIds: string[]): Promise<BatchStageResult[]> {
    const updates = orderIds.map(orderId => ({
      orderId,
      stageName: 'ready',
      notes: 'Batch marked as ready'
    }));

    return this.batchAdvanceStages(updates);
  }

  /**
   * Batch skip stages for multiple orders
   */
  static async batchSkipStages(
    updates: Array<{ orderId: string; stageName: string; reason?: string }>
  ): Promise<boolean> {
    if (updates.length === 0) return true;

    try {
      const skipPromises = updates.map(update =>
        supabase
          .from('order_preparation_stages')
          .update({
            status: 'skipped',
            notes: update.reason || 'Batch skipped',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('order_id', update.orderId)
          .eq('stage_name', update.stageName)
      );

      const results = await Promise.all(skipPromises);
      const hasErrors = results.some(result => result.error);

      if (hasErrors) {
        toast.error('Some stages failed to skip');
        return false;
      }

      toast.success(`Skipped ${updates.length} stages`);
      return true;
    } catch (error) {
      console.error('Error in batch skip stages:', error);
      toast.error('Failed to skip stages');
      return false;
    }
  }

  /**
   * Get batch processing summary for a restaurant
   */
  static async getBatchProcessingSummary(restaurantId: string): Promise<{
    pendingStages: number;
    inProgressStages: number;
    completedToday: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [pendingResult, inProgressResult, completedResult] = await Promise.all([
        supabase
          .from('order_preparation_stages')
          .select('id', { count: 'exact' })
          .eq('restaurant_id', restaurantId)
          .eq('status', 'pending'),
        
        supabase
          .from('order_preparation_stages')
          .select('id', { count: 'exact' })
          .eq('restaurant_id', restaurantId)
          .eq('status', 'in_progress'),
        
        supabase
          .from('order_preparation_stages')
          .select('id', { count: 'exact' })
          .eq('restaurant_id', restaurantId)
          .eq('status', 'completed')
          .gte('completed_at', `${today}T00:00:00.000Z`)
          .lt('completed_at', `${today}T23:59:59.999Z`)
      ]);

      return {
        pendingStages: pendingResult.count || 0,
        inProgressStages: inProgressResult.count || 0,
        completedToday: completedResult.count || 0
      };
    } catch (error) {
      console.error('Error getting batch processing summary:', error);
      return {
        pendingStages: 0,
        inProgressStages: 0,
        completedToday: 0
      };
    }
  }
}

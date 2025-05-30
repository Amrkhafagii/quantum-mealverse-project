
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
  error?: string;
}

export interface BatchOrderStatusUpdate {
  orderId: string;
  newStatus: string;
  notes?: string;
}

export interface BatchProcessingStats {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ orderId: string; error: string }>;
}

export class BatchPreparationService {
  /**
   * Process multiple stage updates in optimized batches with enhanced error tracking
   */
  static async batchAdvanceStages(updates: BatchStageUpdate[]): Promise<BatchStageResult[]> {
    if (updates.length === 0) {
      console.log('[BatchPrep] No updates to process');
      return [];
    }

    console.log(`[BatchPrep] Starting batch processing of ${updates.length} stage updates`);
    const startTime = Date.now();
    
    const results: BatchStageResult[] = [];
    const batchSize = 5; // Reduced batch size for better error isolation
    const stats: BatchProcessingStats = {
      total: updates.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      // Process updates in smaller, manageable batches
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(updates.length / batchSize);
        
        console.log(`[BatchPrep] Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`);
        
        try {
          const batchResults = await this.processStageBatch(batch, batchNumber);
          results.push(...batchResults);
          
          // Update stats
          batchResults.forEach(result => {
            if (result.success) {
              stats.successful++;
            } else {
              stats.failed++;
              stats.errors.push({
                orderId: result.orderId,
                error: result.error || result.message
              });
            }
          });
          
          // Brief pause between batches to avoid overwhelming the database
          if (i + batchSize < updates.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
        } catch (batchError) {
          console.error(`[BatchPrep] Batch ${batchNumber} failed completely:`, batchError);
          
          // Mark all items in this batch as failed
          batch.forEach(update => {
            results.push({
              orderId: update.orderId,
              stageName: update.stageName,
              success: false,
              message: 'Batch processing failed',
              error: batchError instanceof Error ? batchError.message : 'Unknown batch error'
            });
            stats.failed++;
            stats.errors.push({
              orderId: update.orderId,
              error: `Batch ${batchNumber} failed: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`
            });
          });
        }
      }

      const processingTime = Date.now() - startTime;
      console.log(`[BatchPrep] Batch processing completed in ${processingTime}ms:`, stats);

      // Enhanced user notifications with detailed feedback
      this.showBatchResults(stats, processingTime);

      return results;
      
    } catch (error) {
      console.error('[BatchPrep] Critical error in batch processing:', error);
      toast.error('Critical error occurred during batch processing. Please try again.');
      throw error;
    }
  }

  /**
   * Process a single batch of stage updates with enhanced error handling
   */
  private static async processStageBatch(
    batch: BatchStageUpdate[], 
    batchNumber: number
  ): Promise<BatchStageResult[]> {
    console.log(`[BatchPrep] Processing batch ${batchNumber} with ${batch.length} updates`);
    
    // Use Promise.allSettled to handle individual failures gracefully
    const promises = batch.map(async (update, index) => {
      const updateId = `${batchNumber}-${index}`;
      try {
        console.log(`[BatchPrep] Processing update ${updateId}: Order ${update.orderId.slice(0, 8)} - ${update.stageName}`);
        
        const result = await PreparationStageService.advanceStage(
          update.orderId,
          update.stageName,
          update.notes
        );

        console.log(`[BatchPrep] Update ${updateId} ${result.success ? 'succeeded' : 'failed'}: ${result.message}`);

        return {
          orderId: update.orderId,
          stageName: update.stageName,
          success: result.success,
          message: result.message,
          error: result.success ? undefined : result.message
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[BatchPrep] Update ${updateId} threw error:`, {
          orderId: update.orderId,
          stageName: update.stageName,
          error: errorMessage
        });
        
        return {
          orderId: update.orderId,
          stageName: update.stageName,
          success: false,
          message: 'Processing failed with exception',
          error: errorMessage
        };
      }
    });

    const settledResults = await Promise.allSettled(promises);
    
    return settledResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const update = batch[index];
        console.error(`[BatchPrep] Promise rejected for update ${batchNumber}-${index}:`, result.reason);
        return {
          orderId: update.orderId,
          stageName: update.stageName,
          success: false,
          message: 'Promise rejection',
          error: result.reason instanceof Error ? result.reason.message : 'Promise rejected'
        };
      }
    });
  }

  /**
   * Enhanced user notifications with detailed context
   */
  private static showBatchResults(stats: BatchProcessingStats, processingTime: number): void {
    const { total, successful, failed, errors } = stats;
    
    if (failed === 0) {
      toast.success(
        `✅ Successfully processed all ${successful} stage updates in ${Math.round(processingTime)}ms`,
        { duration: 4000 }
      );
    } else if (successful > 0) {
      toast(
        `⚠️ Mixed results: ${successful} succeeded, ${failed} failed out of ${total} updates`,
        { 
          duration: 6000,
          icon: '⚠️'
        }
      );
      
      // Show detailed error information
      const errorSummary = errors.slice(0, 3).map(e => 
        `Order ${e.orderId.slice(0, 8)}: ${e.error}`
      ).join('\n');
      
      if (errors.length > 3) {
        console.log('[BatchPrep] Additional errors:', errors.slice(3));
      }
      
    } else {
      toast.error(
        `❌ All ${failed} stage updates failed. Check console for details.`,
        { duration: 8000 }
      );
      
      // Log all errors for debugging
      console.error('[BatchPrep] All updates failed:', errors);
    }
  }

  /**
   * Batch update multiple order statuses with improved chunking
   */
  static async batchUpdateOrderStatuses(updates: BatchOrderStatusUpdate[]): Promise<boolean> {
    if (updates.length === 0) {
      console.log('[BatchPrep] No order status updates to process');
      return true;
    }

    console.log(`[BatchPrep] Starting batch order status update for ${updates.length} orders`);
    const chunkSize = 10;
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    try {
      // Process in chunks for better performance and error isolation
      for (let i = 0; i < updates.length; i += chunkSize) {
        const chunk = updates.slice(i, i + chunkSize);
        console.log(`[BatchPrep] Processing order status chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(updates.length/chunkSize)}`);
        
        const chunkPromises = chunk.map(async (update) => {
          try {
            const { error } = await supabase
              .from('orders')
              .update({
                status: update.newStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', update.orderId);

            if (error) throw error;
            return { success: true, orderId: update.orderId };
          } catch (error) {
            const errorMsg = `Order ${update.orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            errors.push(errorMsg);
            return { success: false, orderId: update.orderId, error: errorMsg };
          }
        });

        const chunkResults = await Promise.allSettled(chunkPromises);
        
        chunkResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.success) {
            successCount++;
          } else {
            failCount++;
            const update = chunk[index];
            const errorMsg = result.status === 'fulfilled' 
              ? result.value.error 
              : `Order ${update.orderId}: Promise rejected`;
            if (!errors.includes(errorMsg)) {
              errors.push(errorMsg);
            }
          }
        });
      }

      // Enhanced user feedback
      if (failCount === 0) {
        toast.success(`Successfully updated ${successCount} order statuses`);
        console.log(`[BatchPrep] All ${successCount} order status updates succeeded`);
        return true;
      } else {
        const message = successCount > 0 
          ? `Updated ${successCount} orders, ${failCount} failed`
          : `Failed to update ${failCount} order statuses`;
        
        toast.error(message);
        console.error(`[BatchPrep] Order status update errors:`, errors);
        return false;
      }
      
    } catch (error) {
      console.error('[BatchPrep] Critical error in batch order status update:', error);
      toast.error('Critical error during order status update');
      return false;
    }
  }

  /**
   * Batch update stage notes with enhanced error tracking
   */
  static async batchUpdateStageNotes(
    updates: Array<{ orderId: string; stageName: string; notes: string }>
  ): Promise<boolean> {
    if (updates.length === 0) return true;

    console.log(`[BatchPrep] Starting batch notes update for ${updates.length} stages`);
    const errors: string[] = [];
    let successCount = 0;

    try {
      const updatePromises = updates.map(async (update) => {
        try {
          const { error } = await supabase
            .from('order_preparation_stages')
            .update({
              notes: update.notes,
              updated_at: new Date().toISOString()
            })
            .eq('order_id', update.orderId)
            .eq('stage_name', update.stageName);

          if (error) throw error;
          successCount++;
          return { success: true };
        } catch (error) {
          const errorMsg = `${update.orderId}-${update.stageName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          return { success: false, error: errorMsg };
        }
      });

      await Promise.all(updatePromises);

      if (errors.length === 0) {
        toast.success(`Updated notes for ${successCount} stages`);
        console.log(`[BatchPrep] Successfully updated ${successCount} stage notes`);
        return true;
      } else {
        toast.error(`Updated ${successCount} notes, ${errors.length} failed`);
        console.error('[BatchPrep] Notes update errors:', errors);
        return false;
      }
    } catch (error) {
      console.error('[BatchPrep] Critical error in batch notes update:', error);
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

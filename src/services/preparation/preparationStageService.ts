
import { supabase } from '@/integrations/supabase/client';

export interface PreparationStage {
  id: string;
  order_id: string;
  restaurant_id: string;
  stage_name: string;
  stage_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class PreparationStageService {
  /**
   * Reusable helper: Get stages by status
   */
  private static async getStagesByStatus(
    orderId: string, 
    status: PreparationStage['status'] | PreparationStage['status'][]
  ): Promise<PreparationStage[]> {
    const statusArray = Array.isArray(status) ? status : [status];
    
    const { data, error } = await supabase
      .from('order_preparation_stages')
      .select('*')
      .eq('order_id', orderId)
      .in('status', statusArray)
      .order('stage_order');

    if (error) {
      console.error(`Error fetching stages with status ${status}:`, error);
      return [];
    }

    return data || [];
  }

  /**
   * Reusable helper: Get stages by restaurant and status
   */
  private static async getRestaurantStagesByStatus(
    restaurantId: string,
    status: PreparationStage['status'] | PreparationStage['status'][]
  ): Promise<PreparationStage[]> {
    const statusArray = Array.isArray(status) ? status : [status];
    
    const { data, error } = await supabase
      .from('order_preparation_stages')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .in('status', statusArray)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching restaurant stages with status ${status}:`, error);
      return [];
    }

    return data || [];
  }

  /**
   * Get active stages (pending or in_progress)
   */
  static async getActiveStages(orderId: string): Promise<PreparationStage[]> {
    return this.getStagesByStatus(orderId, ['pending', 'in_progress']);
  }

  /**
   * Get completed stages
   */
  static async getCompletedStages(orderId: string): Promise<PreparationStage[]> {
    return this.getStagesByStatus(orderId, 'completed');
  }

  /**
   * Get all active stages for a restaurant
   */
  static async getRestaurantActiveStages(restaurantId: string): Promise<PreparationStage[]> {
    return this.getRestaurantStagesByStatus(restaurantId, ['pending', 'in_progress']);
  }

  /**
   * Get current stage (in_progress status)
   */
  static async getCurrentStage(orderId: string): Promise<PreparationStage | null> {
    const stages = await this.getStagesByStatus(orderId, 'in_progress');
    return stages.length > 0 ? stages[0] : null;
  }

  /**
   * Get next pending stage
   */
  static async getNextPendingStage(orderId: string): Promise<PreparationStage | null> {
    const stages = await this.getStagesByStatus(orderId, 'pending');
    return stages.length > 0 ? stages[0] : null;
  }

  /**
   * Reusable helper: Update stage status with timestamp
   */
  private static async updateStageStatus(
    stageId: string,
    status: PreparationStage['status'],
    additionalFields: Partial<PreparationStage> = {}
  ): Promise<boolean> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
      ...additionalFields
    };

    // Add appropriate timestamp field
    if (status === 'in_progress') {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('order_preparation_stages')
      .update(updateData)
      .eq('id', stageId);

    if (error) {
      console.error(`Error updating stage ${stageId} to ${status}:`, error);
      return false;
    }

    return true;
  }

  /**
   * Start a specific stage
   */
  static async startStage(orderId: string, stageName: string): Promise<boolean> {
    try {
      // Get the stage to start
      const { data: stage, error } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('order_id', orderId)
        .eq('stage_name', stageName)
        .eq('status', 'pending')
        .single();

      if (error || !stage) {
        console.error(`Stage ${stageName} not found or not pending for order ${orderId}`);
        return false;
      }

      return await this.updateStageStatus(stage.id, 'in_progress');
    } catch (error) {
      console.error(`Error starting stage ${stageName}:`, error);
      return false;
    }
  }

  /**
   * Complete a stage and advance to next
   */
  static async advanceStage(
    orderId: string, 
    currentStageName: string, 
    notes?: string
  ): Promise<{ success: boolean; nextStage?: string }> {
    try {
      // Get current stage
      const { data: currentStage, error: currentError } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('order_id', orderId)
        .eq('stage_name', currentStageName)
        .eq('status', 'in_progress')
        .single();

      if (currentError || !currentStage) {
        console.error(`Current stage ${currentStageName} not found for order ${orderId}`);
        return { success: false };
      }

      // Calculate actual duration
      const startTime = new Date(currentStage.started_at!);
      const endTime = new Date();
      const actualDurationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      // Complete current stage
      const completed = await this.updateStageStatus(currentStage.id, 'completed', {
        actual_duration_minutes: actualDurationMinutes,
        notes
      });

      if (!completed) {
        return { success: false };
      }

      // Get next pending stage
      const nextStage = await this.getNextPendingStage(orderId);
      
      if (nextStage) {
        // Start next stage
        const nextStarted = await this.updateStageStatus(nextStage.id, 'in_progress');
        return { 
          success: nextStarted, 
          nextStage: nextStarted ? nextStage.stage_name : undefined 
        };
      }

      return { success: true };
    } catch (error) {
      console.error(`Error advancing stage ${currentStageName}:`, error);
      return { success: false };
    }
  }

  /**
   * Get preparation progress with reusable queries
   */
  static async getPreparationProgress(orderId: string): Promise<PreparationStage[]> {
    const { data, error } = await supabase
      .from('order_preparation_stages')
      .select('*')
      .eq('order_id', orderId)
      .order('stage_order');

    if (error) {
      console.error('Error fetching preparation progress:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get all order preparation stages (reusable)
   */
  static async getOrderPreparationStages(orderId: string): Promise<PreparationStage[]> {
    return this.getPreparationProgress(orderId);
  }

  /**
   * Bulk update stages for restaurant efficiency
   */
  static async bulkUpdateRestaurantStages(
    restaurantId: string,
    updates: Array<{ stageId: string; status: PreparationStage['status']; notes?: string }>
  ): Promise<boolean> {
    try {
      const updatePromises = updates.map(update => 
        this.updateStageStatus(update.stageId, update.status, { notes: update.notes })
      );

      const results = await Promise.all(updatePromises);
      const successCount = results.filter(result => result).length;

      console.log(`Bulk updated ${successCount}/${updates.length} stages for restaurant ${restaurantId}`);
      return successCount === updates.length;
    } catch (error) {
      console.error('Error in bulk stage update:', error);
      return false;
    }
  }

  /**
   * Get stage statistics for analytics
   */
  static async getStageStatistics(restaurantId: string, timeRange?: { from: Date; to: Date }): Promise<{
    averageDurations: Record<string, number>;
    completionRates: Record<string, number>;
    totalStages: number;
  }> {
    try {
      let query = supabase
        .from('order_preparation_stages')
        .select('stage_name, status, actual_duration_minutes, estimated_duration_minutes')
        .eq('restaurant_id', restaurantId);

      if (timeRange) {
        query = query
          .gte('created_at', timeRange.from.toISOString())
          .lte('created_at', timeRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error || !data) {
        console.error('Error fetching stage statistics:', error);
        return { averageDurations: {}, completionRates: {}, totalStages: 0 };
      }

      const stageStats: Record<string, { durations: number[]; completed: number; total: number }> = {};

      data.forEach(stage => {
        if (!stageStats[stage.stage_name]) {
          stageStats[stage.stage_name] = { durations: [], completed: 0, total: 0 };
        }

        stageStats[stage.stage_name].total++;
        
        if (stage.status === 'completed') {
          stageStats[stage.stage_name].completed++;
          if (stage.actual_duration_minutes) {
            stageStats[stage.stage_name].durations.push(stage.actual_duration_minutes);
          }
        }
      });

      const averageDurations: Record<string, number> = {};
      const completionRates: Record<string, number> = {};

      Object.entries(stageStats).forEach(([stageName, stats]) => {
        averageDurations[stageName] = stats.durations.length > 0
          ? stats.durations.reduce((sum, duration) => sum + duration, 0) / stats.durations.length
          : 0;
        
        completionRates[stageName] = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
      });

      return {
        averageDurations,
        completionRates,
        totalStages: data.length
      };
    } catch (error) {
      console.error('Error calculating stage statistics:', error);
      return { averageDurations: {}, completionRates: {}, totalStages: 0 };
    }
  }
}

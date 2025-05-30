import { supabase } from '@/integrations/supabase/client';

export interface PreparationStage {
  id: string;
  order_id: string;
  restaurant_id: string;
  stage_name: string;
  stage_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
  started_at: string | null;
  completed_at: string | null;
  estimated_duration_minutes: number;
  actual_duration_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StageAdvanceResult {
  success: boolean;
  nextStage?: string;
  message?: string;
}

export class PreparationStageService {
  /**
   * Helper function to handle database errors
   */
  private static handleDbError(error: any, message: string): void {
    console.error(`${message}:`, error);
    throw new Error(message);
  }

  /**
   * Helper function to construct stage data from database result
   */
  private static constructStageData(data: any[]): PreparationStage[] {
    return (data || []).map(stage => ({
      id: stage.id,
      order_id: stage.order_id,
      restaurant_id: stage.restaurant_id,
      stage_name: stage.stage_name,
      stage_order: stage.stage_order,
      status: stage.status as PreparationStage['status'],
      started_at: stage.started_at,
      completed_at: stage.completed_at,
      estimated_duration_minutes: stage.estimated_duration_minutes,
      actual_duration_minutes: stage.actual_duration_minutes,
      notes: stage.notes,
      created_at: stage.created_at,
      updated_at: stage.updated_at
    }));
  }

  /**
   * Get all preparation stages for an order
   */
  static async getOrderPreparationStages(orderId: string): Promise<PreparationStage[]> {
    const { data, error } = await supabase
      .from('order_preparation_stages')
      .select('*')
      .eq('order_id', orderId)
      .order('stage_order');

    if (error) {
      console.error('Error fetching preparation stages:', error);
      throw error;
    }

    return (data || []).map(stage => ({
      ...stage,
      status: stage.status as PreparationStage['status']
    }));
  }

  /**
   * Get active stages for a restaurant
   */
  static async getActiveStagesForRestaurant(restaurantId: string): Promise<PreparationStage[]> {
    const { data, error } = await supabase
      .from('order_preparation_stages')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'in_progress')
      .order('started_at');

    if (error) {
      console.error('Error fetching active stages:', error);
      throw error;
    }

    return (data || []).map(stage => ({
      ...stage,
      status: stage.status as PreparationStage['status']
    }));
  }

  /**
   * Initialize order stages
   */
  static async initializeOrderStages(orderId: string, restaurantId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('create_default_preparation_stages', {
        p_order_id: orderId,
        p_restaurant_id: restaurantId
      });

      if (error) {
        console.error('Error initializing order stages:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in initializeOrderStages:', error);
      return false;
    }
  }

  /**
   * Start a specific stage
   */
  static async startStage(orderId: string, stageName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('order_preparation_stages')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('stage_name', stageName);

      if (error) {
        console.error('Error starting stage:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in startStage:', error);
      return false;
    }
  }

  /**
   * Advance to next stage
   */
  static async advanceStage(orderId: string, stageName: string, notes?: string): Promise<StageAdvanceResult> {
    try {
      // Complete current stage
      const { error: completeError } = await supabase
        .from('order_preparation_stages')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes: notes || null
        })
        .eq('order_id', orderId)
        .eq('stage_name', stageName);

      if (completeError) {
        console.error('Error completing stage:', completeError);
        return { 
          success: false, 
          message: 'Failed to complete current stage' 
        };
      }

      // Find next stage
      const { data: nextStageData } = await supabase
        .from('order_preparation_stages')
        .select('stage_name')
        .eq('order_id', orderId)
        .eq('status', 'pending')
        .order('stage_order')
        .limit(1);

      if (nextStageData && nextStageData.length > 0) {
        const nextStageName = nextStageData[0].stage_name;
        
        // Start next stage
        const { error: startError } = await supabase
          .from('order_preparation_stages')
          .update({
            status: 'in_progress',
            started_at: new Date().toISOString()
          })
          .eq('order_id', orderId)
          .eq('stage_name', nextStageName);

        if (startError) {
          console.error('Error starting next stage:', startError);
          return { 
            success: false, 
            message: 'Failed to start next stage' 
          };
        }

        return { 
          success: true, 
          nextStage: nextStageName,
          message: `Advanced to ${nextStageName} stage`
        };
      }

      return { 
        success: true, 
        message: 'All stages completed' 
      };
    } catch (error) {
      console.error('Error advancing stage:', error);
      return { 
        success: false, 
        message: 'Failed to advance stage' 
      };
    }
  }

  /**
   * Update stage notes
   */
  static async updateStageNotes(orderId: string, stageName: string, notes: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('order_preparation_stages')
        .update({
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('stage_name', stageName);

      if (error) {
        console.error('Error updating stage notes:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateStageNotes:', error);
      return false;
    }
  }

  /**
   * Get estimated completion time
   */
  static async getEstimatedCompletionTime(orderId: string): Promise<Date | null> {
    try {
      const { data: stages } = await supabase
        .from('order_preparation_stages')
        .select('status, estimated_duration_minutes, started_at')
        .eq('order_id', orderId)
        .order('stage_order');

      if (!stages || stages.length === 0) {
        return null;
      }

      let totalRemainingMinutes = 0;
      let currentTime = new Date();

      for (const stage of stages) {
        if (stage.status === 'pending') {
          totalRemainingMinutes += stage.estimated_duration_minutes;
        } else if (stage.status === 'in_progress' && stage.started_at) {
          const startTime = new Date(stage.started_at);
          const elapsedMinutes = (currentTime.getTime() - startTime.getTime()) / (1000 * 60);
          const remainingMinutes = Math.max(0, stage.estimated_duration_minutes - elapsedMinutes);
          totalRemainingMinutes += remainingMinutes;
        }
      }

      const estimatedCompletion = new Date(currentTime.getTime() + (totalRemainingMinutes * 60 * 1000));
      return estimatedCompletion;
    } catch (error) {
      console.error('Error calculating estimated completion time:', error);
      return null;
    }
  }

  /**
   * Get preparation progress
   */
  static async getPreparationProgress(orderId: string): Promise<PreparationStage[]> {
    const { data, error } = await supabase
      .from('order_preparation_stages')
      .select('*')
      .eq('order_id', orderId)
      .order('stage_order');

    if (error) {
      console.error('Error fetching preparation progress:', error);
      throw error;
    }

    return (data || []).map(stage => ({
      ...stage,
      status: stage.status as PreparationStage['status']
    }));
  }

  /**
   * Bulk update stages
   */
  static async bulkUpdateStages(stages: Partial<PreparationStage>[]): Promise<boolean> {
    try {
      if (stages.length === 0) {
        console.warn('No stages provided for bulk update.');
        return true;
      }

      const { error } = await supabase
        .from('order_preparation_stages')
        .upsert(stages);

      if (error) {
        console.error('Error during bulk stage update:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in bulkUpdateStages:', error);
      return false;
    }
  }

  /**
   * Get average stage completion time
   */
  static async getAverageStageCompletionTime(stageName: string, restaurantId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('order_preparation_stages')
        .select('actual_duration_minutes')
        .eq('stage_name', stageName)
        .eq('restaurant_id', restaurantId)
        .not('actual_duration_minutes', 'is', null);

      if (error) {
        console.error('Error fetching stage completion times:', error);
        return 0;
      }

      const validDurations = data?.map(item => item.actual_duration_minutes).filter(duration => typeof duration === 'number') as number[];
      if (!validDurations || validDurations.length === 0) return 0;

      const totalDuration = validDurations.reduce((sum, duration) => sum + duration, 0);
      return totalDuration / validDurations.length;
    } catch (error) {
      console.error('Error in getAverageStageCompletionTime:', error);
      return 0;
    }
  }

  /**
   * Get total number of completed stages
   */
  static async getTotalCompletedStages(restaurantId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('order_preparation_stages')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching total completed stages:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getTotalCompletedStages:', error);
      return 0;
    }
  }
}

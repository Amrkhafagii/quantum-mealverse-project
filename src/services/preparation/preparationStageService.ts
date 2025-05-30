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

export interface StageAdvanceResult {
  success: boolean;
  message?: string;
  nextStage?: string;
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
  static async getActiveStages(restaurantId: string): Promise<PreparationStage[]> {
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
   * Get completed stages for a restaurant
   */
  static async getCompletedStages(restaurantId: string): Promise<PreparationStage[]> {
    const { data, error } = await supabase
      .from('order_preparation_stages')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'completed')
      .order('stage_order');

    if (error) {
      console.error('Error fetching completed stages:', error);
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
      const defaultStages = [
        { name: 'order_received', order: 1, duration: 5 },
        { name: 'preparation_started', order: 2, duration: 15 },
        { name: 'cooking', order: 3, duration: 20 },
        { name: 'quality_check', order: 4, duration: 5 },
        { name: 'packaging', order: 5, duration: 5 },
        { name: 'ready_for_pickup', order: 6, duration: 0 }
      ];

      const stagesToInsert = defaultStages.map(stage => ({
        order_id: orderId,
        restaurant_id: restaurantId,
        stage_name: stage.name,
        stage_order: stage.order,
        status: stage.order === 1 ? 'in_progress' as const : 'pending' as const,
        estimated_duration_minutes: stage.duration,
        started_at: stage.order === 1 ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('order_preparation_stages')
        .insert(stagesToInsert);

      return !error;
    } catch (error) {
      console.error('Error initializing order stages:', error);
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
      const { data: currentStage, error: fetchError } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('order_id', orderId)
        .eq('stage_name', stageName)
        .single();

      if (fetchError || !currentStage) {
        return { 
          success: false, 
          message: `Stage ${stageName} not found for order ${orderId}` 
        };
      }

      const now = new Date().toISOString();
      let updateData: any = {
        status: 'completed',
        completed_at: now,
        updated_at: now
      };

      if (notes) {
        updateData.notes = notes;
      }

      if (currentStage.started_at) {
        const startTime = new Date(currentStage.started_at);
        const endTime = new Date(now);
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
        updateData.actual_duration_minutes = durationMinutes;
      }

      const { error: updateError } = await supabase
        .from('order_preparation_stages')
        .update(updateData)
        .eq('order_id', orderId)
        .eq('stage_name', stageName);

      if (updateError) {
        console.error('Error updating stage:', updateError);
        return { 
          success: false, 
          message: `Failed to update stage ${stageName}` 
        };
      }

      // Start next stage if exists
      const { data: nextStage } = await supabase
        .from('order_preparation_stages')
        .select('stage_name')
        .eq('order_id', orderId)
        .eq('status', 'pending')
        .order('stage_order', { ascending: true })
        .limit(1)
        .single();

      if (nextStage) {
        await supabase
          .from('order_preparation_stages')
          .update({
            status: 'in_progress',
            started_at: now,
            updated_at: now
          })
          .eq('order_id', orderId)
          .eq('stage_name', nextStage.stage_name);

        return { 
          success: true, 
          message: `Stage ${stageName} completed, ${nextStage.stage_name} started`,
          nextStage: nextStage.stage_name 
        };
      }

      return { 
        success: true, 
        message: `Stage ${stageName} completed` 
      };
    } catch (error) {
      console.error('Error in advanceStage:', error);
      return { 
        success: false, 
        message: 'Failed to advance stage due to an unexpected error' 
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
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('stage_name', stageName);

      return !error;
    } catch (error) {
      console.error('Error updating stage notes:', error);
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
        .select('*')
        .eq('order_id', orderId)
        .order('stage_order', { ascending: true });

      if (!stages || stages.length === 0) return null;

      const currentStage = stages.find(s => s.status === 'in_progress');
      if (!currentStage) return null;

      const remainingStages = stages.filter(s => s.status === 'pending' || s.status === 'in_progress');
      const totalRemainingMinutes = remainingStages.reduce((total, stage) => {
        return total + (stage.estimated_duration_minutes || 0);
      }, 0);

      const now = new Date();
      const estimatedCompletion = new Date(now.getTime() + (totalRemainingMinutes * 60 * 1000));
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
   * Get current stage
   */
  static async getCurrentStage(orderId: string): Promise<PreparationStage | null> {
    try {
      const { data: stage } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('order_id', orderId)
        .eq('status', 'in_progress')
        .single();

      return stage as PreparationStage || null;
    } catch (error) {
      console.error('Error getting current stage:', error);
      return null;
    }
  }

  /**
   * Get stage stats
   */
  static async getStageStats(orderId: string, stageName: string): Promise<{ duration: number, started_at: string | null, completed_at: string | null }> {
    const { data, error } = await supabase
      .from('order_preparation_stages')
      .select('estimated_duration_minutes, started_at, completed_at')
      .eq('order_id', orderId)
      .eq('stage_name', stageName)
      .single();

    if (error) {
      console.error('Error fetching stage stats:', error);
      throw error;
    }

    return {
      duration: data.estimated_duration_minutes,
      started_at: data.started_at,
      completed_at: data.completed_at
    };
  }

  /**
   * Bulk update stages
   */
  static async bulkUpdateStages(updates: Array<{
    orderId: string;
    stageName: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
    notes?: string;
    restaurantId: string;
  }>): Promise<boolean> {
    try {
      // Process each update individually to ensure proper typing
      const updatePromises = updates.map(async (update) => {
        const updateData: any = {
          updated_at: new Date().toISOString()
        };

        if (update.status) {
          updateData.status = update.status;
          if (update.status === 'completed') {
            updateData.completed_at = new Date().toISOString();
          } else if (update.status === 'in_progress') {
            updateData.started_at = new Date().toISOString();
          }
        }

        if (update.notes) {
          updateData.notes = update.notes;
        }

        return supabase
          .from('order_preparation_stages')
          .update(updateData)
          .eq('order_id', update.orderId)
          .eq('stage_name', update.stageName)
          .eq('restaurant_id', update.restaurantId);
      });

      const results = await Promise.all(updatePromises);
      return results.every(result => !result.error);
    } catch (error) {
      console.error('Error in bulk update stages:', error);
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

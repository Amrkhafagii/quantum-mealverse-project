import { supabase } from '@/integrations/supabase/client';

export interface PreparationStage {
  id: string;
  order_id: string;
  restaurant_id: string;
  stage_name: 'received' | 'ingredients_prep' | 'cooking' | 'plating' | 'quality_check' | 'ready';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  notes?: string;
  stage_order: number;
  created_at: string;
  updated_at: string;
}

export interface PreparationProgress {
  stage_name: string;
  status: string;
  stage_order: number;
  started_at?: string;
  completed_at?: string;
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  notes?: string;
  progress_percentage: number;
}

export interface StageTransitionResult {
  success: boolean;
  completed_stage?: string;
  next_stage?: string;
  message: string;
}

export class PreparationStageService {
  /**
   * Get all preparation stages for an order
   */
  static async getOrderPreparationStages(orderId: string): Promise<PreparationStage[]> {
    const { data, error } = await supabase
      .from('order_preparation_stages')
      .select('*')
      .eq('order_id', orderId)
      .order('stage_order', { ascending: true });

    if (error) {
      console.error('Error fetching preparation stages:', error);
      throw error;
    }

    return (data || []) as PreparationStage[];
  }

  /**
   * Get current active preparation stage for an order
   */
  static async getCurrentStage(orderId: string): Promise<PreparationStage | null> {
    const { data, error } = await supabase
      .from('order_preparation_stages')
      .select('*')
      .eq('order_id', orderId)
      .eq('status', 'in_progress')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching current stage:', error);
      throw error;
    }

    return data as PreparationStage | null;
  }

  /**
   * Get preparation progress summary for an order
   */
  static async getPreparationProgress(orderId: string): Promise<PreparationProgress[]> {
    const { data, error } = await supabase.rpc('get_order_preparation_progress', {
      p_order_id: orderId
    });

    if (error) {
      console.error('Error fetching preparation progress:', error);
      throw error;
    }

    return (data || []) as PreparationProgress[];
  }

  /**
   * Start a specific preparation stage
   */
  static async startStage(orderId: string, stageName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('order_preparation_stages')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('stage_name', stageName)
        .eq('status', 'pending');

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
   * Complete current stage and advance to next
   */
  static async advanceStage(
    orderId: string, 
    currentStageName: string, 
    notes?: string
  ): Promise<StageTransitionResult> {
    try {
      const { data, error } = await supabase.rpc('advance_preparation_stage', {
        p_order_id: orderId,
        p_current_stage_name: currentStageName,
        p_notes: notes
      });

      if (error) {
        console.error('Error advancing stage:', error);
        return {
          success: false,
          message: 'Failed to advance stage'
        };
      }

      // Handle the RPC response properly with type guards
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const result = data as unknown as StageTransitionResult;
        
        // Validate the structure matches our expected interface
        if (typeof result.success === 'boolean' && typeof result.message === 'string') {
          return result;
        }
      }

      return { success: false, message: 'No response from database' };
    } catch (error) {
      console.error('Error in advanceStage:', error);
      return {
        success: false,
        message: 'Failed to advance stage'
      };
    }
  }

  /**
   * Skip a stage (mark as skipped and move to next)
   */
  static async skipStage(orderId: string, stageName: string, reason?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('order_preparation_stages')
        .update({
          status: 'skipped',
          notes: reason,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('stage_name', stageName);

      if (error) {
        console.error('Error skipping stage:', error);
        return false;
      }

      // Find and start next stage
      const { data: nextStage } = await supabase
        .from('order_preparation_stages')
        .select('stage_name')
        .eq('order_id', orderId)
        .eq('status', 'pending')
        .order('stage_order', { ascending: true })
        .limit(1)
        .single();

      if (nextStage) {
        await this.startStage(orderId, nextStage.stage_name);
      }

      return true;
    } catch (error) {
      console.error('Error in skipStage:', error);
      return false;
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
   * Get estimated completion time for an order
   */
  static async getEstimatedCompletionTime(orderId: string): Promise<Date | null> {
    try {
      const stages = await this.getOrderPreparationStages(orderId);
      const currentStage = stages.find(s => s.status === 'in_progress');
      
      if (!currentStage) return null;

      const remainingStages = stages.filter(s => 
        s.stage_order >= currentStage.stage_order && s.status !== 'completed'
      );

      const totalRemainingTime = remainingStages.reduce((total, stage) => {
        return total + stage.estimated_duration_minutes;
      }, 0);

      return new Date(Date.now() + totalRemainingTime * 60 * 1000);
    } catch (error) {
      console.error('Error calculating estimated completion time:', error);
      return null;
    }
  }

  /**
   * Get overall preparation progress percentage
   */
  static async getOverallProgress(orderId: string): Promise<number> {
    try {
      const stages = await this.getOrderPreparationStages(orderId);
      if (stages.length === 0) return 0;

      const completedStages = stages.filter(s => s.status === 'completed').length;
      const inProgressStages = stages.filter(s => s.status === 'in_progress').length;
      
      return Math.round(((completedStages + (inProgressStages * 0.5)) / stages.length) * 100);
    } catch (error) {
      console.error('Error calculating overall progress:', error);
      return 0;
    }
  }
}

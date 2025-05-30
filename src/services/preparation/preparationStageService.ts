
import { supabase } from '@/integrations/supabase/client';

export interface PreparationStage {
  id: string;
  order_id: string;
  restaurant_id: string;
  stage_name: string;
  stage_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PreparationProgress {
  stage_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  stage_order: number;
  started_at?: string;
  completed_at?: string;
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  notes?: string;
  progress_percentage: number;
}

export class PreparationStageService {
  /**
   * Initialize default preparation stages for an order
   */
  static async initializeOrderStages(orderId: string, restaurantId: string): Promise<boolean> {
    try {
      console.log('Creating preparation stages for order:', orderId, 'restaurant:', restaurantId);

      // Check if stages already exist
      const { data: existingStages } = await supabase
        .from('order_preparation_stages')
        .select('id')
        .eq('order_id', orderId)
        .limit(1);

      if (existingStages && existingStages.length > 0) {
        console.log('Preparation stages already exist for order:', orderId);
        return true;
      }

      // Use the database function to create default stages
      const { error } = await supabase.rpc('create_default_preparation_stages', {
        p_order_id: orderId,
        p_restaurant_id: restaurantId
      });

      if (error) {
        console.error('Error creating preparation stages:', error);
        return false;
      }

      console.log('Successfully created preparation stages for order:', orderId);
      return true;
    } catch (error) {
      console.error('Error in initializeOrderStages:', error);
      return false;
    }
  }

  /**
   * Start a specific preparation stage
   */
  static async startStage(orderId: string, stageName: string): Promise<boolean> {
    try {
      console.log('Starting preparation stage:', stageName, 'for order:', orderId);

      const { error } = await supabase
        .from('order_preparation_stages')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('stage_name', stageName);

      if (error) {
        console.error('Error starting preparation stage:', error);
        return false;
      }

      console.log('Successfully started preparation stage:', stageName);
      return true;
    } catch (error) {
      console.error('Error in startStage:', error);
      return false;
    }
  }

  /**
   * Complete a preparation stage and optionally start the next one
   */
  static async completeStage(orderId: string, stageName: string, autoStartNext: boolean = true): Promise<boolean> {
    try {
      console.log('Completing preparation stage:', stageName, 'for order:', orderId);

      // Complete the current stage
      const { error: completeError } = await supabase
        .from('order_preparation_stages')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('stage_name', stageName);

      if (completeError) {
        console.error('Error completing preparation stage:', completeError);
        return false;
      }

      if (autoStartNext) {
        // Find and start the next stage
        const { data: nextStage } = await supabase
          .from('order_preparation_stages')
          .select('stage_name, stage_order')
          .eq('order_id', orderId)
          .eq('status', 'pending')
          .order('stage_order', { ascending: true })
          .limit(1)
          .single();

        if (nextStage) {
          await this.startStage(orderId, nextStage.stage_name);
        }
      }

      console.log('Successfully completed preparation stage:', stageName);
      return true;
    } catch (error) {
      console.error('Error in completeStage:', error);
      return false;
    }
  }

  /**
   * Get all preparation stages for an order
   */
  static async getOrderStages(orderId: string): Promise<PreparationStage[]> {
    try {
      const { data, error } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('order_id', orderId)
        .order('stage_order', { ascending: true });

      if (error) {
        console.error('Error fetching preparation stages:', error);
        return [];
      }

      return (data || []).map(stage => ({
        ...stage,
        status: stage.status as PreparationStage['status']
      }));
    } catch (error) {
      console.error('Error in getOrderStages:', error);
      return [];
    }
  }

  /**
   * Get all preparation stages for an order (alias for compatibility)
   */
  static async getOrderPreparationStages(orderId: string): Promise<PreparationStage[]> {
    return this.getOrderStages(orderId);
  }

  /**
   * Get the current active stage for an order
   */
  static async getCurrentStage(orderId: string): Promise<PreparationStage | null> {
    try {
      const { data, error } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('order_id', orderId)
        .eq('status', 'in_progress')
        .order('stage_order', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching current stage:', error);
        return null;
      }

      return data ? { ...data, status: data.status as PreparationStage['status'] } : null;
    } catch (error) {
      console.error('Error in getCurrentStage:', error);
      return null;
    }
  }

  /**
   * Advance a stage (complete current and start next)
   */
  static async advanceStage(orderId: string, stageName: string, notes?: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('Advancing stage:', stageName, 'for order:', orderId);

      // Update stage notes if provided
      if (notes) {
        await this.updateStageNotes(orderId, stageName, notes);
      }

      // Complete the stage
      const success = await this.completeStage(orderId, stageName, true);

      if (success) {
        return { success: true, message: 'Stage advanced successfully' };
      } else {
        return { success: false, message: 'Failed to advance stage' };
      }
    } catch (error) {
      console.error('Error advancing stage:', error);
      return { success: false, message: 'Error advancing stage' };
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
   * Get preparation progress for an order
   */
  static async getPreparationProgress(orderId: string): Promise<PreparationProgress[]> {
    try {
      const stages = await this.getOrderStages(orderId);
      
      return stages.map(stage => ({
        stage_name: stage.stage_name,
        status: stage.status,
        stage_order: stage.stage_order,
        started_at: stage.started_at,
        completed_at: stage.completed_at,
        estimated_duration_minutes: stage.estimated_duration_minutes,
        actual_duration_minutes: stage.actual_duration_minutes,
        notes: stage.notes,
        progress_percentage: stage.status === 'completed' ? 100 : stage.status === 'in_progress' ? 50 : 0
      }));
    } catch (error) {
      console.error('Error getting preparation progress:', error);
      return [];
    }
  }

  /**
   * Get estimated completion time for an order
   */
  static async getEstimatedCompletionTime(orderId: string): Promise<Date | null> {
    try {
      const stages = await this.getOrderStages(orderId);
      
      if (stages.length === 0) return null;

      const currentStage = stages.find(s => s.status === 'in_progress');
      const pendingStages = stages.filter(s => s.status === 'pending');

      if (!currentStage && pendingStages.length === 0) {
        // All stages completed
        return new Date();
      }

      let totalMinutes = 0;

      // Add remaining time for current stage
      if (currentStage) {
        const startTime = currentStage.started_at ? new Date(currentStage.started_at) : new Date();
        const elapsed = (Date.now() - startTime.getTime()) / (1000 * 60);
        const remaining = Math.max(0, currentStage.estimated_duration_minutes - elapsed);
        totalMinutes += remaining;
      }

      // Add estimated time for pending stages
      pendingStages.forEach(stage => {
        totalMinutes += stage.estimated_duration_minutes;
      });

      const estimatedCompletion = new Date();
      estimatedCompletion.setMinutes(estimatedCompletion.getMinutes() + totalMinutes);

      return estimatedCompletion;
    } catch (error) {
      console.error('Error getting estimated completion time:', error);
      return null;
    }
  }
}

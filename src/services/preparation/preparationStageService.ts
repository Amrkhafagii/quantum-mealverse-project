
import { supabase } from '@/integrations/supabase/client';

export interface PreparationStage {
  id: string;
  order_id: string;
  restaurant_id: string;
  stage_name: string;
  stage_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  estimated_duration_minutes: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
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

      return data || [];
    } catch (error) {
      console.error('Error in getOrderStages:', error);
      return [];
    }
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

      return data || null;
    } catch (error) {
      console.error('Error in getCurrentStage:', error);
      return null;
    }
  }
}

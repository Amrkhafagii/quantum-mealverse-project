
import { supabase } from '@/integrations/supabase/client';
import { preparationIntegrationHub } from './preparationIntegrationHub';

export interface PreparationTimer {
  id: string;
  order_id: string;
  stage_name: string;
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  started_at: string;
  completed_at?: string;
  status: 'active' | 'completed' | 'cancelled';
}

class PreparationTimerService {
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();

  async createPreparationTimer(orderId: string, stageName: string, estimatedDurationMinutes: number): Promise<PreparationTimer> {
    try {
      // Since preparation_timers table doesn't exist, we'll use order_preparation_stages
      const { data, error } = await supabase
        .from('order_preparation_stages')
        .insert({
          order_id: orderId,
          stage_name: stageName,
          estimated_duration_minutes: estimatedDurationMinutes,
          started_at: new Date().toISOString(),
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Map to PreparationTimer format
      return {
        id: data.id,
        order_id: data.order_id,
        stage_name: data.stage_name,
        estimated_duration_minutes: data.estimated_duration_minutes || estimatedDurationMinutes,
        started_at: data.started_at || new Date().toISOString(),
        status: 'active'
      } as PreparationTimer;
    } catch (error) {
      console.error('Error creating preparation timer:', error);
      throw error;
    }
  }

  async completePreparationTimer(timerId: string, actualDurationMinutes: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('order_preparation_stages')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', timerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing preparation timer:', error);
      return false;
    }
  }

  async getActiveTimers(restaurantId: string): Promise<PreparationTimer[]> => {
    try {
      const { data, error } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('status', 'in_progress')
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      
      // Map to PreparationTimer format
      return (data || []).map(stage => ({
        id: stage.id,
        order_id: stage.order_id,
        stage_name: stage.stage_name,
        estimated_duration_minutes: stage.estimated_duration_minutes || 0,
        started_at: stage.started_at || new Date().toISOString(),
        status: 'active'
      })) as PreparationTimer[];
    } catch (error) {
      console.error('Error fetching active timers:', error);
      return [];
    }
  }

  async checkOverdueTimers(restaurantId: string): Promise<PreparationTimer[]> => {
    try {
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - 30); // 30 minutes overdue

      const { data, error } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('status', 'in_progress')
        .eq('restaurant_id', restaurantId)
        .lt('started_at', cutoffTime.toISOString());

      if (error) throw error;
      
      // Map to PreparationTimer format
      return (data || []).map(stage => ({
        id: stage.id,
        order_id: stage.order_id,
        stage_name: stage.stage_name,
        estimated_duration_minutes: stage.estimated_duration_minutes || 0,
        started_at: stage.started_at || new Date().toISOString(),
        status: 'active'
      })) as PreparationTimer[];
    } catch (error) {
      console.error('Error checking overdue timers:', error);
      return [];
    }
  }

  startTimer(orderId: string, stageName: string) {
    const timerId = `${orderId}-${stageName}`;
    console.log(`Starting timer for order ${orderId}, stage ${stageName}`);
    // Timer logic would go here in a real implementation
  }

  stopTimer(orderId: string) {
    const keys = Array.from(this.activeTimers.keys()).filter(key => key.startsWith(orderId));
    keys.forEach(key => {
      const timer = this.activeTimers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.activeTimers.delete(key);
      }
    });
    console.log(`Stopped timers for order ${orderId}`);
  }

  initializeExistingTimer(orderId: string) {
    console.log(`Initializing existing timer for order ${orderId}`);
    // Logic to restore timer state would go here
  }
}

export const preparationTimerService = new PreparationTimerService();

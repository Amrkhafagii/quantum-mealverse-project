
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
      const { data, error } = await supabase
        .from('preparation_timers')
        .insert({
          order_id: orderId,
          stage_name: stageName,
          estimated_duration_minutes: estimatedDurationMinutes,
          started_at: new Date().toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data as PreparationTimer;
    } catch (error) {
      console.error('Error creating preparation timer:', error);
      throw error;
    }
  }

  async completePreparationTimer(timerId: string, actualDurationMinutes: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('preparation_timers')
        .update({
          actual_duration_minutes: actualDurationMinutes,
          completed_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', timerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing preparation timer:', error);
      return false;
    }
  }

  async getActiveTimers(restaurantId: string): Promise<PreparationTimer[]> {
    try {
      const { data, error } = await supabase
        .from('preparation_timers')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      return data as PreparationTimer[];
    } catch (error) {
      console.error('Error fetching active timers:', error);
      return [];
    }
  }

  async checkOverdueTimers(restaurantId: string): Promise<PreparationTimer[]> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - 30); // 30 minutes overdue

      const { data, error } = await supabase
        .from('preparation_timers')
        .select('*')
        .eq('status', 'active')
        .lt('started_at', cutoffTime.toISOString());

      if (error) throw error;
      return data as PreparationTimer[];
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

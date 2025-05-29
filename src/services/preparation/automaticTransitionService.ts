
import { supabase } from '@/integrations/supabase/client';
import { PreparationStageService } from './preparationStageService';
import { preparationNotificationService } from '@/services/notifications/preparationNotificationService';

export interface StageTransitionConfig {
  restaurantId: string;
  enableAutoTransitions: boolean;
  rules: Array<{
    fromStage: string;
    toStage: string;
    triggerType: 'timer' | 'completion' | 'approval';
    timerMinutes?: number;
    requiresApproval?: boolean;
  }>;
}

export class AutomaticTransitionService {
  private static transitionTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Setup automatic transitions for an order
   */
  static async setupOrderTransitions(orderId: string, restaurantId: string): Promise<void> {
    try {
      // For now, we'll use default transitions since the custom rules table doesn't exist
      await this.setupDefaultTransitions(orderId);
    } catch (error) {
      console.error('Error setting up order transitions:', error);
    }
  }

  /**
   * Setup timer-based automatic transition
   */
  private static async setupTimerTransition(orderId: string, fromStage: string, toStage: string, timerMinutes: number): Promise<void> {
    const timerKey = `${orderId}_${fromStage}`;
    
    // Clear existing timer if any
    const existingTimer = this.transitionTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        console.log(`Auto-transitioning order ${orderId} from ${fromStage} to ${toStage}`);
        
        const result = await PreparationStageService.advanceStage(
          orderId,
          fromStage,
          'Automatic transition based on timer'
        );

        if (result.success) {
          // Send notification about automatic transition
          const { data: order } = await supabase
            .from('orders')
            .select('user_id')
            .eq('id', orderId)
            .single();

          if (order?.user_id) {
            await preparationNotificationService.sendStageUpdateNotification({
              userId: order.user_id,
              orderId,
              stageName: toStage,
              stageStatus: 'in_progress'
            });
          }
        }
      } catch (error) {
        console.error('Error in automatic transition:', error);
      } finally {
        this.transitionTimers.delete(timerKey);
      }
    }, timerMinutes * 60 * 1000); // Convert minutes to milliseconds

    this.transitionTimers.set(timerKey, timer);
  }

  /**
   * Setup default transitions for orders without custom rules
   */
  private static async setupDefaultTransitions(orderId: string): Promise<void> {
    const defaultRules = [
      { from: 'ingredients_prep', to: 'cooking', timerMinutes: 15 },
      { from: 'cooking', to: 'plating', timerMinutes: 25 },
      { from: 'plating', to: 'quality_check', timerMinutes: 5 },
      { from: 'quality_check', to: 'ready', timerMinutes: 3 }
    ];

    for (const rule of defaultRules) {
      // Only setup timer if the source stage is currently active
      const stages = await PreparationStageService.getOrderPreparationStages(orderId);
      const currentStage = stages.find(s => s.stage_name === rule.from && s.status === 'in_progress');
      
      if (currentStage) {
        await this.setupTimerTransition(orderId, rule.from, rule.to, rule.timerMinutes);
      }
    }
  }

  /**
   * Clear all transitions for an order (when order is completed or cancelled)
   */
  static clearOrderTransitions(orderId: string): void {
    const keysToRemove: string[] = [];
    
    this.transitionTimers.forEach((timer, key) => {
      if (key.startsWith(orderId)) {
        clearTimeout(timer);
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => this.transitionTimers.delete(key));
  }

  /**
   * Pause transitions for an order (useful for breaks or issues)
   */
  static pauseOrderTransitions(orderId: string): void {
    // For now, we'll clear the timers - in a production system,
    // we'd want to store the remaining time and resume later
    this.clearOrderTransitions(orderId);
  }

  /**
   * Get active transition timers for an order
   */
  static getActiveTransitions(orderId: string): string[] {
    const activeTransitions: string[] = [];
    
    this.transitionTimers.forEach((timer, key) => {
      if (key.startsWith(orderId)) {
        activeTransitions.push(key);
      }
    });

    return activeTransitions;
  }

  /**
   * Resume transitions for an order after pause
   */
  static async resumeOrderTransitions(orderId: string, restaurantId: string): Promise<void> {
    await this.setupOrderTransitions(orderId, restaurantId);
  }

  /**
   * Update transition rules for a restaurant (placeholder for future implementation)
   */
  static async updateTransitionRules(restaurantId: string, config: StageTransitionConfig): Promise<void> {
    // This would update rules in the database when the table is created
    console.log(`Transition rules updated for restaurant ${restaurantId}`, config);
  }
}

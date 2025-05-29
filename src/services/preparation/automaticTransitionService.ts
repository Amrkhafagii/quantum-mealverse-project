
import { supabase } from '@/integrations/supabase/client';
import { PreparationStageService } from './preparationStageService';
import { preparationNotificationService } from '@/services/notifications/preparationNotificationService';

export interface TransitionRule {
  id: string;
  restaurant_id: string;
  source_stage: string;
  target_stage: string;
  trigger_type: 'time_based' | 'condition_based' | 'manual_approval';
  trigger_value: number; // minutes for time-based, condition ID for condition-based
  is_active: boolean;
  created_at: string;
}

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
      // Get restaurant's transition rules
      const { data: rules, error } = await supabase
        .from('preparation_transition_rules')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching transition rules:', error);
        return;
      }

      if (!rules || rules.length === 0) {
        // Setup default transitions if no rules exist
        await this.setupDefaultTransitions(orderId);
        return;
      }

      // Apply custom rules
      for (const rule of rules) {
        await this.applyTransitionRule(orderId, rule);
      }
    } catch (error) {
      console.error('Error setting up order transitions:', error);
    }
  }

  /**
   * Apply a specific transition rule
   */
  private static async applyTransitionRule(orderId: string, rule: any): Promise<void> {
    if (rule.trigger_type === 'time_based') {
      await this.setupTimerTransition(orderId, rule);
    } else if (rule.trigger_type === 'condition_based') {
      await this.setupConditionTransition(orderId, rule);
    }
  }

  /**
   * Setup timer-based automatic transition
   */
  private static async setupTimerTransition(orderId: string, rule: any): Promise<void> {
    const timerKey = `${orderId}_${rule.source_stage}`;
    
    // Clear existing timer if any
    const existingTimer = this.transitionTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        console.log(`Auto-transitioning order ${orderId} from ${rule.source_stage} to ${rule.target_stage}`);
        
        const result = await PreparationStageService.advanceStage(
          orderId,
          rule.source_stage,
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
              stageName: rule.target_stage,
              stageStatus: 'in_progress'
            });
          }
        }
      } catch (error) {
        console.error('Error in automatic transition:', error);
      } finally {
        this.transitionTimers.delete(timerKey);
      }
    }, rule.trigger_value * 60 * 1000); // Convert minutes to milliseconds

    this.transitionTimers.set(timerKey, timer);
  }

  /**
   * Setup condition-based transition monitoring
   */
  private static async setupConditionTransition(orderId: string, rule: any): Promise<void> {
    // This would monitor for specific conditions like temperature reached, timer completed, etc.
    // For now, we'll implement a basic version that monitors stage completion
    
    const checkCondition = async () => {
      try {
        const stages = await PreparationStageService.getOrderPreparationStages(orderId);
        const sourceStage = stages.find(s => s.stage_name === rule.source_stage);
        
        if (sourceStage && sourceStage.status === 'completed') {
          // Start the next stage automatically
          await PreparationStageService.startStage(orderId, rule.target_stage);
        }
      } catch (error) {
        console.error('Error checking transition condition:', error);
      }
    };

    // Check condition every 30 seconds
    const intervalKey = `${orderId}_${rule.source_stage}_condition`;
    const interval = setInterval(checkCondition, 30000);
    
    // Store interval for cleanup (we'll use the same Map for simplicity)
    this.transitionTimers.set(intervalKey, interval as any);
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
        const timerKey = `${orderId}_${rule.from}`;
        const timer = setTimeout(async () => {
          try {
            await PreparationStageService.advanceStage(
              orderId,
              rule.from,
              `Automatic transition after ${rule.timerMinutes} minutes`
            );
          } catch (error) {
            console.error('Error in default transition:', error);
          }
        }, rule.timerMinutes * 60 * 1000);

        this.transitionTimers.set(timerKey, timer);
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
}

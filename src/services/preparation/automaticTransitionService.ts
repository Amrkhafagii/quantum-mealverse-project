
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

interface TimerInfo {
  orderId: string;
  fromStage: string;
  toStage: string;
  startTime: number;
  timeout: NodeJS.Timeout;
}

export class AutomaticTransitionService {
  private static transitionTimers = new Map<string, TimerInfo>();

  /**
   * Setup automatic transitions for an order with enhanced logging
   */
  static async setupOrderTransitions(orderId: string, restaurantId: string): Promise<void> {
    try {
      console.log(`[AutoTransition] Setting up transitions for order ${orderId} in restaurant ${restaurantId}`);
      
      // Clear any existing transitions for this order first
      this.clearOrderTransitions(orderId);
      
      // For now, we'll use default transitions since the custom rules table doesn't exist
      await this.setupDefaultTransitions(orderId);
      
      console.log(`[AutoTransition] Successfully setup transitions for order ${orderId}`);
    } catch (error) {
      console.error(`[AutoTransition] Failed to setup transitions for order ${orderId}:`, {
        error: error instanceof Error ? error.message : error,
        orderId,
        restaurantId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Setup timer-based automatic transition with enhanced logging and error handling
   */
  private static async setupTimerTransition(
    orderId: string, 
    fromStage: string, 
    toStage: string, 
    timerMinutes: number
  ): Promise<void> {
    const timerKey = `${orderId}_${fromStage}`;
    
    try {
      console.log(`[AutoTransition] Setting up timer for order ${orderId}: ${fromStage} -> ${toStage} (${timerMinutes}min)`);
      
      // Clear existing timer if any
      const existingTimer = this.transitionTimers.get(timerKey);
      if (existingTimer) {
        console.log(`[AutoTransition] Clearing existing timer for ${timerKey}`);
        clearTimeout(existingTimer.timeout);
        this.transitionTimers.delete(timerKey);
      }

      const startTime = Date.now();
      
      // Set new timer with enhanced error handling
      const timeout = setTimeout(async () => {
        const executionTime = Date.now();
        console.log(`[AutoTransition] Executing timer transition for order ${orderId}: ${fromStage} -> ${toStage}`, {
          scheduledTime: timerMinutes * 60 * 1000,
          actualTime: executionTime - startTime,
          orderId,
          fromStage,
          toStage
        });
        
        try {
          // Verify the stage is still in the correct state before transitioning
          const stages = await PreparationStageService.getOrderPreparationStages(orderId);
          const currentStage = stages.find(s => s.stage_name === fromStage);
          
          if (!currentStage) {
            console.warn(`[AutoTransition] Stage ${fromStage} not found for order ${orderId}, skipping transition`);
            return;
          }
          
          if (currentStage.status !== 'in_progress') {
            console.warn(`[AutoTransition] Stage ${fromStage} is not in progress (${currentStage.status}), skipping transition for order ${orderId}`);
            return;
          }
          
          const result = await PreparationStageService.advanceStage(
            orderId,
            fromStage,
            `Automatic transition based on ${timerMinutes}min timer`
          );

          if (result.success) {
            console.log(`[AutoTransition] Successfully transitioned order ${orderId} from ${fromStage} to ${toStage}`);
            
            // Send notification about automatic transition
            try {
              const { data: order } = await supabase
                .from('orders')
                .select('customer_id')
                .eq('id', orderId)
                .single();

              if (order?.customer_id) {
                await preparationNotificationService.sendStageUpdateNotification({
                  userId: order.customer_id,
                  orderId,
                  stageName: toStage,
                  stageStatus: 'in_progress'
                });
                console.log(`[AutoTransition] Notification sent for order ${orderId} stage ${toStage}`);
              }
            } catch (notificationError) {
              console.error(`[AutoTransition] Failed to send notification for order ${orderId}:`, notificationError);
            }
          } else {
            console.error(`[AutoTransition] Failed to transition order ${orderId}:`, result.message);
          }
        } catch (transitionError) {
          console.error(`[AutoTransition] Critical error during transition for order ${orderId}:`, {
            error: transitionError instanceof Error ? transitionError.message : transitionError,
            fromStage,
            toStage,
            orderId,
            timestamp: new Date().toISOString()
          });
        } finally {
          // Always clean up the timer reference
          this.transitionTimers.delete(timerKey);
          console.log(`[AutoTransition] Cleaned up timer reference for ${timerKey}`);
        }
      }, timerMinutes * 60 * 1000);

      // Store timer info for management
      const timerInfo: TimerInfo = {
        orderId,
        fromStage,
        toStage,
        startTime,
        timeout
      };
      
      this.transitionTimers.set(timerKey, timerInfo);
      console.log(`[AutoTransition] Timer set for ${timerKey}, will execute in ${timerMinutes} minutes`);
      
    } catch (error) {
      console.error(`[AutoTransition] Failed to setup timer for ${timerKey}:`, {
        error: error instanceof Error ? error.message : error,
        orderId,
        fromStage,
        toStage,
        timerMinutes
      });
      throw error;
    }
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

    console.log(`[AutoTransition] Setting up default transitions for order ${orderId}`);

    try {
      // Get current stages to only setup timers for active stages
      const stages = await PreparationStageService.getOrderPreparationStages(orderId);
      
      for (const rule of defaultRules) {
        const currentStage = stages.find(s => s.stage_name === rule.from && s.status === 'in_progress');
        
        if (currentStage) {
          console.log(`[AutoTransition] Setting up timer for active stage: ${rule.from} -> ${rule.to}`);
          await this.setupTimerTransition(orderId, rule.from, rule.to, rule.timerMinutes);
        } else {
          console.log(`[AutoTransition] Skipping timer for inactive stage: ${rule.from}`);
        }
      }
    } catch (error) {
      console.error(`[AutoTransition] Error setting up default transitions for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Clear all transitions for an order with enhanced logging
   */
  static clearOrderTransitions(orderId: string): void {
    console.log(`[AutoTransition] Clearing all transitions for order ${orderId}`);
    const keysToRemove: string[] = [];
    let clearedCount = 0;
    
    this.transitionTimers.forEach((timerInfo, key) => {
      if (key.startsWith(orderId)) {
        console.log(`[AutoTransition] Clearing timer: ${key} (${timerInfo.fromStage} -> ${timerInfo.toStage})`);
        clearTimeout(timerInfo.timeout);
        keysToRemove.push(key);
        clearedCount++;
      }
    });

    keysToRemove.forEach(key => this.transitionTimers.delete(key));
    console.log(`[AutoTransition] Cleared ${clearedCount} timers for order ${orderId}`);
  }

  /**
   * Pause transitions for an order with enhanced logging
   */
  static pauseOrderTransitions(orderId: string): void {
    console.log(`[AutoTransition] Pausing transitions for order ${orderId}`);
    const activeTimers = this.getActiveTransitions(orderId);
    console.log(`[AutoTransition] Found ${activeTimers.length} active timers to pause`);
    
    // For now, we'll clear the timers - in a production system,
    // we'd want to store the remaining time and resume later
    this.clearOrderTransitions(orderId);
    console.log(`[AutoTransition] Paused (cleared) transitions for order ${orderId}`);
  }

  /**
   * Get active transition timers for an order with detailed info
   */
  static getActiveTransitions(orderId: string): Array<{
    key: string;
    fromStage: string;
    toStage: string;
    remainingTime: number;
  }> {
    const activeTransitions: Array<{
      key: string;
      fromStage: string;
      toStage: string;
      remainingTime: number;
    }> = [];
    
    const currentTime = Date.now();
    
    this.transitionTimers.forEach((timerInfo, key) => {
      if (key.startsWith(orderId)) {
        const elapsedTime = currentTime - timerInfo.startTime;
        const totalTime = 15 * 60 * 1000; // Default timer duration, should be configurable
        const remainingTime = Math.max(0, totalTime - elapsedTime);
        
        activeTransitions.push({
          key,
          fromStage: timerInfo.fromStage,
          toStage: timerInfo.toStage,
          remainingTime
        });
      }
    });

    return activeTransitions;
  }

  /**
   * Resume transitions for an order after pause
   */
  static async resumeOrderTransitions(orderId: string, restaurantId: string): Promise<void> {
    console.log(`[AutoTransition] Resuming transitions for order ${orderId}`);
    try {
      await this.setupOrderTransitions(orderId, restaurantId);
      console.log(`[AutoTransition] Successfully resumed transitions for order ${orderId}`);
    } catch (error) {
      console.error(`[AutoTransition] Failed to resume transitions for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Update transition rules for a restaurant with enhanced logging
   */
  static async updateTransitionRules(restaurantId: string, config: StageTransitionConfig): Promise<void> {
    console.log(`[AutoTransition] Updating transition rules for restaurant ${restaurantId}:`, {
      enableAutoTransitions: config.enableAutoTransitions,
      rulesCount: config.rules.length
    });
    
    // This would update rules in the database when the table is created
    console.log(`[AutoTransition] Transition rules logged for future implementation in restaurant ${restaurantId}`);
  }

  /**
   * Get system status and statistics
   */
  static getSystemStatus(): {
    activeTimers: number;
    timersByOrder: Record<string, number>;
    totalOrders: number;
  } {
    const timersByOrder: Record<string, number> = {};
    let totalOrders = 0;
    
    this.transitionTimers.forEach((_, key) => {
      const orderId = key.split('_')[0];
      timersByOrder[orderId] = (timersByOrder[orderId] || 0) + 1;
    });
    
    totalOrders = Object.keys(timersByOrder).length;
    
    return {
      activeTimers: this.transitionTimers.size,
      timersByOrder,
      totalOrders
    };
  }
}

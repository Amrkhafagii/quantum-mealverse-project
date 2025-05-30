import { supabase } from '@/integrations/supabase/client';
import { PreparationStageService } from './preparationStageService';

export interface TimerState {
  orderId: string;
  currentStage: string;
  startTime: Date;
  elapsedTime: number;
  isRunning: boolean;
  estimatedCompletion?: Date;
  progress?: number;
}

export class PreparationTimerService {
  private static activeTimers = new Map<string, TimerState>();
  private static intervals = new Map<string, NodeJS.Timeout>();
  private static cleanupCallbacks = new Map<string, () => void>();

  /**
   * Start timing for a preparation stage with enhanced lifecycle tracking
   */
  static startTimer(orderId: string, stageName: string, estimatedDurationMinutes?: number): void {
    // Stop any existing timer for this order
    this.stopTimer(orderId);

    const startTime = new Date();
    const estimatedCompletion = estimatedDurationMinutes 
      ? new Date(startTime.getTime() + estimatedDurationMinutes * 60 * 1000)
      : undefined;

    const timerState: TimerState = {
      orderId,
      currentStage: stageName,
      startTime,
      elapsedTime: 0,
      isRunning: true,
      estimatedCompletion
    };

    this.activeTimers.set(orderId, timerState);

    // Start interval to update elapsed time
    const interval = setInterval(() => {
      const timer = this.activeTimers.get(orderId);
      if (timer && timer.isRunning) {
        timer.elapsedTime = Date.now() - timer.startTime.getTime();
        
        // Calculate progress if estimated duration is available
        if (estimatedDurationMinutes) {
          const progressPercent = Math.min(100, (timer.elapsedTime / (estimatedDurationMinutes * 60 * 1000)) * 100);
          timer.progress = progressPercent;
        }
        
        this.activeTimers.set(orderId, timer);
        
        // Emit enhanced timer update event
        this.emitEnhancedTimerUpdate(orderId, timer);
      }
    }, 1000);

    this.intervals.set(orderId, interval);

    // Set up cleanup callback for this timer
    const cleanup = () => this.forceStopTimer(orderId, 'lifecycle_end');
    this.cleanupCallbacks.set(orderId, cleanup);

    console.log(`Enhanced timer started for order ${orderId}, stage ${stageName}`);
  }

  /**
   * Stop timing for an order with reason tracking
   */
  static stopTimer(orderId: string, reason: string = 'normal_stop'): TimerState | null {
    const timer = this.activeTimers.get(orderId);
    const interval = this.intervals.get(orderId);
    const cleanup = this.cleanupCallbacks.get(orderId);

    if (interval) {
      clearInterval(interval);
      this.intervals.delete(orderId);
    }

    if (cleanup) {
      this.cleanupCallbacks.delete(orderId);
    }

    if (timer) {
      timer.isRunning = false;
      timer.elapsedTime = Date.now() - timer.startTime.getTime();
      this.activeTimers.delete(orderId);
      
      // Emit final timer update
      this.emitEnhancedTimerUpdate(orderId, timer, { stopped: true, reason });
      
      console.log(`Timer stopped for order ${orderId} - reason: ${reason}`);
      return timer;
    }

    return null;
  }

  /**
   * Force stop timer with cleanup (for emergency scenarios)
   */
  static forceStopTimer(orderId: string, reason: string): void {
    const timer = this.stopTimer(orderId, reason);
    if (timer) {
      console.warn(`Force stopped timer for order ${orderId} - ${reason}`);
      
      // Emit force stop event
      const event = new CustomEvent('preparationTimerForceStop', {
        detail: { orderId, reason, timer }
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Pause timer for an order
   */
  static pauseTimer(orderId: string): boolean {
    const timer = this.activeTimers.get(orderId);
    if (timer && timer.isRunning) {
      timer.isRunning = false;
      timer.elapsedTime = Date.now() - timer.startTime.getTime();
      
      const interval = this.intervals.get(orderId);
      if (interval) {
        clearInterval(interval);
        this.intervals.delete(orderId);
      }
      
      console.log(`Timer paused for order ${orderId}`);
      return true;
    }
    return false;
  }

  /**
   * Resume timer for an order
   */
  static resumeTimer(orderId: string): boolean {
    const timer = this.activeTimers.get(orderId);
    if (timer && !timer.isRunning) {
      timer.isRunning = true;
      timer.startTime = new Date(Date.now() - timer.elapsedTime);
      
      // Restart interval
      const interval = setInterval(() => {
        const currentTimer = this.activeTimers.get(orderId);
        if (currentTimer && currentTimer.isRunning) {
          currentTimer.elapsedTime = Date.now() - currentTimer.startTime.getTime();
          this.activeTimers.set(orderId, currentTimer);
          this.emitEnhancedTimerUpdate(orderId, currentTimer);
        }
      }, 1000);

      this.intervals.set(orderId, interval);
      console.log(`Timer resumed for order ${orderId}`);
      return true;
    }
    return false;
  }

  /**
   * Get current timer state for an order
   */
  static getTimerState(orderId: string): TimerState | null {
    return this.activeTimers.get(orderId) || null;
  }

  /**
   * Get elapsed time in minutes for current stage
   */
  static getElapsedMinutes(orderId: string): number {
    const timer = this.activeTimers.get(orderId);
    if (!timer) return 0;
    
    const elapsed = timer.isRunning 
      ? Date.now() - timer.startTime.getTime()
      : timer.elapsedTime;
    
    return Math.floor(elapsed / (1000 * 60));
  }

  /**
   * Auto-advance stage based on estimated time + buffer
   */
  static async setupAutoAdvance(orderId: string, stageName: string, estimatedMinutes: number): Promise<void> {
    const bufferMinutes = 5; // 5 minute buffer
    const totalMinutes = estimatedMinutes + bufferMinutes;
    
    setTimeout(async () => {
      const timer = this.activeTimers.get(orderId);
      if (timer && timer.isRunning && timer.currentStage === stageName) {
        console.log(`Auto-advancing stage ${stageName} for order ${orderId}`);
        
        // Check if stage is still active
        const currentStage = await PreparationStageService.getCurrentStage(orderId);
        if (currentStage && currentStage.stage_name === stageName) {
          await PreparationStageService.advanceStage(
            orderId, 
            stageName, 
            'Auto-advanced after estimated time'
          );
        }
      }
    }, totalMinutes * 60 * 1000);
  }

  /**
   * Enhanced cleanup with comprehensive lifecycle management
   */
  static cleanup(reason: string = 'app_unmount'): void {
    const activeOrderIds = Array.from(this.activeTimers.keys());
    
    for (const orderId of activeOrderIds) {
      this.forceStopTimer(orderId, reason);
    }
    
    // Clear any remaining intervals
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    
    // Clear all maps
    this.activeTimers.clear();
    this.intervals.clear();
    this.cleanupCallbacks.clear();
    
    console.log(`Comprehensive timer cleanup completed - ${activeOrderIds.length} timers stopped. Reason: ${reason}`);
  }

  /**
   * Enhanced timer update emission with versatile data
   */
  private static emitEnhancedTimerUpdate(orderId: string, timer: TimerState, additionalData?: any): void {
    const updateData = {
      orderId,
      currentStage: timer.currentStage,
      elapsedTime: timer.elapsedTime,
      isRunning: timer.isRunning,
      progress: timer.progress,
      estimatedCompletion: timer.estimatedCompletion,
      elapsedMinutes: Math.floor(timer.elapsedTime / (1000 * 60)),
      timestamp: new Date().toISOString(),
      ...additionalData
    };

    // Emit specific timer update event
    const timerEvent = new CustomEvent('preparationTimerUpdate', {
      detail: updateData
    });
    window.dispatchEvent(timerEvent);

    // Emit general preparation update event
    const generalEvent = new CustomEvent('preparationUpdate', {
      detail: {
        type: 'timer_update',
        orderId,
        data: updateData
      }
    });
    window.dispatchEvent(generalEvent);
  }

  /**
   * Get comprehensive timer statistics
   */
  static getTimerStatistics(): {
    activeCount: number;
    totalElapsedTime: number;
    averageElapsedTime: number;
    longestRunning?: { orderId: string; elapsedTime: number; stage: string };
  } {
    const timers = Array.from(this.activeTimers.values());
    const activeCount = timers.length;
    const totalElapsedTime = timers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
    const averageElapsedTime = activeCount > 0 ? totalElapsedTime / activeCount : 0;
    
    let longestRunning;
    if (timers.length > 0) {
      const longest = timers.reduce((max, timer) => 
        timer.elapsedTime > max.elapsedTime ? timer : max
      );
      longestRunning = {
        orderId: longest.orderId,
        elapsedTime: longest.elapsedTime,
        stage: longest.currentStage
      };
    }

    return {
      activeCount,
      totalElapsedTime,
      averageElapsedTime,
      longestRunning
    };
  }

  /**
   * Subscribe to timer updates
   */
  static subscribeToTimerUpdates(
    orderId: string,
    callback: (timer: TimerState) => void
  ): () => void {
    const handler = (event: CustomEvent) => {
      if (event.detail.orderId === orderId) {
        callback(event.detail.timer);
      }
    };

    window.addEventListener('preparationTimerUpdate', handler as EventListener);
    
    return () => {
      window.removeEventListener('preparationTimerUpdate', handler as EventListener);
    };
  }

  /**
   * Initialize timer for existing in-progress stage
   */
  static async initializeExistingTimer(orderId: string): Promise<void> {
    try {
      const currentStage = await PreparationStageService.getCurrentStage(orderId);
      if (currentStage && currentStage.started_at) {
        const startTime = new Date(currentStage.started_at);
        const elapsedTime = Date.now() - startTime.getTime();
        
        const timerState: TimerState = {
          orderId,
          currentStage: currentStage.stage_name,
          startTime,
          elapsedTime,
          isRunning: true
        };

        this.activeTimers.set(orderId, timerState);
        
        // Start interval for updates
        const interval = setInterval(() => {
          const timer = this.activeTimers.get(orderId);
          if (timer && timer.isRunning) {
            timer.elapsedTime = Date.now() - timer.startTime.getTime();
            this.activeTimers.set(orderId, timer);
            this.emitEnhancedTimerUpdate(orderId, timer);
          }
        }, 1000);

        this.intervals.set(orderId, interval);
        console.log(`Initialized existing timer for order ${orderId}, stage ${currentStage.stage_name}`);
      }
    } catch (error) {
      console.error('Error initializing existing timer:', error);
    }
  }
}

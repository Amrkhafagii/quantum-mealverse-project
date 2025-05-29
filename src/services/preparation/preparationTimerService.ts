
import { supabase } from '@/integrations/supabase/client';
import { PreparationStageService } from './preparationStageService';

export interface TimerState {
  orderId: string;
  currentStage: string;
  startTime: Date;
  elapsedTime: number;
  isRunning: boolean;
}

export class PreparationTimerService {
  private static activeTimers = new Map<string, TimerState>();
  private static intervals = new Map<string, NodeJS.Timeout>();

  /**
   * Start timing for a preparation stage
   */
  static startTimer(orderId: string, stageName: string): void {
    // Stop any existing timer for this order
    this.stopTimer(orderId);

    const timerState: TimerState = {
      orderId,
      currentStage: stageName,
      startTime: new Date(),
      elapsedTime: 0,
      isRunning: true
    };

    this.activeTimers.set(orderId, timerState);

    // Start interval to update elapsed time
    const interval = setInterval(() => {
      const timer = this.activeTimers.get(orderId);
      if (timer && timer.isRunning) {
        timer.elapsedTime = Date.now() - timer.startTime.getTime();
        this.activeTimers.set(orderId, timer);
        
        // Emit timer update event
        this.emitTimerUpdate(orderId, timer);
      }
    }, 1000);

    this.intervals.set(orderId, interval);
    console.log(`Timer started for order ${orderId}, stage ${stageName}`);
  }

  /**
   * Stop timing for an order
   */
  static stopTimer(orderId: string): TimerState | null {
    const timer = this.activeTimers.get(orderId);
    const interval = this.intervals.get(orderId);

    if (interval) {
      clearInterval(interval);
      this.intervals.delete(orderId);
    }

    if (timer) {
      timer.isRunning = false;
      timer.elapsedTime = Date.now() - timer.startTime.getTime();
      this.activeTimers.delete(orderId);
      console.log(`Timer stopped for order ${orderId}`);
      return timer;
    }

    return null;
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
          this.emitTimerUpdate(orderId, currentTimer);
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
   * Clean up all timers (call on app unmount)
   */
  static cleanup(): void {
    for (const [orderId] of this.activeTimers) {
      this.stopTimer(orderId);
    }
    console.log('All preparation timers cleaned up');
  }

  /**
   * Emit timer update event for real-time UI updates
   */
  private static emitTimerUpdate(orderId: string, timer: TimerState): void {
    const event = new CustomEvent('preparationTimerUpdate', {
      detail: { orderId, timer }
    });
    window.dispatchEvent(event);
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
            this.emitTimerUpdate(orderId, timer);
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

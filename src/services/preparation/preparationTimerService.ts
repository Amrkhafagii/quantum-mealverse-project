import { PreparationStageService } from './preparationStageService';
import { PreparationIntegrationHub } from './preparationIntegrationHub';

interface ActiveTimer {
  orderId: string;
  startTime: Date;
  currentStage: string;
  elapsedTime: number;
  isRunning: boolean;
  estimatedCompletion?: Date;
  intervalId?: NodeJS.Timeout;
}

export class PreparationTimerService {
  private static activeTimers: Map<string, ActiveTimer> = new Map();
  private static readonly timerInterval: number = 60 * 1000; // 60 seconds

  private static calculateElapsedTime(startTime: Date): number {
    const now = new Date();
    return Math.round((now.getTime() - startTime.getTime()) / (1000 * 60)); // in minutes
  }

  private static async setEstimatedCompletion(orderId: string): Promise<Date | undefined> {
    try {
      return await PreparationStageService.getEstimatedCompletionTime(orderId);
    } catch (error) {
      console.error('Error setting estimated completion time:', error);
      return undefined;
    }
  }

  static async startTimer(orderId: string, stageName?: string): Promise<boolean> {
    try {
      if (this.activeTimers.has(orderId)) {
        console.warn(`Timer already running for order: ${orderId}`);
        return false;
      }

      // Get current stage if not provided
      if (!stageName) {
        const currentStage = await PreparationStageService.getCurrentStage(orderId);
        if (!currentStage) {
          console.warn('No current stage found for order:', orderId);
          return false;
        }
        stageName = currentStage.stage_name;
      }

      const startTime = new Date();
      const estimatedCompletion = await this.setEstimatedCompletion(orderId);

      const timer: ActiveTimer = {
        orderId: orderId,
        startTime: startTime,
        currentStage: stageName,
        elapsedTime: 0,
        isRunning: true,
        estimatedCompletion: estimatedCompletion,
      };

      this.activeTimers.set(orderId, timer);
      console.log(`Timer started for order ${orderId}, stage ${stageName}`);

      // Emit initial timer update
      PreparationIntegrationHub.emitTimerUpdate(orderId, {
        currentStage: stageName,
        elapsedTime: 0,
        isRunning: true,
        estimatedCompletion: estimatedCompletion
      });

      // Start the interval
      timer.intervalId = setInterval(() => {
        this.updateTimerProgress(orderId);
      }, this.timerInterval);

      return true;
    } catch (error) {
      console.error('Error starting timer:', error);
      return false;
    }
  }

  static stopTimer(orderId: string): ActiveTimer | undefined {
    const timer = this.activeTimers.get(orderId);
    if (!timer) {
      console.warn(`No timer found for order: ${orderId}`);
      return undefined;
    }

    clearInterval(timer.intervalId);
    timer.isRunning = false;
    timer.elapsedTime = this.calculateElapsedTime(timer.startTime);
    this.activeTimers.delete(orderId);

    console.log(`Timer stopped for order ${orderId}, total elapsed time: ${timer.elapsedTime} minutes`);

    PreparationIntegrationHub.emitTimerUpdate(orderId, {
      currentStage: timer.currentStage,
      elapsedTime: timer.elapsedTime,
      isRunning: false
    });

    return timer;
  }

  static async skipStage(orderId: string): Promise<boolean> {
    try {
      const timer = this.activeTimers.get(orderId);
      if (!timer) {
        console.warn(`No timer found for order: ${orderId}`);
        return false;
      }

      const currentStage = timer.currentStage;
      const updates = [{
        orderId: orderId,
        stageName: currentStage,
        status: 'skipped',
        notes: 'Skipped due to workflow adjustment',
        restaurantId: '' //TODO: fix this
      }];

      const success = await PreparationStageService.bulkUpdateStages(updates);
      if (!success) {
        console.error('Failed to skip stage:', currentStage);
        return false;
      }

      this.stopTimer(orderId);
      console.log(`Stage ${currentStage} skipped for order ${orderId}`);
      return true;
    } catch (error) {
      console.error('Error skipping stage:', error);
      return false;
    }
  }

  private static async updateTimerProgress(orderId: string): Promise<void> {
    try {
      const timer = this.activeTimers.get(orderId);
      if (!timer) return;

      const elapsedTime = this.calculateElapsedTime(timer.startTime);
      const estimatedCompletion = await this.setEstimatedCompletion(orderId);

      // Get current stage for progress calculation
      const currentStage = await PreparationStageService.getCurrentStage(orderId);
      if (!currentStage) {
        console.warn('No current stage found for timer update:', orderId);
        return;
      }

      timer.currentStage = currentStage.stage_name;
      timer.elapsedTime = elapsedTime;
      timer.estimatedCompletion = estimatedCompletion;

      PreparationIntegrationHub.emitTimerUpdate(orderId, {
        currentStage: timer.currentStage,
        elapsedTime: timer.elapsedTime,
        isRunning: timer.isRunning,
        estimatedCompletion: timer.estimatedCompletion
      });

      console.log(`Timer update - Order: ${orderId}, Stage: ${timer.currentStage}, Elapsed: ${elapsedTime} minutes`);
    } catch (error) {
      console.error('Error updating timer progress:', error);
    }
  }

  static getTimerStatus(orderId: string): ActiveTimer | undefined {
    return this.activeTimers.get(orderId);
  }

  static getAllTimers(): Map<string, ActiveTimer> {
    return this.activeTimers;
  }

  static async resetAllTimers(): Promise<void> {
    try {
      // Stop all active timers
      for (const orderId of this.activeTimers.keys()) {
        this.stopTimer(orderId);
      }

      this.activeTimers.clear();
      console.log('All timers have been reset.');
    } catch (error) {
      console.error('Error resetting all timers:', error);
    }
  }
}

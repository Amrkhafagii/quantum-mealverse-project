
import { hapticFeedback } from './hapticFeedback';

interface EnhancedHapticFeedback {
  success: () => Promise<void>;
  error: () => Promise<void>;
  warning: () => Promise<void>;
  selection: () => Promise<void>;
  confirmation: () => Promise<void>;
  longPress: () => Promise<void>;
}

class EnhancedHapticFeedbackService implements EnhancedHapticFeedback {
  async success(): Promise<void> {
    hapticFeedback.success();
    // Add slight delay for enhanced feedback
    setTimeout(() => hapticFeedback.light(), 100);
  }

  async error(): Promise<void> {
    hapticFeedback.error();
    // Double tap for error emphasis
    setTimeout(() => hapticFeedback.medium(), 150);
  }

  async warning(): Promise<void> {
    hapticFeedback.warning();
    setTimeout(() => hapticFeedback.light(), 80);
  }

  async selection(): Promise<void> {
    hapticFeedback.selection();
  }

  async confirmation(): Promise<void> {
    hapticFeedback.medium();
    setTimeout(() => hapticFeedback.light(), 100);
    setTimeout(() => hapticFeedback.light(), 200);
  }

  async longPress(): Promise<void> {
    hapticFeedback.heavy();
    setTimeout(() => hapticFeedback.medium(), 150);
  }
}

export const enhancedHaptics = new EnhancedHapticFeedbackService();

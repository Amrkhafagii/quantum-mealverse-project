
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { hapticFeedback } from "@/utils/hapticFeedback";
import { enhancedHaptics } from "@/utils/enhancedHapticFeedback";
import { cn } from "@/lib/utils";
import { Platform } from "@/utils/platform";

export interface EnhancedHapticButtonProps extends ButtonProps {
  hapticEffect?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection' | 'confirmation' | 'longPress';
  contextMode?: 'success' | 'error' | 'warning' | 'info' | 'selection' | 'confirmation';
  enhancedMode?: 'success' | 'error' | 'warning' | 'selection' | 'confirmation' | 'longPress';
  hapticStrength?: 'minimal' | 'moderate' | 'strong';
  hapticDuration?: 'short' | 'normal' | 'long';
  tapticEnabled?: boolean;
}

export const EnhancedHapticButton = React.forwardRef<HTMLButtonElement, EnhancedHapticButtonProps>(
  ({ 
    hapticEffect, 
    contextMode, 
    enhancedMode, 
    hapticStrength = 'moderate',
    hapticDuration = 'normal',
    tapticEnabled = true,
    onClick, 
    className, 
    children, 
    ...props 
  }, ref) => {
    
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Only apply haptic feedback on platforms that support it
      if (Platform.isNative() && tapticEnabled) {
        if (enhancedMode) {
          // Use enhanced haptic patterns
          switch (enhancedMode) {
            case 'success':
              await enhancedHaptics.success();
              break;
            case 'error':
              await enhancedHaptics.error();
              break;
            case 'warning':
              await enhancedHaptics.warning();
              break;
            case 'selection':
              await enhancedHaptics.selection();
              break;
            case 'confirmation':
              await enhancedHaptics.confirmation();
              break;
            case 'longPress':
              await enhancedHaptics.longPress();
              break;
          }
        } else if (hapticEffect) {
          // Apply haptic strength/duration variations
          let delay = 0;
          
          if (hapticDuration === 'long') {
            delay = 150;
          } else if (hapticDuration === 'short') {
            delay = 50;
          } else {
            delay = 100;
          }

          // Apply strength-based haptics
          if (hapticStrength === 'strong') {
            // For strong feedback, we can do multiple impacts
            switch (hapticEffect) {
              case 'light':
                await hapticFeedback.light();
                if (delay) setTimeout(() => hapticFeedback.light(), delay);
                break;
              case 'medium':
                await hapticFeedback.medium();
                if (delay) setTimeout(() => hapticFeedback.light(), delay);
                break;
              case 'heavy':
                await hapticFeedback.heavy();
                if (delay) setTimeout(() => hapticFeedback.medium(), delay);
                break;
              case 'success':
              case 'error':
              case 'warning':
              case 'selection':
                await hapticFeedback[hapticEffect]();
                if (delay) setTimeout(() => hapticFeedback.light(), delay);
                break;
              default:
                await hapticFeedback.medium();
            }
          } else if (hapticStrength === 'minimal') {
            // For minimal feedback, just use light impact
            await hapticFeedback.light();
          } else {
            // Default moderate strength is the standard haptic effect
            await hapticFeedback[hapticEffect]();
          }
        } else if (contextMode) {
          // Use contextual haptic feedback
          await hapticFeedback.contextual(contextMode);
        } else {
          // Default to medium impact
          await hapticFeedback.medium();
        }
      }
      
      // Call the original onClick handler if provided
      onClick?.(e);
    };
    
    return (
      <Button
        ref={ref}
        onClick={handleClick}
        className={cn("haptic-enabled", className)}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

EnhancedHapticButton.displayName = "EnhancedHapticButton";


import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { hapticFeedback } from "@/utils/hapticFeedback";
import { cn } from "@/lib/utils";

interface HapticButtonProps extends ButtonProps {
  hapticEffect?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection' | 'confirmation' | 'longPress';
  context?: 'success' | 'error' | 'warning' | 'info' | 'selection' | 'confirmation';
}

export const HapticButton = React.forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({ hapticEffect, context, onClick, className, children, ...props }, ref) => {
    
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Apply haptic feedback
      if (hapticEffect) {
        // Use the specific effect if provided
        switch (hapticEffect) {
          case 'light':
            await hapticFeedback.light();
            break;
          case 'medium':
            await hapticFeedback.medium();
            break;
          case 'heavy':
            await hapticFeedback.heavy();
            break;
          case 'success':
            await hapticFeedback.success();
            break;
          case 'error':
            await hapticFeedback.error();
            break;
          case 'warning':
            await hapticFeedback.warning();
            break;
          case 'selection':
            await hapticFeedback.selection();
            break;
          default:
            await hapticFeedback.medium();
        }
      } else if (context) {
        // Use contextual haptic feedback if context is provided
        await hapticFeedback.contextual(context);
      } else {
        // Default to medium impact
        await hapticFeedback.medium();
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

HapticButton.displayName = "HapticButton";

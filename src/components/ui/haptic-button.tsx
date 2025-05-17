
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
        await hapticFeedback[hapticEffect]?.();
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

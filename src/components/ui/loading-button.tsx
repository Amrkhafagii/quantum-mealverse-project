
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/utils/hapticFeedback";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  hapticEffect?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection' | 'confirmation' | 'longPress';
  children: React.ReactNode;
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, variant = "default", size = "default", className, hapticEffect = "medium", onClick, children, ...props }, ref) => {
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Don't trigger haptic feedback if the button is in loading state
      if (!loading && hapticEffect) {
        hapticFeedback[hapticEffect]?.();
      }
      
      // Call original onClick if provided
      onClick?.(e);
    };
    
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(className, { "pointer-events-none": loading })}
        disabled={loading || props.disabled}
        onClick={handleClick}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

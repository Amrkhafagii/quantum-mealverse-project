
import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Platform } from '@/utils/platform';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { hapticFeedback } from '@/utils/hapticFeedback';

export interface PlatformButtonProps extends ButtonProps {
  hapticFeedbackType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  activeOpacity?: number; // For iOS style
  elevationLevel?: number; // For Android style
  accessibilityLabel?: string; // For better A11y
  accessibilityHint?: string; // For better A11y
}

export const PlatformButton = forwardRef<HTMLButtonElement, PlatformButtonProps>(
  ({ 
    children, 
    className, 
    variant = 'default',
    size = 'default',
    hapticFeedbackType = 'medium',
    activeOpacity = 0.8,
    elevationLevel = 2,
    accessibilityLabel,
    accessibilityHint,
    onClick,
    ...props 
  }, ref) => {
    const { isPlatformIOS, isPlatformAndroid } = useResponsive();

    // Get platform-specific styles
    const getPlatformClasses = () => {
      if (isPlatformIOS) {
        return `active:opacity-${activeOpacity * 10}`;
      }
      
      if (isPlatformAndroid) {
        // Emulate Material Design elevation
        switch (elevationLevel) {
          case 0: return 'shadow-none';
          case 1: return 'shadow-sm';
          case 2: return 'shadow';
          case 3: return 'shadow-md';
          case 4: return 'shadow-lg';
          default: return 'shadow';
        }
      }
      
      return '';
    };

    // Handle click with haptic feedback
    const handleClickWithHaptics = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Provide haptic feedback on native platforms
      if (Platform.isNative()) {
        switch (hapticFeedbackType) {
          case 'light': hapticFeedback.impact('light'); break;
          case 'medium': hapticFeedback.impact('medium'); break;
          case 'heavy': hapticFeedback.impact('heavy'); break;
          case 'success': hapticFeedback.success(); break;
          case 'warning': hapticFeedback.warning(); break;
          case 'error': hapticFeedback.error(); break;
          default: hapticFeedback.selection();
        }
      }
      
      // Call the original onClick handler
      if (onClick) onClick(e);
    };

    return (
      <Button
        className={cn(getPlatformClasses(), className)}
        variant={variant}
        size={size}
        onClick={handleClickWithHaptics}
        ref={ref}
        aria-label={accessibilityLabel}
        aria-describedby={accessibilityHint ? `hint-${accessibilityHint.replace(/\s+/g, '-')}` : undefined}
        {...props}
      >
        {children}
        {accessibilityHint && (
          <span 
            className="sr-only" 
            id={`hint-${accessibilityHint.replace(/\s+/g, '-')}`}
          >
            {accessibilityHint}
          </span>
        )}
      </Button>
    );
  }
);

PlatformButton.displayName = 'PlatformButton';

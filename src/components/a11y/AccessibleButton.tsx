
import React from 'react';
import { Button } from '@/components/ui/button';
import { AccessibilityUtils } from '@/utils/accessibility';
import { Platform } from '@/utils/platform';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  isBusy?: boolean;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'success' | 'error';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onAccessibilityFocus?: () => void;
  onAccessibilityBlur?: () => void;
}

/**
 * Fully accessible button component that works across platforms
 */
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  isBusy = false,
  hapticFeedback,
  variant = 'default',
  size = 'default',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  children,
  onAccessibilityFocus,
  onAccessibilityBlur,
  disabled,
  onClick,
  ...props
}) => {
  // Handle haptic feedback on native platforms
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
    
    // Apply haptic feedback if specified
    if (hapticFeedback && !Platform.isWeb) {
      try {
        const { Haptics } = require('@capacitor/haptics');
        
        switch (hapticFeedback) {
          case 'light':
            Haptics.impact({ style: 'light' });
            break;
          case 'medium':
            Haptics.impact({ style: 'medium' });
            break;
          case 'heavy':
            Haptics.impact({ style: 'heavy' });
            break;
          case 'success':
            Haptics.notification({ type: 'success' });
            break;
          case 'error':
            Haptics.notification({ type: 'error' });
            break;
          default:
            Haptics.impact({ style: 'medium' });
        }
      } catch (e) {
        console.error('Error triggering haptic feedback:', e);
      }
    }
  };
  
  // Combine accessibility props
  const a11yProps = AccessibilityUtils.getAccessibilityProps(
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole,
    disabled || isBusy
  );
  
  // Combine focus management props
  const focusProps = AccessibilityUtils.getFocusProps(
    onAccessibilityFocus,
    onAccessibilityBlur
  );
  
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isBusy}
      className={cn(
        fullWidth && 'w-full',
        isBusy && 'opacity-70 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      {...a11yProps}
      {...focusProps}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {isBusy ? (
        <div className="flex items-center justify-center">
          <span className="mr-2">Loading...</span>
          {children}
        </div>
      ) : (
        children
      )}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </Button>
  );
};

export default AccessibleButton;

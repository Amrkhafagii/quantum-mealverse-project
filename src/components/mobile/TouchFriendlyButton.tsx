
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/responsive/core/ResponsiveContext';

export interface TouchFriendlyButtonProps extends ButtonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  touchOptimized?: boolean;
}

export const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({ 
  children, 
  className, 
  size = 'md',
  touchOptimized = true,
  ...props 
}) => {
  const { isMobile } = useResponsive();
  
  const sizeClasses = {
    sm: 'min-h-[40px] px-3 py-2 text-sm',
    md: 'min-h-[44px] px-4 py-2.5 text-base',
    lg: 'min-h-[48px] px-6 py-3 text-lg',
    xl: 'min-h-[52px] px-8 py-4 text-xl'
  };
  
  const touchClasses = cn(
    // Base touch-friendly styles
    sizeClasses[size],
    
    // Mobile optimizations
    isMobile && touchOptimized && [
      'touch-manipulation',
      'select-none',
      'active:scale-95',
      'transition-transform',
      'duration-150',
    ],
    
    className
  );
  
  return (
    <Button 
      className={touchClasses} 
      {...props}
    >
      {children}
    </Button>
  );
};

export default TouchFriendlyButton;

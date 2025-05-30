
import React from 'react';
import { useResponsive } from '../../core/ResponsiveContext';
import { cn } from '@/lib/utils';

interface MobileBreakpointProps {
  children: React.ReactNode;
  showOn?: 'mobile' | 'tablet' | 'desktop' | 'mobile-tablet' | 'tablet-desktop';
  className?: string;
}

export const MobileBreakpoint: React.FC<MobileBreakpointProps> = ({
  children,
  showOn = 'mobile',
  className,
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const shouldShow = () => {
    switch (showOn) {
      case 'mobile': return isMobile;
      case 'tablet': return isTablet;
      case 'desktop': return isDesktop;
      case 'mobile-tablet': return isMobile || isTablet;
      case 'tablet-desktop': return isTablet || isDesktop;
      default: return true;
    }
  };
  
  if (!shouldShow()) return null;
  
  return <div className={className}>{children}</div>;
};

interface TouchTargetProps {
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  className,
  size = 'medium',
}) => {
  const { isMobile } = useResponsive();
  
  const sizeClasses = {
    small: 'min-h-[40px] min-w-[40px]',
    medium: 'min-h-[44px] min-w-[44px]',
    large: 'min-h-[48px] min-w-[48px]',
  };
  
  const touchClasses = cn(
    isMobile && [
      sizeClasses[size],
      'touch-manipulation',
      'select-none',
    ],
    className
  );
  
  return <div className={touchClasses}>{children}</div>;
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
}) => {
  const { isMobile, isTablet } = useResponsive();
  
  const getGridCols = () => {
    if (isMobile) return `grid-cols-${cols.mobile}`;
    if (isTablet) return `grid-cols-${cols.tablet}`;
    return `grid-cols-${cols.desktop}`;
  };
  
  return (
    <div className={cn('grid gap-4', getGridCols(), className)}>
      {children}
    </div>
  );
};

export default { MobileBreakpoint, TouchTarget, ResponsiveGrid };

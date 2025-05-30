
import React from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';

interface MobileBreakpointProps {
  children: React.ReactNode;
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hide?: boolean;
  show?: boolean;
  className?: string;
}

export const MobileBreakpoint: React.FC<MobileBreakpointProps> = ({
  children,
  breakpoint = 'md',
  hide = false,
  show = false,
  className
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const shouldRender = () => {
    if (show && hide) return true; // If both are set, show by default
    
    switch (breakpoint) {
      case 'xs':
        return show ? isMobile : !hide || !isMobile;
      case 'sm':
        return show ? isMobile || isTablet : !hide || !(isMobile || isTablet);
      case 'md':
        return show ? isTablet : !hide || !isTablet;
      case 'lg':
        return show ? isDesktop : !hide || !isDesktop;
      case 'xl':
        return show ? isDesktop : !hide || !isDesktop;
      default:
        return true;
    }
  };

  if (!shouldRender()) return null;

  return <div className={className}>{children}</div>;
};

interface TouchTargetProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  as?: React.ElementType;
  onClick?: () => void;
}

export const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  className,
  size = 'md',
  as: Component = 'button',
  onClick,
  ...props
}) => {
  const { isMobile } = useResponsive();
  
  const sizeClasses = {
    sm: 'min-h-[36px] min-w-[36px] p-2',
    md: 'min-h-[44px] min-w-[44px] p-3',
    lg: 'min-h-[52px] min-w-[52px] p-4'
  };
  
  const touchClasses = isMobile 
    ? 'touch-manipulation select-none active:scale-95 transition-transform duration-150'
    : 'hover:scale-105 transition-transform duration-150';

  return (
    <Component
      className={cn(
        'flex items-center justify-center rounded-lg',
        sizeClasses[size],
        touchClasses,
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }
}) => {
  const gridClasses = cn(
    'grid gap-4',
    `grid-cols-${cols.xs || 1}`,
    `sm:grid-cols-${cols.sm || 2}`,
    `md:grid-cols-${cols.md || 3}`,
    `lg:grid-cols-${cols.lg || 4}`,
    `xl:grid-cols-${cols.xl || 5}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

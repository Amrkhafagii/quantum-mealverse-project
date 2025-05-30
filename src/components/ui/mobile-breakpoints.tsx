
import React from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';
import { 
  BreakpointSize, 
  shouldRenderAtBreakpoint, 
  getTouchTargetSize,
  getResponsiveClasses 
} from '@/utils/responsiveUtils';

interface MobileBreakpointProps {
  children: React.ReactNode;
  breakpoint?: BreakpointSize;
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
  
  // Determine render mode based on props
  const mode = show ? 'show' : hide ? 'hide' : 'show';
  
  const shouldRender = shouldRenderAtBreakpoint(
    breakpoint,
    { isMobile, isTablet, isDesktop },
    mode
  );

  if (!shouldRender) return null;

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
  
  const touchClasses = isMobile 
    ? 'touch-manipulation select-none active:scale-95 transition-transform duration-150'
    : 'hover:scale-105 transition-transform duration-150';

  const sizeClasses = getTouchTargetSize(size, isMobile);

  return (
    <Component
      className={cn(
        'flex items-center justify-center rounded-lg',
        sizeClasses,
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
  cols?: Partial<Record<BreakpointSize, number>>;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }
}) => {
  const gridClasses = cn(
    'grid gap-4',
    getResponsiveClasses.grid(cols),
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

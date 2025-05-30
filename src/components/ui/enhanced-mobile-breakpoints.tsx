
import React from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';
import { 
  BreakpointSize, 
  shouldRenderAtBreakpoint, 
  getTouchTargetSize,
  getResponsiveClasses 
} from '@/utils/responsiveUtils';

interface EnhancedMobileBreakpointProps {
  children: React.ReactNode;
  breakpoint?: BreakpointSize;
  mode?: 'show' | 'hide';
  className?: string;
}

export const EnhancedMobileBreakpoint: React.FC<EnhancedMobileBreakpointProps> = ({
  children,
  breakpoint = 'md',
  mode = 'show',
  className
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const shouldRender = shouldRenderAtBreakpoint(
    breakpoint,
    { isMobile, isTablet, isDesktop },
    mode
  );

  if (!shouldRender) return null;

  return <div className={className}>{children}</div>;
};

interface EnhancedTouchTargetProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  as?: React.ElementType;
  onClick?: () => void;
  disabled?: boolean;
}

export const EnhancedTouchTarget: React.FC<EnhancedTouchTargetProps> = ({
  children,
  className,
  size = 'md',
  as: Component = 'button',
  onClick,
  disabled = false,
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
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </Component>
  );
};

interface EnhancedResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: Partial<Record<BreakpointSize, number>>;
  gap?: string;
}

export const EnhancedResponsiveGrid: React.FC<EnhancedResponsiveGridProps> = ({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 'gap-4'
}) => {
  const gridClasses = cn(
    'grid',
    gap,
    getResponsiveClasses.grid(cols),
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// Utility component for responsive text
interface ResponsiveTextProps {
  children: React.ReactNode;
  sizes?: Partial<Record<BreakpointSize, string>>;
  className?: string;
  as?: React.ElementType;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  sizes = { xs: 'sm', sm: 'base', md: 'lg', lg: 'xl' },
  className,
  as: Component = 'span'
}) => {
  const textClasses = cn(
    getResponsiveClasses.text(sizes),
    className
  );

  return (
    <Component className={textClasses}>
      {children}
    </Component>
  );
};

// Utility component for responsive spacing
interface ResponsiveSpacingProps {
  children: React.ReactNode;
  padding?: Partial<Record<BreakpointSize, string>>;
  margin?: Partial<Record<BreakpointSize, string>>;
  className?: string;
}

export const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  children,
  padding,
  margin,
  className
}) => {
  const spacingClasses = cn(
    padding && getResponsiveClasses.padding(padding),
    margin && getResponsiveClasses.padding(margin)?.replace(/p-/g, 'm-'),
    className
  );

  return (
    <div className={spacingClasses}>
      {children}
    </div>
  );
};


import { useResponsive } from '@/contexts/ResponsiveContext';

// Breakpoint utility types
export type BreakpointSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Breakpoint configuration
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Utility functions for responsive class names
export const getResponsiveClasses = {
  grid: (cols: Partial<Record<BreakpointSize, number>>) => {
    const classes = [];
    if (cols.xs) classes.push(`grid-cols-${cols.xs}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`);
    return classes.join(' ');
  },

  padding: (sizes: Partial<Record<BreakpointSize, string>>) => {
    const classes = [];
    if (sizes.xs) classes.push(`p-${sizes.xs}`);
    if (sizes.sm) classes.push(`sm:p-${sizes.sm}`);
    if (sizes.md) classes.push(`md:p-${sizes.md}`);
    if (sizes.lg) classes.push(`lg:p-${sizes.lg}`);
    if (sizes.xl) classes.push(`xl:p-${sizes.xl}`);
    if (sizes['2xl']) classes.push(`2xl:p-${sizes['2xl']}`);
    return classes.join(' ');
  },

  text: (sizes: Partial<Record<BreakpointSize, string>>) => {
    const classes = [];
    if (sizes.xs) classes.push(`text-${sizes.xs}`);
    if (sizes.sm) classes.push(`sm:text-${sizes.sm}`);
    if (sizes.md) classes.push(`md:text-${sizes.md}`);
    if (sizes.lg) classes.push(`lg:text-${sizes.lg}`);
    if (sizes.xl) classes.push(`xl:text-${sizes.xl}`);
    if (sizes['2xl']) classes.push(`2xl:text-${sizes['2xl']}`);
    return classes.join(' ');
  },
};

// Helper function to determine if component should render at breakpoint
export const shouldRenderAtBreakpoint = (
  targetBreakpoint: BreakpointSize,
  currentDevice: { isMobile: boolean; isTablet: boolean; isDesktop: boolean },
  mode: 'show' | 'hide' = 'show'
): boolean => {
  const deviceBreakpoint = getCurrentBreakpoint(currentDevice);
  const targetIndex = Object.keys(BREAKPOINTS).indexOf(targetBreakpoint);
  const currentIndex = Object.keys(BREAKPOINTS).indexOf(deviceBreakpoint);
  
  if (mode === 'show') {
    return currentIndex >= targetIndex;
  } else {
    return currentIndex < targetIndex;
  }
};

// Get current breakpoint based on device type
export const getCurrentBreakpoint = (device: {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}): BreakpointSize => {
  if (device.isMobile) return 'sm';
  if (device.isTablet) return 'md';
  return 'lg';
};

// Touch target size utilities
export const getTouchTargetSize = (size: 'sm' | 'md' | 'lg', isMobile: boolean) => {
  const sizes = {
    sm: isMobile ? 'min-h-[36px] min-w-[36px] p-2' : 'min-h-[32px] min-w-[32px] p-1',
    md: isMobile ? 'min-h-[44px] min-w-[44px] p-3' : 'min-h-[36px] min-w-[36px] p-2',
    lg: isMobile ? 'min-h-[52px] min-w-[52px] p-4' : 'min-h-[44px] min-w-[44px] p-3',
  };
  return sizes[size];
};

// Layout helper functions
export const getLayoutClasses = {
  container: (isMobile: boolean, isTablet: boolean) => {
    if (isMobile) return 'flex flex-col w-full';
    if (isTablet) return 'flex w-full max-w-screen-lg mx-auto';
    return 'flex w-full max-w-screen-xl mx-auto';
  },
  
  sidebar: (position: 'left' | 'right', width: string, safeArea: { left: number; right: number }) => {
    const baseClasses = 'shrink-0';
    const borderClass = position === 'left' ? 'border-r' : 'border-l';
    const paddingLeft = position === 'left' ? `${safeArea.left}px` : undefined;
    const paddingRight = position === 'right' ? `${safeArea.right}px` : undefined;
    
    return {
      className: `${baseClasses} ${borderClass} dark:border-gray-800`,
      style: {
        width,
        paddingLeft,
        paddingRight,
      },
    };
  },
};

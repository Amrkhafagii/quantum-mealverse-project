
import React from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileFull?: boolean;
  respectSafeArea?: boolean;
  padded?: boolean;
  centerContent?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  mobileFull = true,
  respectSafeArea = true,
  padded = true,
  centerContent = false,
  maxWidth = 'xl',
}) => {
  const { 
    isMobile, 
    isTablet, 
    safeAreaTop, 
    safeAreaBottom, 
    safeAreaLeft, 
    safeAreaRight 
  } = useResponsive();
  
  const safeAreaStyle = respectSafeArea ? {
    paddingTop: `${safeAreaTop}px`,
    paddingBottom: `${safeAreaBottom}px`,
    paddingLeft: `${safeAreaLeft}px`,
    paddingRight: `${safeAreaRight}px`,
  } : {};
  
  const maxWidthClass = maxWidth !== 'none' ? {
    'max-w-xs': maxWidth === 'xs',
    'max-w-sm': maxWidth === 'sm',
    'max-w-md': maxWidth === 'md',
    'max-w-lg': maxWidth === 'lg',
    'max-w-xl': maxWidth === 'xl',
    'max-w-2xl': maxWidth === '2xl',
  } : {};
  
  return (
    <div
      className={cn(
        'transition-all duration-200',
        mobileFull && isMobile ? 'w-full' : 'w-full mx-auto',
        padded && (isMobile ? 'px-4 py-3' : isTablet ? 'px-6 py-4' : 'px-8 py-5'),
        centerContent && 'flex flex-col items-center',
        maxWidthClass,
        className
      )}
      style={safeAreaStyle}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;

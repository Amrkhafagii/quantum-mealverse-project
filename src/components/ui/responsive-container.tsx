
import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/responsive/core/ResponsiveContext';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
  respectSafeArea?: boolean;
  padded?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'lg',
  respectSafeArea = false,
  padded = false,
}) => {
  const { isMobile, safeAreaTop, safeAreaBottom, safeAreaLeft, safeAreaRight } = useResponsive();
  
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  };

  const containerStyles: React.CSSProperties = respectSafeArea ? {
    paddingTop: safeAreaTop,
    paddingBottom: safeAreaBottom,
    paddingLeft: safeAreaLeft,
    paddingRight: safeAreaRight,
  } : {};

  return (
    <div 
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        padded && 'px-4 sm:px-6 lg:px-8',
        className
      )}
      style={containerStyles}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;

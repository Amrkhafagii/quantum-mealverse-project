
import React from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';
import SafeAreaView from '@/components/ui/SafeAreaView';
import PlatformErrorBoundary from '@/components/ui/PlatformErrorBoundary';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileFull?: boolean;
  respectSafeArea?: boolean;
  padded?: boolean;
  centerContent?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none';
  as?: React.ElementType;
  disableTop?: boolean;
  disableBottom?: boolean;
  disableSides?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  mobileFull = true,
  respectSafeArea = true,
  padded = true,
  centerContent = false,
  maxWidth = 'xl',
  as = 'div',
  disableTop = false,
  disableBottom = false,
  disableSides = false,
}) => {
  const { 
    isMobile, 
    isTablet, 
    isPlatformIOS,
    isInitialized
  } = useResponsive();
  
  // Show loading state until context is initialized
  if (!isInitialized) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded" />;
  }
  
  const maxWidthClass = maxWidth !== 'none' ? {
    'max-w-xs': maxWidth === 'xs',
    'max-w-sm': maxWidth === 'sm',
    'max-w-md': maxWidth === 'md',
    'max-w-lg': maxWidth === 'lg',
    'max-w-xl': maxWidth === 'xl',
    'max-w-2xl': maxWidth === '2xl',
  } : {};
  
  // Enhanced mobile-specific padding and spacing
  const responsivePadding = padded ? (
    isMobile 
      ? 'px-3 py-2 sm:px-4 sm:py-3' 
      : isTablet 
        ? 'px-6 py-4' 
        : 'px-8 py-5'
  ) : '';
  
  // Base classes with improved mobile optimizations
  const containerClasses = cn(
    'transition-all duration-200',
    mobileFull && isMobile ? 'w-full' : 'w-full mx-auto',
    responsivePadding,
    centerContent && 'flex flex-col items-center',
    // Mobile-specific optimizations
    isMobile && [
      'touch-manipulation',
      'overscroll-behavior-contain',
    ],
    // Platform-specific optimizations
    isPlatformIOS && 'ios-scroll',
    maxWidthClass,
    className
  );
  
  const content = <>{children}</>;
  
  // Wrap in platform error boundary for safer platform-specific features
  const errorBoundaryContent = (
    <PlatformErrorBoundary platformSpecific={isPlatformIOS && respectSafeArea}>
      {content}
    </PlatformErrorBoundary>
  );
  
  // For iOS devices that need safe area adjustments, use our consolidated SafeAreaView
  if (isPlatformIOS && respectSafeArea) {
    return (
      <SafeAreaView 
        className={containerClasses} 
        as={as}
        disableTop={disableTop}
        disableBottom={disableBottom}
        disableSides={disableSides}
      >
        {errorBoundaryContent}
      </SafeAreaView>
    );
  }
  
  // For everything else, use regular container
  const Component = as;
  return (
    <Component className={containerClasses}>
      {errorBoundaryContent}
    </Component>
  );
};

export default ResponsiveContainer;

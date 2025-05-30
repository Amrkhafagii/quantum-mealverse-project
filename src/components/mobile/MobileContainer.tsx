
import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/contexts/ResponsiveContext';
import SafeAreaView from './SafeAreaView';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
  noPadding?: boolean;
  fullWidth?: boolean;
  disableSafeArea?: boolean;
  // Enhanced responsive props
  responsivePadding?: boolean;
  adaptiveHeight?: boolean;
  touchOptimized?: boolean;
}

const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className = '',
  fullHeight = false,
  noPadding = false,
  fullWidth = false,
  disableSafeArea = false,
  responsivePadding = true,
  adaptiveHeight = false,
  touchOptimized = true
}) => {
  const { isMobile, isTablet, isPlatformIOS } = useResponsive();
  
  // Build responsive classes based on device type and props
  const getContainerClasses = () => {
    const classes = [];
    
    // Base classes
    classes.push('transition-all duration-200');
    
    // Height management
    if (fullHeight) {
      classes.push(adaptiveHeight ? 'min-h-screen-safe' : 'min-h-screen');
    }
    
    // Padding management - mobile-first approach
    if (!noPadding && responsivePadding) {
      if (isMobile) {
        classes.push('px-4 py-3'); // Mobile padding
      } else if (isTablet) {
        classes.push('px-6 py-4'); // Tablet padding  
      } else {
        classes.push('px-8 py-6'); // Desktop padding
      }
    } else if (!noPadding) {
      // Legacy padding for backward compatibility
      classes.push(isMobile ? 'px-4 py-2' : 'px-8 py-4');
    }
    
    // Width management
    if (fullWidth) {
      classes.push('w-full');
    } else {
      if (isMobile) {
        classes.push('w-full'); // Full width on mobile
      } else {
        classes.push('max-w-7xl mx-auto w-full'); // Container with max width on larger screens
      }
    }
    
    // Touch optimization for mobile devices
    if (touchOptimized && isMobile) {
      classes.push('touch-manipulation select-none');
    }
    
    return cn(classes, className);
  };
  
  const containerClasses = getContainerClasses();
  
  // Use SafeAreaView for iOS devices unless disabled
  if (isPlatformIOS && !disableSafeArea) {
    return (
      <SafeAreaView className={containerClasses}>
        {children}
      </SafeAreaView>
    );
  }
  
  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

export default MobileContainer;

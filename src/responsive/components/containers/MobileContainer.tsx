
import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '../../core/ResponsiveContext';
import { SafeAreaView } from '../ui/SafeAreaView';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullHeight?: boolean;
  safeArea?: boolean;
  as?: React.ElementType;
}

const paddingClasses = {
  none: '',
  xs: 'p-1 sm:p-2',
  sm: 'p-2 sm:p-3',
  md: 'p-3 sm:p-4 md:p-5',
  lg: 'p-4 sm:p-6 md:p-8',
  xl: 'p-6 sm:p-8 md:p-10',
};

const marginClasses = {
  none: '',
  xs: 'm-1 sm:m-2',
  sm: 'm-2 sm:m-3',
  md: 'm-3 sm:m-4 md:m-5',
  lg: 'm-4 sm:m-6 md:m-8',
  xl: 'm-6 sm:m-8 md:m-10',
};

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className,
  padding = 'md',
  margin = 'none',
  fullHeight = false,
  safeArea = true,
  as: Component = 'div',
}) => {
  const { isMobile, isTablet, isPlatformIOS } = useResponsive();
  
  const containerClasses = cn(
    'w-full',
    paddingClasses[padding],
    marginClasses[margin],
    fullHeight && 'min-h-screen',
    isMobile && 'touch-manipulation',
    className
  );
  
  // Use SafeAreaView for iOS devices if safeArea is enabled
  if (isPlatformIOS && safeArea) {
    return (
      <SafeAreaView 
        className={containerClasses}
        as={Component}
      >
        {children}
      </SafeAreaView>
    );
  }
  
  return (
    <Component className={containerClasses}>
      {children}
    </Component>
  );
};

export default MobileContainer;

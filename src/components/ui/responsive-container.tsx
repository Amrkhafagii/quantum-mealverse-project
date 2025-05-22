
import React from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';
import SafeAreaView from '@/components/ios/SafeAreaView';

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
    isPlatformIOS
  } = useResponsive();
  
  const maxWidthClass = maxWidth !== 'none' ? {
    'max-w-xs': maxWidth === 'xs',
    'max-w-sm': maxWidth === 'sm',
    'max-w-md': maxWidth === 'md',
    'max-w-lg': maxWidth === 'lg',
    'max-w-xl': maxWidth === 'xl',
    'max-w-2xl': maxWidth === '2xl',
  } : {};
  
  // Base classes without safe area
  const containerClasses = cn(
    'transition-all duration-200',
    mobileFull && isMobile ? 'w-full' : 'w-full mx-auto',
    padded && (isMobile ? 'px-4 py-3' : isTablet ? 'px-6 py-4' : 'px-8 py-5'),
    centerContent && 'flex flex-col items-center',
    maxWidthClass,
    className
  );
  
  // For iOS devices that need safe area adjustments, use our SafeAreaView component
  if (isPlatformIOS && respectSafeArea) {
    return (
      <SafeAreaView 
        className={containerClasses} 
        as={as}
        disableTop={disableTop}
        disableBottom={disableBottom}
        disableSides={disableSides}
      >
        {children}
      </SafeAreaView>
    );
  }
  
  // For everything else, use regular container
  const Component = as;
  return (
    <Component className={containerClasses}>
      {children}
    </Component>
  );
};

export default ResponsiveContainer;

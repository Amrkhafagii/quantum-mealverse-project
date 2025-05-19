
import React from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';
import { Platform } from '@/utils/platform';

interface PlatformContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fullHeight?: boolean;
  safeArea?: boolean;
}

/**
 * A container component that adapts its styling based on the platform
 */
export const PlatformContainer: React.FC<PlatformContainerProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  maxWidth = 'xl',
  fullHeight = false,
  safeArea = true,
}) => {
  const { 
    isPlatformIOS, 
    isPlatformAndroid, 
    isMobile, 
    safeAreaTop, 
    safeAreaBottom,
    safeAreaLeft,
    safeAreaRight
  } = useResponsive();

  // Calculate the styling based on platform
  const getVariantClasses = () => {
    // Base classes that apply to all platforms
    let classes = 'transition-all duration-200';
    
    // Add padding based on size
    switch (padding) {
      case 'none':
        break;
      case 'sm':
        classes += ' p-2 sm:p-3';
        break;
      case 'md':
        classes += ' p-3 sm:p-4 md:p-5';
        break;
      case 'lg':
        classes += ' p-4 sm:p-6 md:p-8';
        break;
    }
    
    // Add max width constraint based on maxWidth prop
    switch (maxWidth) {
      case 'none':
        classes += ' w-full';
        break;
      case 'sm':
        classes += ' w-full max-w-sm mx-auto';
        break;
      case 'md':
        classes += ' w-full max-w-md mx-auto';
        break;
      case 'lg':
        classes += ' w-full max-w-lg mx-auto';
        break;
      case 'xl':
        classes += ' w-full max-w-xl mx-auto';
        break;
      case '2xl':
        classes += ' w-full max-w-2xl mx-auto';
        break;
    }
    
    // Add height classes if fullHeight
    if (fullHeight) {
      classes += ' min-h-[100dvh]';
    }
    
    // Platform-specific styling
    if (isPlatformIOS) {
      // iOS-specific styles
      switch (variant) {
        case 'elevated':
          classes += ' bg-white dark:bg-gray-800 shadow-sm';
          break;
        case 'outlined':
          classes += ' border border-gray-200 dark:border-gray-700';
          break;
        default:
          classes += ' bg-white dark:bg-gray-900';
          break;
      }
    } else if (isPlatformAndroid) {
      // Material Design inspired styles
      switch (variant) {
        case 'elevated':
          classes += ' bg-white dark:bg-gray-800 shadow-md rounded-md';
          break;
        case 'outlined':
          classes += ' border border-gray-300 dark:border-gray-600 rounded-md';
          break;
        default:
          classes += ' bg-white dark:bg-gray-900 rounded-sm';
          break;
      }
    } else {
      // Web styles
      switch (variant) {
        case 'elevated':
          classes += ' bg-white dark:bg-gray-800 shadow-md rounded-lg';
          break;
        case 'outlined':
          classes += ' border border-gray-200 dark:border-gray-700 rounded-lg';
          break;
        default:
          classes += ' bg-white dark:bg-gray-900';
          break;
      }
    }
    
    return classes;
  };
  
  // Determine safe area padding
  const safeAreaStyle = safeArea ? {
    paddingTop: safeAreaTop > 0 ? `${safeAreaTop}px` : undefined,
    paddingBottom: safeAreaBottom > 0 ? `${safeAreaBottom}px` : undefined,
    paddingLeft: safeAreaLeft > 0 ? `${safeAreaLeft}px` : undefined,
    paddingRight: safeAreaRight > 0 ? `${safeAreaRight}px` : undefined,
  } : {};

  return (
    <div 
      className={cn(getVariantClasses(), className)}
      style={safeAreaStyle}
    >
      {children}
    </div>
  );
};

export default PlatformContainer;


import React, { ReactNode } from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';
import { Platform } from '@/utils/platform';

interface SafeAreaViewProps {
  children: ReactNode;
  className?: string;
  disableTop?: boolean;
  disableBottom?: boolean;
  disableSides?: boolean;
  disableStatusBarHeight?: boolean;
  as?: React.ElementType;
  style?: React.CSSProperties;
  insetValue?: 'env' | 'computed' | 'adaptive';
}

/**
 * SafeAreaView component that adapts to iOS safe areas
 * 
 * @param children - The content to render
 * @param className - Additional CSS classes
 * @param disableTop - Whether to disable top safe area padding
 * @param disableBottom - Whether to disable bottom safe area padding
 * @param disableSides - Whether to disable left/right safe area padding
 * @param disableStatusBarHeight - Whether to disable status bar height padding
 * @param as - The HTML element to use
 * @param style - Additional inline styles
 * @param insetValue - How to calculate insets: 'env' (CSS variables), 'computed' (JS values), or 'adaptive' (best of both)
 */
const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  className = '',
  disableTop = false,
  disableBottom = false,
  disableSides = false,
  disableStatusBarHeight = false,
  as: Component = 'div',
  style = {},
  insetValue = 'adaptive'
}) => {
  const { 
    safeAreaTop, 
    safeAreaBottom, 
    safeAreaLeft, 
    safeAreaRight, 
    statusBarHeight,
    isPlatformIOS,
    hasNotch,
    hasDynamicIsland,
    deviceOrientation
  } = useResponsive();
  
  const isLandscape = deviceOrientation === 'landscape';
  
  // Calculate safe area styles based on chosen method
  const getSafeAreaStyle = () => {
    // Return empty object if not iOS
    if (!isPlatformIOS) return {};
    
    // If using direct CSS env variables
    if (insetValue === 'env') {
      return {
        paddingTop: !disableTop ? 'env(safe-area-inset-top, 0px)' : undefined,
        paddingBottom: !disableBottom ? 'env(safe-area-inset-bottom, 0px)' : undefined,
        paddingLeft: !disableSides ? 'env(safe-area-inset-left, 0px)' : undefined,
        paddingRight: !disableSides ? 'env(safe-area-inset-right, 0px)' : undefined,
      };
    }
    
    // If using computed values
    if (insetValue === 'computed') {
      return {
        paddingTop: !disableTop ? `${safeAreaTop}px` : undefined,
        paddingBottom: !disableBottom ? `${safeAreaBottom}px` : undefined,
        paddingLeft: !disableSides ? `${safeAreaLeft}px` : undefined,
        paddingRight: !disableSides ? `${safeAreaRight}px` : undefined,
      };
    }
    
    // Adaptive approach - use computed values with status bar handling
    const topValue = disableTop 
      ? undefined 
      : disableStatusBarHeight 
        ? `${safeAreaTop - statusBarHeight}px` 
        : `${safeAreaTop}px`;
        
    return {
      paddingTop: topValue,
      paddingBottom: !disableBottom ? `${safeAreaBottom}px` : undefined,
      paddingLeft: !disableSides ? `${safeAreaLeft}px` : undefined,
      paddingRight: !disableSides ? `${safeAreaRight}px` : undefined,
    };
  };
  
  // Generate device-specific classes
  const getDeviceClasses = () => {
    if (!isPlatformIOS) return '';
    
    let classes = 'ios-safe-area';
    
    if (hasNotch) classes += ' has-notch';
    if (hasDynamicIsland) classes += ' has-dynamic-island';
    if (isLandscape) classes += ' landscape';
    
    return classes;
  };
  
  return (
    <Component 
      className={cn(
        isPlatformIOS && getDeviceClasses(),
        className
      )}
      style={{
        ...getSafeAreaStyle(),
        ...style
      }}
    >
      {children}
    </Component>
  );
};

export default SafeAreaView;

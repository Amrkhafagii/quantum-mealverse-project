
import React, { ReactNode } from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';

interface SafeAreaViewProps {
  children: ReactNode;
  className?: string;
  disableTop?: boolean;
  disableBottom?: boolean;
  disableSides?: boolean;
  as?: React.ElementType;
  statusBarHeight?: boolean; // Whether to include status bar height
}

const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  className = '',
  disableTop = false,
  disableBottom = false,
  disableSides = false,
  as: Component = 'div',
  statusBarHeight = true
}) => {
  const { 
    safeAreaTop, 
    safeAreaBottom, 
    safeAreaLeft, 
    safeAreaRight, 
    isPlatformIOS,
    statusBarHeight: sbHeight,
    hasNotch,
    hasDynamicIsland
  } = useResponsive();
  
  // Calculate top padding based on status bar and notch presence
  const getTopPadding = () => {
    if (disableTop) return 0;
    
    // For iOS with notch or dynamic island, use the safe area top value
    if (isPlatformIOS && (hasNotch || hasDynamicIsland)) {
      return `${safeAreaTop}px`;
    }
    
    // For iOS without notch but with status bar
    if (isPlatformIOS && statusBarHeight) {
      return `${sbHeight}px`;
    }
    
    return 0;
  };
  
  // Only apply safe area insets on iOS
  const safeAreaStyle = isPlatformIOS ? {
    paddingTop: getTopPadding(),
    paddingBottom: !disableBottom ? `${safeAreaBottom}px` : undefined,
    paddingLeft: !disableSides ? `${safeAreaLeft}px` : undefined,
    paddingRight: !disableSides ? `${safeAreaRight}px` : undefined,
  } : {};
  
  return (
    <Component 
      className={cn(
        isPlatformIOS && 'ios-safe-area',
        hasNotch && 'has-notch',
        hasDynamicIsland && 'has-dynamic-island',
        className
      )}
      style={safeAreaStyle}
    >
      {children}
    </Component>
  );
};

export default SafeAreaView;

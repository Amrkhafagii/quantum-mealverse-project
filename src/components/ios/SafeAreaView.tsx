
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
}

const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  className = '',
  disableTop = false,
  disableBottom = false,
  disableSides = false,
  as: Component = 'div'
}) => {
  const { safeAreaTop, safeAreaBottom, safeAreaLeft, safeAreaRight, isPlatformIOS } = useResponsive();
  
  // Only apply safe area insets on iOS
  const safeAreaStyle = isPlatformIOS ? {
    paddingTop: !disableTop ? `${safeAreaTop}px` : undefined,
    paddingBottom: !disableBottom ? `${safeAreaBottom}px` : undefined,
    paddingLeft: !disableSides ? `${safeAreaLeft}px` : undefined,
    paddingRight: !disableSides ? `${safeAreaRight}px` : undefined,
  } : {};
  
  return (
    <Component 
      className={cn(
        isPlatformIOS && 'ios-safe-area',
        className
      )}
      style={safeAreaStyle}
    >
      {children}
    </Component>
  );
};

export default SafeAreaView;

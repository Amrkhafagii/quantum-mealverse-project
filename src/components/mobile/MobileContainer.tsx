
import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/responsive/core/ResponsiveContext';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  respectSafeArea?: boolean;
}

const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className,
  padded = true,
  respectSafeArea = true,
}) => {
  const { 
    isMobile, 
    safeAreaTop, 
    safeAreaBottom, 
    safeAreaLeft, 
    safeAreaRight 
  } = useResponsive();

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  const containerStyles: React.CSSProperties = respectSafeArea ? {
    paddingTop: safeAreaTop,
    paddingBottom: safeAreaBottom,
    paddingLeft: safeAreaLeft,
    paddingRight: safeAreaRight,
  } : {};

  return (
    <div 
      className={cn(
        'w-full',
        padded && 'px-4',
        className
      )}
      style={containerStyles}
    >
      {children}
    </div>
  );
};

export default MobileContainer;

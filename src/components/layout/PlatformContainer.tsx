
import React from 'react';
import { useResponsive } from '@/responsive/core/ResponsiveContext';
import { cn } from '@/lib/utils';

interface PlatformContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PlatformContainer: React.FC<PlatformContainerProps> = ({
  children,
  className
}) => {
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();

  return (
    <div className={cn(
      "w-full",
      isPlatformIOS && "ios-container",
      isPlatformAndroid && "android-container",
      isMobile && "mobile-container",
      className
    )}>
      {children}
    </div>
  );
};

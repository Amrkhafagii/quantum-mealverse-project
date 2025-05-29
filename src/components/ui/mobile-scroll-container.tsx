
import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/contexts/ResponsiveContext';

interface MobileScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  enablePullToRefresh?: boolean;
  onRefresh?: () => void;
}

export const MobileScrollContainer: React.FC<MobileScrollContainerProps> = ({
  children,
  className,
  maxHeight = 'calc(100vh - 200px)',
  enablePullToRefresh = false,
  onRefresh,
}) => {
  const { isMobile, isPlatformIOS, isPlatformAndroid } = useResponsive();
  
  const scrollClasses = cn(
    'overflow-y-auto overflow-x-hidden',
    // iOS specific scroll improvements
    isPlatformIOS && [
      'ios-scroll',
      '-webkit-overflow-scrolling: touch',
      'overscroll-behavior-y: none', // Prevent bounce
    ],
    // Android specific scroll improvements
    isPlatformAndroid && [
      'android-scroll',
      'overscroll-behavior: contain',
    ],
    // Mobile optimizations
    isMobile && [
      'scroll-smooth',
      'scrollbar-hide',
      'touch-manipulation',
    ],
    className
  );
  
  const containerStyle = {
    maxHeight: isMobile ? maxHeight : 'none',
    WebkitOverflowScrolling: isPlatformIOS ? 'touch' : undefined,
  };
  
  return (
    <div 
      className={scrollClasses}
      style={containerStyle}
    >
      {children}
    </div>
  );
};

export default MobileScrollContainer;

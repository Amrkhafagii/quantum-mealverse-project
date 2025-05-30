
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useResponsive } from '../../core/ResponsiveContext';

interface AdaptiveScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  height?: string;
  enablePullToRefresh?: boolean;
  onRefresh?: () => void;
}

export const AdaptiveScrollArea: React.FC<AdaptiveScrollAreaProps> = ({
  children,
  className,
  height = '100%',
  enablePullToRefresh = false,
  onRefresh,
}) => {
  const { isMobile, isPlatformIOS, isPlatformAndroid } = useResponsive();
  
  const scrollClasses = cn(
    // iOS specific scroll improvements
    isPlatformIOS && [
      'ios-scroll',
      'overscroll-behavior-y-none',
    ],
    
    // Android specific scroll improvements
    isPlatformAndroid && [
      'android-scroll',
      'overscroll-behavior-contain',
    ],
    
    // Mobile optimizations
    isMobile && [
      'scroll-smooth',
      'scrollbar-hide',
      'touch-manipulation',
    ],
    
    className
  );
  
  return (
    <ScrollArea 
      className={scrollClasses}
      style={{ height }}
    >
      {children}
    </ScrollArea>
  );
};

export default AdaptiveScrollArea;

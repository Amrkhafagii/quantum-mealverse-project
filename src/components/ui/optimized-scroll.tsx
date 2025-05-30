
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResponsive } from '@/responsive/core/ResponsiveContext';
import { cn } from '@/lib/utils';

interface OptimizedScrollProps {
  children: React.ReactNode;
  className?: string;
  enableNativeScroll?: boolean;
}

export const OptimizedScrollArea: React.FC<OptimizedScrollProps> = ({
  children,
  className,
  enableNativeScroll = false
}) => {
  const { isMobile } = useResponsive();

  if (isMobile && enableNativeScroll) {
    return (
      <div 
        className={cn(
          "overflow-auto -webkit-overflow-scrolling-touch",
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <ScrollArea className={className}>
      {children}
    </ScrollArea>
  );
};


import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';

export interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  disabled?: boolean;
  isRefreshing?: boolean;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ 
  onRefresh, 
  children, 
  threshold = 80,
  disabled = false,
  isRefreshing = false,
  className
}) => {
  const { isMobile, isPlatformIOS, isPlatformAndroid } = useResponsive();
  const [isFetching, setIsFetching] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartTimeRef = useRef<number>(0);

  // Handle externally controlled refreshing state
  useEffect(() => {
    if (isRefreshing) {
      setIsFetching(true);
    } else if (isRefreshing === false) {
      setIsFetching(false);
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [isRefreshing]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isFetching || !isMobile) return;
    
    // Only activate pull if we're at the top of the scroll
    const scrollElement = containerRef.current?.parentElement || window;
    const scrollTop = scrollElement === window ? window.scrollY : (scrollElement as HTMLElement).scrollTop;
    
    if (scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      touchStartTimeRef.current = Date.now();
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !startY || isFetching || !isPulling || !isMobile) return;
    
    // Calculate pull distance
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    // Only allow pulling down
    if (diff > 0) {
      // Apply platform-specific resistance
      let resistance = 0.4;
      if (isPlatformIOS) {
        resistance = 0.3; // iOS feels more natural with less resistance
      } else if (isPlatformAndroid) {
        resistance = 0.5; // Android can handle more resistance
      }
      
      const newDistance = Math.min(diff * resistance, threshold * 1.5);
      setPullDistance(newDistance);
      
      // Prevent normal scrolling only if we're pulling significantly
      if (newDistance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || !startY || isFetching || !isPulling || !isMobile) return;
    
    const touchDuration = Date.now() - touchStartTimeRef.current;
    
    // If pulled past threshold and gesture was intentional (not too fast)
    if (pullDistance > threshold && touchDuration > 100) {
      try {
        setIsFetching(true);
        await onRefresh();
      } catch (error) {
        console.error('Error during refresh:', error);
      } finally {
        setIsFetching(false);
      }
    }
    
    // Reset
    setStartY(0);
    setPullDistance(0);
    setIsPulling(false);
    touchStartTimeRef.current = 0;
  };

  // Get platform-specific refresh indicator
  const getRefreshIndicator = () => {
    const progress = Math.min(pullDistance / threshold, 1);
    const isReady = pullDistance > threshold;
    
    if (isPlatformIOS) {
      return (
        <div className={cn(
          "flex items-center justify-center",
          "bg-white/90 backdrop-blur-lg rounded-full p-2 shadow-sm",
          "border border-gray-200"
        )}>
          {isFetching ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          ) : (
            <RefreshCw 
              className={cn(
                "h-5 w-5 transition-all duration-200",
                isReady ? "text-blue-500" : "text-gray-400"
              )}
              style={{
                transform: !isFetching ? `rotate(${progress * 180}deg)` : 'none',
              }}
            />
          )}
        </div>
      );
    }
    
    if (isPlatformAndroid) {
      return (
        <div className="flex items-center justify-center">
          <div className={cn(
            "w-8 h-8 rounded-full border-2 border-gray-300",
            "flex items-center justify-center transition-all duration-200",
            isReady && "border-primary bg-primary/10"
          )}>
            {isFetching ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : (
              <div 
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  isReady ? "bg-primary" : "bg-gray-400"
                )}
                style={{
                  transform: `scale(${progress})`,
                }}
              />
            )}
          </div>
        </div>
      );
    }
    
    // Default web indicator
    return (
      <div className="bg-background/80 backdrop-blur-sm shadow-md rounded-full p-2 border border-border">
        <Loader2
          className={cn(
            "h-5 w-5 text-primary transition-all duration-200",
            isFetching ? 'animate-spin' : ''
          )}
          style={{
            transform: !isFetching ? `rotate(${progress * 360}deg)` : 'none',
            opacity: Math.max(progress, 0.3)
          }}
        />
      </div>
    );
  };

  // Don't render pull-to-refresh on desktop
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loading indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center items-center transition-all duration-300 z-10"
        style={{
          transform: `translateY(${Math.max(pullDistance - 40, -40)}px)`,
          opacity: isPulling ? Math.min(pullDistance / threshold, 1) : 0,
        }}
      >
        {getRefreshIndicator()}
      </div>

      {/* Content with pull effect */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

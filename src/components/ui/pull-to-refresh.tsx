import React from 'react';
import { useResponsive } from '@/responsive/core/ResponsiveContext';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  pullDistance?: number;
  maxPullDistance?: number;
  backgroundColor?: string;
  spinnerColor?: string;
  spinnerSize?: number;
  pullText?: string;
  releaseText?: string;
  refreshingText?: string;
  showIndicator?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  pullDistance = 80,
  maxPullDistance = 120,
  backgroundColor = 'transparent',
  spinnerColor = '#000',
  spinnerSize = 24,
  pullText = 'Pull to refresh',
  releaseText = 'Release to refresh',
  refreshingText = 'Refreshing...',
  showIndicator = true,
}) => {
  const { isMobile } = useResponsive();
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullY, setPullY] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startYRef = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    
    // Only enable pull-to-refresh when at the top of the content
    if (scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing || startYRef.current === null) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    
    // Only pull down, not up
    if (diff > 0) {
      // Apply resistance to make it harder to pull as you go
      const resistance = 0.4;
      const newPullY = Math.min(diff * resistance, maxPullDistance);
      setPullY(newPullY);
      
      // Prevent default scrolling behavior when pulling
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || isRefreshing) return;
    
    if (pullY >= pullDistance) {
      // Trigger refresh
      setIsRefreshing(true);
      setPullY(pullDistance / 2); // Show partial indicator during refresh
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullY(0);
      }
    } else {
      // Reset without refreshing
      setPullY(0);
    }
    
    setIsPulling(false);
    startYRef.current = null;
  };

  // Don't apply pull-to-refresh on non-mobile devices
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {showIndicator && (isPulling || isRefreshing) && (
        <div 
          className="absolute left-0 right-0 flex flex-col items-center justify-center overflow-hidden transition-transform duration-200"
          style={{ 
            height: `${pullY}px`,
            top: 0,
            backgroundColor,
            transform: `translateY(-${pullY > 0 ? 0 : pullY}px)`,
            zIndex: 10
          }}
        >
          {isRefreshing ? (
            <div className="flex flex-col items-center">
              <div 
                className="animate-spin rounded-full border-2 border-t-transparent"
                style={{ 
                  width: spinnerSize, 
                  height: spinnerSize, 
                  borderColor: spinnerColor,
                  borderTopColor: 'transparent'
                }}
              />
              <span className="text-xs mt-1">{refreshingText}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div 
                className="rounded-full border-2"
                style={{ 
                  width: spinnerSize, 
                  height: spinnerSize, 
                  borderColor: spinnerColor,
                  transform: `rotate(${(pullY / pullDistance) * 360}deg)`,
                  opacity: pullY / pullDistance
                }}
              />
              <span className="text-xs mt-1">
                {pullY >= pullDistance ? releaseText : pullText}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Content with transform to show pull effect */}
      <div 
        style={{ 
          transform: `translateY(${pullY}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

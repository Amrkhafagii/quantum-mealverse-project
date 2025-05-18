
import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  disabled?: boolean;
  isRefreshing?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ 
  onRefresh, 
  children, 
  threshold = 80,
  disabled = false,
  isRefreshing = false
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle externally controlled refreshing state
  useEffect(() => {
    if (isRefreshing) {
      setIsFetching(true);
    } else if (isRefreshing === false) {
      setIsFetching(false);
      setPullDistance(0);
    }
  }, [isRefreshing]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isFetching) return;
    
    // Only activate pull if we're at the top of the scroll
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !startY || isFetching) return;
    
    // Calculate pull distance
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    // Only allow pulling down
    if (diff > 0) {
      // Apply resistance to make the pull feel more natural
      const resistance = 0.4;
      const newDistance = Math.min(diff * resistance, threshold * 1.5);
      
      setPullDistance(newDistance);
      
      // Prevent normal scrolling
      if (window.scrollY === 0) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || !startY || isFetching) return;
    
    // If pulled past threshold, trigger refresh
    if (pullDistance > threshold) {
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
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loading indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center items-center transition-transform duration-300 z-10"
        style={{
          transform: `translateY(${pullDistance - 40}px)`,
          opacity: Math.min(pullDistance / threshold, 1),
        }}
      >
        <div className="bg-background shadow-md rounded-full p-2 border border-border">
          <Loader2
            className={`h-5 w-5 text-primary ${isFetching ? 'animate-spin' : ''}`}
            style={{
              transform: !isFetching ? `rotate(${(pullDistance / threshold) * 360}deg)` : 'none',
            }}
          />
        </div>
      </div>

      {/* Content with pull effect */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};

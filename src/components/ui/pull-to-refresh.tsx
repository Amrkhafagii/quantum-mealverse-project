
import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { Platform } from '@/utils/platform';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
  pullDistance?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  disabled = false,
  pullDistance = 80,
  className = ''
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isMobile = Platform.isNative() || (typeof window !== 'undefined' && window.innerWidth <= 768);

  // Only enable on mobile devices
  const isEnabled = !disabled && isMobile;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isEnabled || refreshing) return;
    
    // Only allow pull to refresh from the top of the page
    if (window.scrollY > 5) return;
    
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isEnabled || !isPulling || refreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    // Only pull down, not up
    if (diff > 0) {
      // Apply resistance factor to make it harder to pull
      const resistance = 0.4;
      const newPullY = Math.min(pullDistance * 1.5, diff * resistance);
      setPullY(newPullY);
      
      // Provide light feedback as user pulls
      if (newPullY > pullDistance / 2 && newPullY < pullDistance) {
        hapticFeedback.light();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isEnabled || !isPulling || refreshing) return;
    
    setIsPulling(false);
    
    // If pulled enough, trigger refresh
    if (pullY >= pullDistance) {
      setRefreshing(true);
      hapticFeedback.medium();
      
      try {
        await onRefresh();
        hapticFeedback.success();
      } catch (error) {
        console.error('Refresh error:', error);
        hapticFeedback.error();
      } finally {
        setRefreshing(false);
      }
    }
    
    // Reset pull distance
    setPullY(0);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isEnabled && (
        <div 
          className="absolute left-0 right-0 flex justify-center items-center overflow-hidden transition-all duration-200"
          style={{ 
            height: pullY > 0 ? `${pullY}px` : '0px', 
            top: 0,
            transform: 'translateY(-100%)',
            opacity: Math.min(1, pullY / pullDistance)
          }}
        >
          <div className={`flex items-center justify-center h-10 w-full ${refreshing ? 'opacity-100' : ''}`}>
            <Loader2 
              className={`h-6 w-6 text-primary ${refreshing ? 'animate-spin' : ''}`}
              style={{ 
                transform: !refreshing ? `rotate(${(pullY / pullDistance) * 360}deg)` : 'none' 
              }} 
            />
          </div>
        </div>
      )}
      
      <div 
        style={{ 
          transform: pullY > 0 ? `translateY(${pullY}px)` : 'none',
          transition: !isPulling ? 'transform 0.2s ease-out' : 'none' 
        }}
      >
        {children}
      </div>
      
      {refreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 flex justify-center pt-2 pb-1">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

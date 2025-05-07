
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Platform } from '@/utils/platform';

export interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;  // Added isRefreshing prop
  disabled?: boolean;  // Added disabled prop to allow disabling pull to refresh
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ 
  children, 
  onRefresh,
  isRefreshing: externalRefreshing,
  disabled = false
}) => {
  const [startY, setStartY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  // Threshold to trigger refresh
  const pullThreshold = 80;
  
  // Use external refreshing state if provided
  useEffect(() => {
    if (externalRefreshing !== undefined) {
      setIsRefreshing(externalRefreshing);
    }
  }, [externalRefreshing]);
  
  // Handle pull to refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    // Skip if disabled
    if (disabled) return;
    
    // Only enable pull to refresh if scrolled to top
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    } else {
      setStartY(0);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || isRefreshing || disabled) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    // Add resistance to the pull
    const pullWithResistance = Math.min(distance * 0.4, pullThreshold * 1.5);
    
    setPullDistance(pullWithResistance);
  };
  
  const handleTouchEnd = async () => {
    // Skip if disabled
    if (disabled) return;
    
    // If pulled past threshold, trigger refresh
    if (pullDistance > pullThreshold && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Error refreshing:', error);
      } finally {
        // Only set isRefreshing to false if externalRefreshing is undefined
        if (externalRefreshing === undefined) {
          setIsRefreshing(false);
        }
      }
    }
    
    // Reset pull distance
    setPullDistance(0);
  };
  
  // Animate refresh indicator
  useEffect(() => {
    if (isRefreshing) {
      controls.start({ y: 40, opacity: 1 });
    } else {
      controls.start({ y: 0, opacity: 0 });
    }
  }, [isRefreshing, controls]);
  
  // Only add touch handlers on mobile devices
  const isMobile = Platform.isNative() || Platform.isMobileBrowser?.();
  const touchProps = isMobile && !disabled ? {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  } : {};
  
  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto relative"
      {...touchProps}
    >
      {/* Pull to refresh indicator */}
      <motion.div 
        className="absolute top-0 left-0 right-0 flex justify-center z-10 pointer-events-none"
        initial={{ y: 0, opacity: 0 }}
        animate={controls}
      >
        <div className="bg-quantum-darkBlue/80 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">Refreshing...</span>
        </div>
      </motion.div>
      
      {/* Pull indicator */}
      <motion.div 
        className="absolute top-0 left-0 right-0 flex justify-center z-10 pointer-events-none"
        style={{ 
          y: pullDistance, 
          opacity: pullDistance > 0 ? Math.min(pullDistance / pullThreshold, 1) : 0 
        }}
      >
        <div className="bg-quantum-darkBlue/80 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg">
          <span className="text-sm">
            {pullDistance > pullThreshold ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </motion.div>
      
      {/* Content with padding for pull distance */}
      <motion.div
        style={{ 
          y: isRefreshing ? 40 : pullDistance
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

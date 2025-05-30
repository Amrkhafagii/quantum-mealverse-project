
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { Platform } from '@/utils/platform';

interface OptimizedScrollProps {
  children: React.ReactNode;
  className?: string;
  onScrollEnd?: () => void;
  onPullToRefresh?: () => Promise<void>;
  hapticFeedback?: boolean;
  momentum?: boolean;
  bounces?: boolean;
  showScrollIndicator?: boolean;
}

export const OptimizedScroll: React.FC<OptimizedScrollProps> = ({
  children,
  className,
  onScrollEnd,
  onPullToRefresh,
  hapticFeedback: enableHaptic = true,
  momentum = true,
  bounces = true,
  showScrollIndicator = true
}) => {
  const { isMobile, isPlatformIOS, isPlatformAndroid } = useResponsive();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const startY = useRef<number>(0);

  // Handle scroll events with momentum and haptic feedback
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    
    setScrollPosition(scrollTop);
    setIsScrolling(true);

    // Clear previous timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Set timeout to detect scroll end
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
      
      // Check if scrolled to bottom
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        onScrollEnd?.();
        
        // Haptic feedback when reaching the end
        if (enableHaptic && Platform.isNative()) {
          hapticFeedback.light();
        }
      }
    }, 150);
  }, [onScrollEnd, enableHaptic]);

  // Handle touch events for pull-to-refresh
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!onPullToRefresh || !scrollRef.current) return;
    
    const scrollTop = scrollRef.current.scrollTop;
    if (scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, [onPullToRefresh]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!onPullToRefresh || !scrollRef.current || startY.current === 0) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0 && scrollRef.current.scrollTop === 0) {
      setIsPulling(true);
      setPullDistance(Math.min(diff * 0.5, 100));
      
      // Prevent default scrolling when pulling
      if (diff > 10) {
        e.preventDefault();
      }
    }
  }, [onPullToRefresh]);

  const handleTouchEnd = useCallback(async () => {
    if (!onPullToRefresh || !isPulling) return;
    
    if (pullDistance > 60) {
      // Trigger haptic feedback
      if (enableHaptic && Platform.isNative()) {
        await hapticFeedback.medium();
      }
      
      // Trigger refresh
      await onPullToRefresh();
    }
    
    // Reset pull state
    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
  }, [onPullToRefresh, isPulling, pullDistance, enableHaptic]);

  // Platform-specific scroll styles
  const getScrollStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      overscrollBehavior: bounces ? 'auto' : 'contain',
    };

    if (isPlatformIOS) {
      return {
        ...baseStyles,
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: showScrollIndicator ? 'thin' : 'none',
      } as React.CSSProperties;
    }
    
    if (isPlatformAndroid) {
      return {
        ...baseStyles,
        scrollbarWidth: showScrollIndicator ? 'thin' : 'none',
      } as React.CSSProperties;
    }
    
    return {
      ...baseStyles,
      scrollbarWidth: showScrollIndicator ? 'auto' : 'none',
    } as React.CSSProperties;
  };

  const scrollClassName = cn(
    'overflow-auto',
    momentum && 'scroll-smooth',
    !showScrollIndicator && 'scrollbar-hide',
    isPlatformIOS && 'ios-scroll',
    isPlatformAndroid && 'android-scroll',
    className
  );

  return (
    <div
      ref={scrollRef}
      className={scrollClassName}
      style={getScrollStyles()}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {isPulling && onPullToRefresh && (
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 transition-transform duration-200"
          style={{ transform: `translateX(-50%) translateY(${pullDistance - 40}px)` }}
        >
          <div className={cn(
            'flex items-center justify-center rounded-full bg-background shadow-lg border',
            'w-8 h-8',
            pullDistance > 60 ? 'text-primary' : 'text-muted-foreground'
          )}>
            <div 
              className={cn(
                'w-4 h-4 border-2 border-current rounded-full border-t-transparent',
                pullDistance > 60 ? 'animate-spin' : '',
              )}
              style={{
                transform: `rotate(${pullDistance * 3}deg)`,
              }}
            />
          </div>
        </div>
      )}
      
      {/* Content with pull effect */}
      <div
        style={{
          transform: isPulling ? `translateY(${pullDistance}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
      
      {/* Scroll indicator */}
      {isScrolling && showScrollIndicator && isMobile && (
        <div className="fixed right-2 top-1/2 transform -translate-y-1/2 z-50">
          <div className="w-1 h-16 bg-black/20 rounded-full">
            <div 
              className="w-full bg-primary rounded-full transition-all duration-150"
              style={{
                height: '25%',
                transform: `translateY(${(scrollPosition / (scrollRef.current?.scrollHeight || 1)) * 300}%)`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced button with haptic feedback
interface HapticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection';
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const HapticButton: React.FC<HapticButtonProps> = ({
  children,
  className,
  hapticType = 'medium',
  variant = 'default',
  size = 'md',
  onClick,
  ...props
}) => {
  const { isMobile } = useResponsive();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Provide haptic feedback
    if (Platform.isNative()) {
      await hapticFeedback[hapticType]();
    }
    
    onClick?.(e);
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg'
  };

  const variantClasses = {
    default: 'bg-background border border-input hover:bg-accent',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };

  const buttonClassName = cn(
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    isMobile && 'touch-manipulation active:scale-95',
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  return (
    <button
      className={buttonClassName}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

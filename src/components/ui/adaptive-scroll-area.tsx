
import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { Platform } from '@/utils/platform';

interface AdaptiveScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollArea> {
  overscrollFeedback?: boolean;
  scrollEndFeedback?: boolean;
  scrollbarVisible?: 'auto' | 'always' | 'never';
  momentumScrolling?: boolean;
}

export const AdaptiveScrollArea = React.forwardRef<
  HTMLDivElement,
  AdaptiveScrollAreaProps
>(({
  children,
  className,
  overscrollFeedback = true,
  scrollEndFeedback = true,
  scrollbarVisible = 'auto',
  momentumScrolling = true,
  ...props
}, ref) => {
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  
  // Track scroll position to apply platform-specific behaviors
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const newIsAtTop = scrollTop <= 0;
    const newIsAtBottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 1;
    
    // Update direction
    if (scrollTop > lastScrollTop) {
      setScrollDirection('down');
    } else if (scrollTop < lastScrollTop) {
      setScrollDirection('up');
    }
    
    setLastScrollTop(scrollTop);
    
    // Apply overscroll feedback at boundaries
    if (Platform.isNative() && overscrollFeedback) {
      // Detect if we just reached the top or bottom
      if (newIsAtTop && !isAtTop) {
        hapticFeedback.light();
      }
      
      if (newIsAtBottom && !isAtBottom) {
        hapticFeedback.light();
      }
    }
    
    setIsAtTop(newIsAtTop);
    setIsAtBottom(newIsAtBottom);
  };
  
  // Apply platform-specific scroll styles
  const getScrollStyles = () => {
    const baseStyles = "relative";
    
    if (isPlatformIOS) {
      return cn(
        baseStyles,
        momentumScrolling ? "scroll-smooth" : "",
        scrollbarVisible === 'never' ? "scrollbar-none" : "",
        className
      );
    }
    
    if (isPlatformAndroid) {
      return cn(
        baseStyles,
        scrollbarVisible === 'never' ? "scrollbar-none" : "",
        className
      );
    }
    
    return cn(baseStyles, className);
  };
  
  // Apply CSS custom properties for native-like scroll behaviors
  const getScrollStyle = () => {
    const style: React.CSSProperties = {};
    
    if (isPlatformIOS) {
      // iOS-like bounce effect and momentum
      style.WebkitOverflowScrolling = 'touch';
      
      if (scrollbarVisible === 'always') {
        style.scrollbarWidth = 'thin';
      } else if (scrollbarVisible === 'never') {
        style.scrollbarWidth = 'none';
      }
    }
    
    if (isPlatformAndroid) {
      // Android-like overscroll effect
      style.overscrollBehavior = 'auto';
      
      if (scrollbarVisible === 'always') {
        style.scrollbarWidth = 'thin';
      } else if (scrollbarVisible === 'never') {
        style.scrollbarWidth = 'none';
      }
    }
    
    return style;
  };
  
  return (
    <ScrollArea
      ref={ref}
      className={getScrollStyles()}
      style={getScrollStyle()}
      onScrollCapture={handleScroll}
      {...props}
    >
      {children}
      
      {/* Add top and bottom indicators if needed */}
      {isPlatformIOS && isAtTop && overscrollFeedback && (
        <div className="absolute top-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-b from-background/10 to-transparent z-10" />
      )}
      
      {isPlatformIOS && isAtBottom && overscrollFeedback && (
        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-t from-background/10 to-transparent z-10" />
      )}
    </ScrollArea>
  );
});

AdaptiveScrollArea.displayName = "AdaptiveScrollArea";

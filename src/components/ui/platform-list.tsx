
import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Platform } from '@/utils/platform';
import { useResponsive } from '@/contexts/ResponsiveContext';

export interface PlatformListProps {
  children: React.ReactNode;
  className?: string;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  scrollable?: boolean;
  maxHeight?: string | number;
  isLoading?: boolean;
  showDividers?: boolean;
  pullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
}

export const PlatformList = forwardRef<HTMLDivElement, PlatformListProps>(({
  children,
  className,
  emptyState,
  loadingState,
  scrollable = true,
  maxHeight,
  isLoading = false,
  showDividers = true,
  pullToRefresh = false,
  onRefresh,
}, ref) => {
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Check if list is empty (no children)
  const isEmpty = React.Children.count(children) === 0 && !isLoading;
  
  // Handle pull-to-refresh gesture
  useEffect(() => {
    if (!pullToRefresh || !onRefresh || !scrollAreaRef.current || !isMobile) return;
    
    const scrollArea = scrollAreaRef.current;
    
    const handleTouchStart = (e: TouchEvent) => {
      startY.current = e.touches[0].clientY;
    };
    
    const handleTouchMove = async (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const scrollTop = scrollArea.scrollTop;
      
      // Only trigger when we're at the top of the scroll area
      if (scrollTop <= 0 && touchY - startY.current > 50 && !isRefreshing) {
        setIsRefreshing(true);
        e.preventDefault();
        
        try {
          await onRefresh();
          if (Platform.isNative()) {
            hapticFeedback.success();
          }
        } catch (error) {
          console.error('Error refreshing:', error);
          if (Platform.isNative()) {
            hapticFeedback.error();
          }
        } finally {
          setIsRefreshing(false);
        }
      }
    };
    
    scrollArea.addEventListener('touchstart', handleTouchStart);
    scrollArea.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      scrollArea.removeEventListener('touchstart', handleTouchStart);
      scrollArea.removeEventListener('touchmove', handleTouchMove);
    };
  }, [pullToRefresh, onRefresh, isRefreshing, isMobile]);
  
  // Get platform-specific styles for the list container
  const getListContainerClasses = () => {
    if (isPlatformIOS) {
      return cn(
        "rounded-lg",
        showDividers && "divide-y divide-gray-100",
      );
    }
    
    if (isPlatformAndroid) {
      return cn(
        "rounded-md",
        showDividers && "divide-y divide-gray-200",
      );
    }
    
    return cn(
      "rounded-md",
      showDividers && "divide-y divide-gray-200",
    );
  };
  
  // Platform-specific empty state
  const renderEmptyState = () => {
    if (emptyState) return emptyState;
    
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
        <div className={cn(
          "text-lg font-medium",
          isPlatformIOS ? "text-gray-400" : "",
          isPlatformAndroid ? "text-gray-500" : "",
        )}>
          No items found
        </div>
        <p className="text-sm text-gray-400 mt-1">
          {isPlatformIOS ? "There are no items to display." : 
           isPlatformAndroid ? "No content available." : 
           "No items to display."}
        </p>
      </div>
    );
  };
  
  // Platform-specific loading state
  const renderLoadingState = () => {
    if (loadingState) return loadingState;
    
    return (
      <div className="flex justify-center py-8">
        <div className={cn(
          "animate-spin rounded-full h-6 w-6 border-2",
          isPlatformIOS ? "border-t-blue-500 border-blue-200" : 
          isPlatformAndroid ? "border-t-primary border-primary/20" : 
          "border-t-gray-500 border-gray-200",
        )} />
      </div>
    );
  };
  
  // Conditional rendering based on state
  const renderContent = () => {
    if (isLoading) return renderLoadingState();
    if (isEmpty) return renderEmptyState();
    return children;
  };
  
  // If scrollable, wrap in ScrollArea
  if (scrollable) {
    return (
      <ScrollArea 
        ref={scrollAreaRef}
        className={cn(
          "w-full",
          maxHeight && `max-h-[${maxHeight}]`,
          className
        )}
        style={{ maxHeight: maxHeight }}
      >
        {isRefreshing && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-primary border-primary/20" />
          </div>
        )}
        
        <div className={getListContainerClasses()} ref={ref}>
          {renderContent()}
        </div>
      </ScrollArea>
    );
  }
  
  // Non-scrollable version
  return (
    <div className={cn(getListContainerClasses(), className)} ref={ref}>
      {renderContent()}
    </div>
  );
});

PlatformList.displayName = "PlatformList";

// Platform-specific list item component
export interface PlatformListItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const PlatformListItem = forwardRef<HTMLDivElement, PlatformListItemProps>(({
  children,
  className,
  onClick,
  active = false,
  disabled = false,
  leading,
  trailing,
}, ref) => {
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
  
  // Get platform-specific styles for the list item
  const getItemClasses = () => {
    const baseClasses = "flex items-center w-full";
    
    if (isPlatformIOS) {
      return cn(
        baseClasses,
        "min-h-[44px] px-4 py-3",
        onClick && !disabled && "cursor-pointer active:bg-gray-50",
        active && "bg-gray-100",
        disabled && "opacity-50 cursor-default",
      );
    }
    
    if (isPlatformAndroid) {
      return cn(
        baseClasses,
        "min-h-[48px] px-4 py-3",
        onClick && !disabled && "cursor-pointer active:bg-gray-100",
        active && "bg-gray-50",
        disabled && "opacity-60 cursor-default",
      );
    }
    
    return cn(
      baseClasses,
      "min-h-[40px] px-3 py-2",
      onClick && !disabled && "cursor-pointer hover:bg-gray-100 transition-colors",
      active && "bg-gray-50",
      disabled && "opacity-70 cursor-default",
    );
  };
  
  // Handle click with haptic feedback on native platforms
  const handleClick = () => {
    if (disabled || !onClick) return;
    
    // Provide haptic feedback on native platforms
    if (Platform.isNative()) {
      hapticFeedback.selection();
    }
    
    onClick();
  };
  
  return (
    <div
      ref={ref}
      className={cn(getItemClasses(), className)}
      onClick={handleClick}
      role={onClick && !disabled ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
    >
      {leading && (
        <div className="mr-4 flex-shrink-0">
          {leading}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        {children}
      </div>
      
      {trailing && (
        <div className="ml-4 flex-shrink-0">
          {trailing}
        </div>
      )}
      
      {isPlatformIOS && onClick && !disabled && !trailing && (
        <div className="ml-2 text-gray-400">
          <svg width="6" height="12" viewBox="0 0 6 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.75 0.75L5.25 6L0.75 11.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
});

PlatformListItem.displayName = "PlatformListItem";

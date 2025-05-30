import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/responsive/core/ResponsiveContext';

export interface PlatformListItemProps {
  children: React.ReactNode;
  className?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  divider?: boolean;
  disabled?: boolean;
  selected?: boolean;
  highlightOnHover?: boolean;
  onClick?: () => void;
  secondaryAction?: React.ReactNode;
}

export const PlatformListItem = forwardRef<HTMLDivElement, PlatformListItemProps>(
  ({ 
    children, 
    className,
    leading,
    trailing,
    divider = true,
    disabled = false,
    selected = false,
    highlightOnHover = true,
    onClick,
    secondaryAction
  }, ref) => {
    const { isPlatformIOS, isPlatformAndroid } = useResponsive();
    const [isPressed, setIsPressed] = useState(false);
    
    // Determine platform-specific styles
    const getStyles = () => {
      const baseStyles = "flex items-center justify-between p-3 relative transition-colors";
      const interactiveStyles = onClick && !disabled && highlightOnHover ? 
        "cursor-pointer" : "";
      
      const pressedStyles = isPressed ? 
        isPlatformIOS ? "bg-gray-100" : 
        isPlatformAndroid ? "bg-gray-100" : 
        "bg-accent/50" : "";
      
      const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";
      
      const selectedStyles = selected ? 
        isPlatformIOS ? "bg-blue-50" : 
        isPlatformAndroid ? "bg-primary/10" : 
        "bg-accent" : "";
      
      const dividerStyles = divider ? 
        isPlatformIOS ? "border-b border-gray-200" : 
        isPlatformAndroid ? "border-b border-gray-100" : 
        "border-b border-border" : "";
        
      return cn(
        baseStyles,
        interactiveStyles,
        pressedStyles,
        disabledStyles,
        selectedStyles,
        dividerStyles,
        className
      );
    };
    
    const handleMouseDown = () => {
      if (disabled || !onClick) return;
      setIsPressed(true);
    };
    
    const handleMouseUp = () => {
      if (disabled || !onClick) return;
      setIsPressed(false);
    };
    
    const handleClick = () => {
      if (disabled || !onClick) return;
      
      // Provide haptic feedback on native platforms
      if (Platform.isNative()) {
        hapticFeedback.selection();
      }
      
      onClick();
    };
    
    // Handle touch events for mobile
    const handleTouchStart = () => {
      if (disabled || !onClick) return;
      setIsPressed(true);
    };
    
    const handleTouchEnd = () => {
      if (disabled || !onClick) return;
      setIsPressed(false);
      
      // Provide haptic feedback on native platforms
      if (Platform.isNative()) {
        hapticFeedback.selection();
      }
      
      onClick();
    };

    return (
      <div 
        ref={ref}
        className={getStyles()}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role={onClick ? "button" : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        aria-disabled={disabled}
      >
        {/* Leading element (icon, avatar, etc.) */}
        {leading && (
          <div className="mr-4 flex-shrink-0">
            {leading}
          </div>
        )}
        
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
        
        {/* Trailing element (chevron, switch, etc.) */}
        {trailing && (
          <div className="ml-4 flex-shrink-0">
            {trailing}
          </div>
        )}
        
        {/* Secondary action (e.g., delete button) */}
        {secondaryAction && (
          <div className="ml-2 flex-shrink-0">
            {secondaryAction}
          </div>
        )}
      </div>
    );
  }
);

PlatformListItem.displayName = 'PlatformListItem';

export interface PlatformListProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  scrollable?: boolean;
  inset?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const PlatformList = forwardRef<HTMLDivElement, PlatformListProps>(
  ({ 
    children, 
    className,
    style,
    scrollable = true,
    inset = false,
    header,
    footer
  }, ref) => {
    const { isPlatformIOS, isPlatformAndroid } = useResponsive();
    const listRef = useRef<HTMLDivElement | null>(null);
    
    // Merge ref
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(listRef.current);
        } else {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = listRef.current;
        }
      }
    }, [ref]);
    
    // Platform-specific list styles
    const getListStyles = () => {
      const baseStyles = "w-full";
      
      const platformStyles = isPlatformIOS ? 
        "rounded-xl overflow-hidden bg-white border border-gray-200" : 
        isPlatformAndroid ? 
        "rounded-md overflow-hidden bg-white" : 
        "rounded-md overflow-hidden bg-background border border-border";
      
      const insetStyles = inset ? "mx-4" : "";
        
      return cn(baseStyles, platformStyles, insetStyles, className);
    };
    
    // Handle scroll to reveal iOS-style effects if needed
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      if (isPlatformIOS) {
        const target = e.currentTarget;
        const isAtTop = target.scrollTop === 0;
        const isAtBottom = target.scrollHeight - target.scrollTop === target.clientHeight;
        
        // Could add shadow effects or other visual indicators here
        if (isAtTop || isAtBottom) {
          hapticFeedback.light();
        }
      }
    };
    
    const content = (
      <>
        {header && (
          <div className={cn(
            "px-4 py-2 text-sm font-medium",
            isPlatformIOS ? "text-gray-500 uppercase" : 
            isPlatformAndroid ? "text-primary" : 
            "text-muted-foreground"
          )}>
            {header}
          </div>
        )}
        
        <div 
          className="divide-y divide-border"
          ref={listRef} 
          style={style}
        >
          {children}
        </div>
        
        {footer && (
          <div className={cn(
            "px-4 py-2 text-sm",
            isPlatformIOS ? "text-gray-500" : 
            isPlatformAndroid ? "text-gray-600" : 
            "text-muted-foreground"
          )}>
            {footer}
          </div>
        )}
      </>
    );
    
    // Use ScrollArea for scrollable lists
    if (scrollable) {
      return (
        <div className={getListStyles()}>
          <ScrollArea className="w-full h-full" onScrollCapture={handleScroll}>
            {content}
          </ScrollArea>
        </div>
      );
    }
    
    // Regular non-scrollable list
    return (
      <div className={getListStyles()}>
        {content}
      </div>
    );
  }
);

PlatformList.displayName = 'PlatformList';


import React from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';

interface PlatformTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

interface PlatformTabBarProps {
  items: PlatformTabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

const getTabBarClasses = (isPlatformIOS: boolean, isPlatformAndroid: boolean) => {
  let classes = 'flex w-full border-t border-border bg-background';
  
  if (isPlatformIOS) {
    classes += ' h-20 pb-safe-bottom';
  } else if (isPlatformAndroid) {
    classes += ' h-16 shadow-lg';
  } else {
    classes += ' h-16';
  }
  
  return classes;
};

const getTabItemClasses = (
  isActive: boolean, 
  disabled: boolean, 
  variant: string, 
  isPlatformIOS: boolean
) => {
  let classes = 'flex-1 flex flex-col items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2';
  
  if (disabled) {
    classes += ' opacity-50 cursor-not-allowed';
  } else {
    classes += ' cursor-pointer';
  }
  
  if (variant === 'pills') {
    classes += isActive 
      ? ' bg-primary text-primary-foreground rounded-lg mx-1' 
      : ' hover:bg-muted rounded-lg mx-1';
  } else if (variant === 'underline') {
    classes += isActive 
      ? ' text-primary border-b-2 border-primary' 
      : ' text-muted-foreground hover:text-foreground';
  } else {
    // Default variant
    if (isPlatformIOS) {
      classes += isActive 
        ? ' text-primary' 
        : ' text-muted-foreground';
    } else {
      classes += isActive 
        ? ' text-primary bg-primary/10' 
        : ' text-muted-foreground hover:text-foreground hover:bg-muted';
    }
  }
  
  return classes;
};

export const PlatformTabBar: React.FC<PlatformTabBarProps> = ({
  items,
  activeTab,
  onTabChange,
  className,
  variant = 'default'
}) => {
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();

  const handleTabClick = (tabId: string, disabled: boolean) => {
    if (!disabled) {
      onTabChange(tabId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, tabId: string, disabled: boolean) => {
    if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
      event.preventDefault();
      onTabChange(tabId);
    }
  };

  return (
    <nav 
      className={cn(getTabBarClasses(isPlatformIOS, isPlatformAndroid), className)}
      role="tablist"
      aria-label="Main navigation"
    >
      {items.map((item, index) => {
        const isActive = item.id === activeTab;
        
        return (
          <button
            key={item.id}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive}
            aria-controls={`tabpanel-${item.id}`}
            aria-disabled={item.disabled}
            className={getTabItemClasses(isActive, !!item.disabled, variant, isPlatformIOS)}
            onClick={() => handleTabClick(item.id, !!item.disabled)}
            onKeyDown={(e) => handleKeyDown(e, item.id, !!item.disabled)}
          >
            <div className="relative flex flex-col items-center gap-1">
              {item.icon && (
                <div className={cn(
                  "transition-colors",
                  isMobile ? "text-base" : "text-lg"
                )}>
                  {item.icon}
                </div>
              )}
              
              <span className={cn(
                "text-xs font-medium leading-none",
                isMobile ? "text-[10px]" : "text-xs"
              )}>
                {item.label}
              </span>
              
              {item.badge && item.badge > 0 && (
                <span 
                  className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full flex items-center justify-center px-1"
                  aria-label={`${item.badge} notifications`}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
};

export default PlatformTabBar;

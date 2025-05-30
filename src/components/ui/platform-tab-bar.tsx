
import React from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any> | React.ReactNode;
  content?: React.ReactNode;
  badge?: number;
  badgeCount?: number;
  disabled?: boolean;
}

interface PlatformTabBarProps {
  tabs: TabItem[];
  value: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  position?: 'top' | 'bottom';
  fullWidth?: boolean;
  showIcons?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  tabsListClassName?: string;
}

const getTabBarClasses = (isPlatformIOS: boolean, isPlatformAndroid: boolean, position?: string) => {
  let classes = 'flex w-full';
  
  if (position === 'bottom') {
    classes += ' border-t border-border bg-background';
    if (isPlatformIOS) {
      classes += ' h-20 pb-safe-bottom';
    } else if (isPlatformAndroid) {
      classes += ' h-16 shadow-lg';
    } else {
      classes += ' h-16';
    }
  } else {
    classes += ' border-b border-border bg-background h-12';
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
  tabs,
  value,
  onChange,
  className,
  variant = 'default',
  position = 'top',
  fullWidth = false,
  showIcons = true,
  showLabels = true,
  animated = true,
  tabsListClassName
}) => {
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();

  const handleTabClick = (tabId: string, disabled: boolean) => {
    if (!disabled) {
      onChange(tabId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, tabId: string, disabled: boolean) => {
    if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
      event.preventDefault();
      onChange(tabId);
    }
  };

  // If tabs have content, render as tabs with content panels
  const hasContent = tabs.some(tab => tab.content);

  if (hasContent) {
    const activeTab = tabs.find(tab => tab.id === value);
    
    return (
      <div className={cn('w-full', className)}>
        <nav 
          className={cn(getTabBarClasses(isPlatformIOS, isPlatformAndroid, position), tabsListClassName)}
          role="tablist"
          aria-label="Main navigation"
        >
          {tabs.map((tab, index) => {
            const isActive = tab.id === value;
            const badgeCount = tab.badge || tab.badgeCount;
            const IconComponent = tab.icon;
            
            return (
              <button
                key={tab.id}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                aria-disabled={tab.disabled}
                className={getTabItemClasses(isActive, !!tab.disabled, variant, isPlatformIOS)}
                onClick={() => handleTabClick(tab.id, !!tab.disabled)}
                onKeyDown={(e) => handleKeyDown(e, tab.id, !!tab.disabled)}
              >
                <div className="relative flex flex-col items-center gap-1">
                  {showIcons && IconComponent && (
                    <div className={cn(
                      "transition-colors",
                      isMobile ? "text-base" : "text-lg"
                    )}>
                      {React.isValidElement(IconComponent) ? 
                        IconComponent : 
                        React.createElement(IconComponent as React.ComponentType<any>)
                      }
                    </div>
                  )}
                  
                  {showLabels && (
                    <span className={cn(
                      "text-xs font-medium leading-none",
                      isMobile ? "text-[10px]" : "text-xs"
                    )}>
                      {tab.label}
                    </span>
                  )}
                  
                  {badgeCount && badgeCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full flex items-center justify-center px-1"
                      aria-label={`${badgeCount} notifications`}
                    >
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
        
        {activeTab?.content && (
          <div
            id={`tabpanel-${activeTab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab.id}`}
            className={cn("w-full", animated && "animate-in fade-in-50 duration-200")}
          >
            {activeTab.content}
          </div>
        )}
      </div>
    );
  }

  // Simple tab bar without content panels
  return (
    <nav 
      className={cn(getTabBarClasses(isPlatformIOS, isPlatformAndroid, position), tabsListClassName, className)}
      role="tablist"
      aria-label="Main navigation"
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === value;
        const badgeCount = tab.badge || tab.badgeCount;
        const IconComponent = tab.icon;
        
        return (
          <button
            key={tab.id}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            aria-disabled={tab.disabled}
            className={getTabItemClasses(isActive, !!tab.disabled, variant, isPlatformIOS)}
            onClick={() => handleTabClick(tab.id, !!tab.disabled)}
            onKeyDown={(e) => handleKeyDown(e, tab.id, !!tab.disabled)}
          >
            <div className="relative flex flex-col items-center gap-1">
              {showIcons && IconComponent && (
                <div className={cn(
                  "transition-colors",
                  isMobile ? "text-base" : "text-lg"
                )}>
                  {React.isValidElement(IconComponent) ? 
                    IconComponent : 
                    React.createElement(IconComponent as React.ComponentType<any>)
                  }
                </div>
              )}
              
              {showLabels && (
                <span className={cn(
                  "text-xs font-medium leading-none",
                  isMobile ? "text-[10px]" : "text-xs"
                )}>
                  {tab.label}
                </span>
              )}
              
              {badgeCount && badgeCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full flex items-center justify-center px-1"
                  aria-label={`${badgeCount} notifications`}
                >
                  {badgeCount > 99 ? '99+' : badgeCount}
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

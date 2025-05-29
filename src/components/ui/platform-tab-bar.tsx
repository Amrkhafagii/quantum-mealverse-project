
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Platform } from '@/utils/platform';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { LucideIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  content: React.ReactNode;
  disabled?: boolean;
  badgeCount?: number;
}

export interface PlatformTabBarProps {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  tabsListClassName?: string;
  position?: 'top' | 'bottom';
  fullWidth?: boolean;
  variant?: 'default' | 'ios' | 'android' | 'segmented';
  showIcons?: boolean;
  showLabels?: boolean;
  animated?: boolean;
}

export function PlatformTabBar({
  tabs,
  defaultValue,
  value,
  onChange,
  className,
  tabsListClassName,
  position = 'top',
  fullWidth = true,
  variant = 'default',
  showIcons = true,
  showLabels = true,
  animated = true,
}: PlatformTabBarProps) {
  const { isPlatformIOS, isPlatformAndroid, isMobile, isTablet } = useResponsive();
  const [activeTab, setActiveTab] = useState(value || defaultValue || tabs[0]?.id);
  const [prevActiveTab, setPrevActiveTab] = useState<string | undefined>(undefined);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('right');
  
  // Use the user-provided variant or derive from platform if default
  const effectiveVariant = variant === 'default'
    ? isPlatformIOS ? 'ios' : isPlatformAndroid ? 'android' : 'default'
    : variant;
  
  // Update active tab when value prop changes
  useEffect(() => {
    if (value !== undefined && value !== activeTab) {
      // Determine animation direction
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      const newIndex = tabs.findIndex(tab => tab.id === value);
      
      if (currentIndex !== -1 && newIndex !== -1) {
        setAnimationDirection(newIndex > currentIndex ? 'right' : 'left');
      }
      
      setPrevActiveTab(activeTab);
      setActiveTab(value);
    }
  }, [value, activeTab, tabs]);

  // Get platform-specific styles for the tabs list
  const getTabsListClasses = () => {
    const baseClasses = cn(
      "w-full relative",
      position === 'bottom' ? "order-1" : "order-0"
    );
    
    // Mobile-specific styling for better touch targets
    if (isMobile) {
      return cn(
        baseClasses,
        "flex overflow-x-auto scrollbar-hide touch-pan-x",
        effectiveVariant === 'ios' && "bg-white/10 backdrop-blur-lg rounded-lg p-1",
        effectiveVariant === 'android' && "bg-surface/50 border-b border-border",
        !effectiveVariant.includes('ios') && !effectiveVariant.includes('android') && "bg-background/80 backdrop-blur-sm"
      );
    }
    
    // Tablet and desktop styling
    return cn(
      baseClasses,
      fullWidth && "grid",
      fullWidth && `grid-cols-${Math.min(tabs.length, isTablet ? 4 : 6)}`,
      effectiveVariant === 'ios' && "bg-white/10 backdrop-blur-lg rounded-lg p-1",
      effectiveVariant === 'android' && "bg-surface/50 border-b border-border",
      !effectiveVariant.includes('ios') && !effectiveVariant.includes('android') && "bg-background/80 backdrop-blur-sm"
    );
  };
  
  // Get platform-specific styles for the tab trigger
  const getTabTriggerClasses = (tabId: string) => {
    const isActive = tabId === activeTab;
    
    // Base mobile classes with proper touch targets
    const mobileClasses = cn(
      "flex-shrink-0 min-w-[80px] px-3 py-2 flex flex-col items-center justify-center",
      "touch-manipulation select-none cursor-pointer transition-all duration-200",
      "active:scale-95 hover:bg-white/5"
    );
    
    // Base desktop classes
    const desktopClasses = cn(
      "flex items-center justify-center gap-2 px-4 py-3",
      "transition-all duration-200 hover:bg-white/5"
    );
    
    const classes = isMobile ? mobileClasses : desktopClasses;
    
    switch (effectiveVariant) {
      case 'ios':
        return cn(
          classes,
          isActive 
            ? "text-blue-500 bg-white/20 rounded-md" 
            : "text-gray-400 hover:text-white"
        );
      case 'android':
        return cn(
          classes,
          isActive 
            ? "text-primary relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-8 after:h-0.5 after:bg-primary" 
            : "text-gray-400 hover:text-white"
        );
      case 'segmented':
        return cn(
          classes,
          "rounded-md",
          isActive 
            ? "bg-white shadow-sm text-black" 
            : "bg-transparent text-gray-400 hover:text-white"
        );
      default:
        return cn(
          classes,
          isActive 
            ? "text-white bg-white/10 rounded-md" 
            : "text-gray-400 hover:text-white"
        );
    }
  };
  
  // Handle tab change with haptic feedback
  const handleTabChange = (value: string) => {
    if (value === activeTab) return;
    
    // Determine animation direction
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const newIndex = tabs.findIndex(tab => tab.id === value);
    
    if (currentIndex !== -1 && newIndex !== -1) {
      setAnimationDirection(newIndex > currentIndex ? 'right' : 'left');
    }
    
    // Provide haptic feedback on native platforms
    if (Platform.isNative()) {
      hapticFeedback.selection();
    }
    
    setPrevActiveTab(activeTab);
    setActiveTab(value);
    if (onChange) onChange(value);
  };
  
  // Get animation classes for the content
  const getAnimationClasses = () => {
    if (!animated) return "";
    
    if (animationDirection === 'right') {
      return "animate-in slide-in-from-right duration-300";
    } else {
      return "animate-in slide-in-from-left duration-300";
    }
  };
  
  // Render tab badge if count exists
  const renderBadge = (count?: number) => {
    if (count === undefined || count === 0) return null;
    
    return (
      <div className={cn(
        "absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs",
        count > 99 ? "min-w-[20px] h-[20px]" : "min-w-[16px] h-[16px]"
      )}>
        {count > 99 ? '99+' : count}
      </div>
    );
  };
  
  // Render tab content
  const renderTabContent = (tab: TabItem) => (
    <div className="relative">
      {showIcons && tab.icon && (
        <tab.icon className={cn(
          "mx-auto transition-colors duration-200",
          showLabels ? "mb-1 h-4 w-4" : "h-5 w-5",
          isMobile && showLabels ? "h-4 w-4" : ""
        )} />
      )}
      {renderBadge(tab.badgeCount)}
      {showLabels && (
        <span className={cn(
          "text-xs font-medium transition-colors duration-200",
          isMobile ? "block mt-1" : "ml-2",
          effectiveVariant === 'ios' && "font-medium",
          effectiveVariant === 'android' && "font-normal"
        )}>
          {isMobile ? tab.label.split(' ')[0] : tab.label}
        </span>
      )}
    </div>
  );
  
  return (
    <Tabs
      defaultValue={defaultValue || tabs[0]?.id}
      value={activeTab}
      onValueChange={handleTabChange}
      className={cn(
        "flex flex-col w-full",
        position === 'bottom' ? "flex-col-reverse" : "flex-col",
        className
      )}
    >
      {/* Tab List */}
      {isMobile ? (
        <ScrollArea className="w-full">
          <TabsList className={cn(getTabsListClasses(), tabsListClassName)}>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={tab.disabled}
                className={getTabTriggerClasses(tab.id)}
                onClick={() => handleTabChange(tab.id)}
              >
                {renderTabContent(tab)}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
      ) : (
        <TabsList className={cn(getTabsListClasses(), tabsListClassName)}>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className={getTabTriggerClasses(tab.id)}
              onClick={() => handleTabChange(tab.id)}
            >
              {renderTabContent(tab)}
            </TabsTrigger>
          ))}
        </TabsList>
      )}
      
      {/* Tab Content */}
      <div className={cn("flex-1 overflow-hidden", isMobile ? "px-2" : "px-0")}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "h-full overflow-y-auto",
              tab.id === activeTab ? "block" : "hidden",
              tab.id === activeTab && prevActiveTab ? getAnimationClasses() : ""
            )}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </Tabs>
  );
}

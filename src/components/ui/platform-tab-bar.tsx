
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
      "w-full relative flex",
      position === 'bottom' ? "order-1" : "order-0"
    );
    
    // Remove complex grid calculations and use flexbox with proper scrolling
    const scrollClasses = isMobile 
      ? "overflow-x-auto scrollbar-hide" 
      : fullWidth ? "justify-start" : "justify-center";
    
    return cn(
      baseClasses,
      scrollClasses,
      effectiveVariant === 'ios' && "bg-white/10 backdrop-blur-lg rounded-lg p-1",
      effectiveVariant === 'android' && "bg-surface/50 border-b border-border",
      !effectiveVariant.includes('ios') && !effectiveVariant.includes('android') && "bg-background/80 backdrop-blur-sm"
    );
  };
  
  // Get platform-specific styles for the tab trigger with proper touch targets
  const getTabTriggerClasses = (tabId: string) => {
    const isActive = tabId === activeTab;
    
    // Platform-specific minimum touch target heights
    const minHeight = isPlatformIOS ? 'min-h-[44px]' : 'min-h-[48px]';
    
    // Base classes with proper touch targets and spacing
    const baseClasses = cn(
      "flex-shrink-0 flex items-center justify-center gap-2",
      "touch-manipulation select-none cursor-pointer transition-all duration-200",
      "active:scale-95 hover:bg-white/5",
      minHeight,
      // Better spacing for different configurations
      showIcons && showLabels ? "px-3 py-2" : "px-4 py-3",
      // Minimum width to prevent cramping
      isMobile ? "min-w-[80px]" : "min-w-[100px]"
    );
    
    switch (effectiveVariant) {
      case 'ios':
        return cn(
          baseClasses,
          isActive 
            ? "text-blue-500 bg-white/20 rounded-md" 
            : "text-gray-400 hover:text-white"
        );
      case 'android':
        return cn(
          baseClasses,
          isActive 
            ? "text-primary relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-8 after:h-0.5 after:bg-primary" 
            : "text-gray-400 hover:text-white"
        );
      case 'segmented':
        return cn(
          baseClasses,
          "rounded-md",
          isActive 
            ? "bg-white shadow-sm text-black" 
            : "bg-transparent text-gray-400 hover:text-white"
        );
      default:
        return cn(
          baseClasses,
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
  
  // Render tab content with improved text handling
  const renderTabContent = (tab: TabItem) => (
    <div className="relative flex items-center justify-center">
      {showIcons && tab.icon && (
        <tab.icon className={cn(
          "transition-colors duration-200 flex-shrink-0",
          showLabels ? "h-4 w-4" : "h-5 w-5",
          showLabels && "mr-2"
        )} />
      )}
      {renderBadge(tab.badgeCount)}
      {showLabels && (
        <span className={cn(
          "font-medium transition-colors duration-200 truncate",
          isMobile ? "text-xs" : "text-sm",
          effectiveVariant === 'ios' && "font-medium",
          effectiveVariant === 'android' && "font-normal"
        )}>
          {/* Truncate long labels on mobile for better fit */}
          {isMobile && tab.label.length > 8 
            ? `${tab.label.substring(0, 6)}...` 
            : tab.label}
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
      {/* Tab List with improved scrolling */}
      <div className="w-full overflow-hidden">
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
      </div>
      
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

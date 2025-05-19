
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Platform } from '@/utils/platform';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { LucideIcon } from 'lucide-react';

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
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();
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
      "w-full",
      position === 'bottom' ? "order-1" : "order-0",
      fullWidth && "grid",
      fullWidth && `grid-cols-${tabs.length}`
    );
    
    switch (effectiveVariant) {
      case 'ios':
        return cn(
          baseClasses,
          position === 'bottom' && "border-t border-gray-200 bg-white/80 backdrop-blur-lg pb-safe",
          position === 'top' && "bg-white/80 backdrop-blur-lg pt-safe",
          "h-14"
        );
      case 'android':
        return cn(
          baseClasses,
          position === 'bottom' && "border-t border-gray-100 bg-white pb-safe",
          position === 'top' && "bg-white pt-safe shadow-sm",
          "h-16"
        );
      case 'segmented':
        return cn(
          baseClasses,
          "bg-gray-100 p-1 rounded-lg h-auto"
        );
      default:
        return baseClasses;
    }
  };
  
  // Get platform-specific styles for the tab trigger
  const getTabTriggerClasses = (tabId: string) => {
    const isActive = tabId === activeTab;
    
    switch (effectiveVariant) {
      case 'ios':
        return cn(
          "flex flex-col items-center justify-center py-1 h-full",
          isActive ? "text-blue-500" : "text-gray-500"
        );
      case 'android':
        return cn(
          "flex flex-col items-center justify-center py-1 h-full",
          isActive 
            ? "text-primary relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-8 after:h-0.5 after:bg-primary" 
            : "text-gray-500"
        );
      case 'segmented':
        return cn(
          "py-1.5 px-3 rounded-md",
          isActive 
            ? "bg-white shadow-sm text-black" 
            : "bg-transparent text-gray-600"
        );
      default:
        return "";
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
      return "animate-in slide-in-from-right";
    } else {
      return "animate-in slide-in-from-left";
    }
  };
  
  // Render tab badge if count exists
  const renderBadge = (count?: number) => {
    if (count === undefined || count === 0) return null;
    
    return (
      <div className={cn(
        "absolute top-0 right-0 -mt-1 -mr-1 flex items-center justify-center rounded-full bg-red-500 text-white",
        count > 99 ? "min-w-[22px] h-[22px] text-xs" : "min-w-[18px] h-[18px] text-xs"
      )}>
        {count > 99 ? '99+' : count}
      </div>
    );
  };
  
  return (
    <Tabs
      defaultValue={defaultValue || tabs[0]?.id}
      value={activeTab}
      onValueChange={handleTabChange}
      className={cn(
        "flex flex-col",
        position === 'bottom' ? "flex-col-reverse" : "flex-col",
        className
      )}
    >
      <TabsList className={cn(getTabsListClasses(), tabsListClassName)}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className={getTabTriggerClasses(tab.id)}
            onClick={() => handleTabChange(tab.id)}
          >
            <div className="relative">
              {showIcons && tab.icon && (
                <tab.icon className={cn(
                  "mx-auto",
                  showLabels ? "mb-1 h-5 w-5" : "h-6 w-6",
                  tab.id === activeTab 
                    ? effectiveVariant === 'ios' ? "text-blue-500" : "text-primary" 
                    : "text-gray-500"
                )} />
              )}
              {renderBadge(tab.badgeCount)}
            </div>
            {showLabels && (
              <span className={cn(
                "text-xs",
                effectiveVariant === 'ios' && "font-medium",
                effectiveVariant === 'android' && "font-normal"
              )}>
                {tab.label}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <div className={cn("flex-1 overflow-hidden")}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "h-full",
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

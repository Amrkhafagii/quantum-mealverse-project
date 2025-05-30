
import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/responsive/core/ResponsiveContext';
import { Badge } from '@/components/ui/badge';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badgeCount?: number;
  content?: React.ReactNode;
}

export interface PlatformTabBarProps {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  position?: 'top' | 'bottom';
  fullWidth?: boolean;
  showIcons?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  className?: string;
  tabsListClassName?: string;
}

export const PlatformTabBar: React.FC<PlatformTabBarProps> = ({
  tabs,
  value,
  defaultValue,
  activeTab: propActiveTab,
  onChange,
  onTabChange,
  variant = 'default',
  position = 'top',
  fullWidth = true,
  showIcons = true,
  showLabels = true,
  animated = true,
  className,
  tabsListClassName,
}) => {
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState(value || defaultValue || propActiveTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
    onTabChange?.(tabId);
  };

  const getTabBarStyles = () => {
    const baseStyles = "flex border-b border-border";
    
    if (isPlatformIOS) {
      return cn(baseStyles, "bg-background/80 backdrop-blur-md");
    } else if (isPlatformAndroid) {
      return cn(baseStyles, "bg-background shadow-sm");
    }
    
    return cn(baseStyles, "bg-background");
  };

  const getTabStyles = (isActive: boolean) => {
    const baseStyles = "flex items-center justify-center p-3 cursor-pointer transition-colors";
    
    if (isPlatformIOS) {
      return cn(
        baseStyles,
        isActive ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"
      );
    } else if (isPlatformAndroid) {
      return cn(
        baseStyles,
        isActive ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
      );
    }
    
    return cn(
      baseStyles,
      isActive ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
    );
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(getTabBarStyles(), tabsListClassName)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          
          return (
            <div
              key={tab.id}
              className={cn(
                getTabStyles(isActive),
                fullWidth && "flex-1"
              )}
              onClick={() => handleTabChange(tab.id)}
            >
              <div className="flex items-center space-x-2">
                {showIcons && Icon && (
                  <Icon className="h-5 w-5" />
                )}
                {showLabels && (
                  <span className="text-sm font-medium">{tab.label}</span>
                )}
                {tab.badgeCount && tab.badgeCount > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
                    {tab.badgeCount}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {activeTabContent && (
        <div className={cn(
          "w-full",
          animated && "transition-all duration-200 ease-in-out"
        )}>
          {activeTabContent}
        </div>
      )}
    </div>
  );
};

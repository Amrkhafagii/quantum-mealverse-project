import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useResponsive } from '@/responsive/core/ResponsiveContext';

interface PlatformTabBarProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: "default" | "secondary" | "outline" | "ghost";
}

export const PlatformTabBar: React.FC<PlatformTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = "default",
  ...props
}) => {
  const { isMobile } = useResponsive();

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <div className="flex space-x-2 mb-4">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? variant : "outline"}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { Platform } from '@/utils/platform';
import { TabsList, TabsTrigger, Tabs, TabsContent } from '../ui/tabs';
import { Separator } from '../ui/separator';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export interface PlatformLayoutProps {
  sections: Section[];
  defaultActive?: string;
  onActiveChange?: (active: string) => void;
  className?: string;
  layoutType?: 'auto' | 'stack' | 'tabs' | 'split' | 'tabBar';
}

const PlatformLayout: React.FC<PlatformLayoutProps> = ({
  sections,
  defaultActive,
  onActiveChange,
  className = '',
  layoutType = 'auto'
}) => {
  const [active, setActive] = useState(defaultActive || (sections[0]?.id || ''));
  const { orientation } = useDeviceOrientation();
  const isMobile = Platform.isMobile();
  const isTablet = Platform.isTablet();
  
  // Determine the most appropriate layout type based on device and orientation
  const getLayoutType = () => {
    if (layoutType !== 'auto') {
      return layoutType;
    }
    
    // Mobile in portrait mode
    if (isMobile && orientation === 'portrait') {
      return 'stack';
    }
    
    // Mobile in landscape mode
    if (isMobile && orientation === 'landscape') {
      return 'tabs';
    }
    
    // Tablet or desktop
    if (isTablet || !isMobile) {
      return 'split';
    }
    
    // Default fallback
    return 'stack';
  };
  
  const effectiveLayoutType = getLayoutType();
  
  // Handle active section change
  const handleActiveChange = (newActive: string) => {
    setActive(newActive);
    if (onActiveChange) {
      onActiveChange(newActive);
    }
  };
  
  // Update active section if defaultActive changes
  useEffect(() => {
    if (defaultActive) {
      setActive(defaultActive);
    }
  }, [defaultActive]);
  
  // Stack Layout (mobile portrait)
  if (effectiveLayoutType === 'stack') {
    return (
      <div className={`platform-layout platform-stack ${className}`}>
        {sections.map((section) => {
          const isActiveSection = section.id === active;
          
          return (
            <div key={section.id} className={`section ${isActiveSection ? 'block' : 'hidden'}`}>
              {section.content}
            </div>
          );
        })}
        
        <div className="platform-nav fixed bottom-0 left-0 right-0 bg-background border-t z-10 flex justify-around p-2">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`flex flex-col items-center p-2 rounded-md transition-colors ${
                section.id === active 
                  ? 'text-primary bg-muted' 
                  : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
              }`}
              onClick={() => handleActiveChange(section.id)}
            >
              <div className="mb-1">{section.icon}</div>
              <span className="text-xs">{section.title}</span>
            </button>
          ))}
        </div>
        
        <div className="pb-16">
          {/* Space for bottom nav */}
        </div>
      </div>
    );
  }
  
  // Tabs Layout (standard tabs)
  if (effectiveLayoutType === 'tabs') {
    return (
      <Tabs 
        value={active} 
        onValueChange={handleActiveChange}
        className={`platform-layout platform-tabs ${className}`}
      >
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          {sections.map((section) => (
            <TabsTrigger 
              key={section.id} 
              value={section.id}
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none py-2 px-4"
            >
              <div className="flex items-center space-x-2">
                {section.icon && <span>{section.icon}</span>}
                <span>{section.title}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="mt-2">
            {section.content}
          </TabsContent>
        ))}
      </Tabs>
    );
  }
  
  // Split Layout (master-detail)
  if (effectiveLayoutType === 'split') {
    return (
      <div className={`platform-layout platform-split grid grid-cols-12 gap-4 ${className}`}>
        <div className="col-span-3 border-r pr-4">
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`w-full flex items-center space-x-2 p-2 text-left rounded-md transition-colors ${
                  section.id === active 
                    ? 'bg-muted text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
                onClick={() => handleActiveChange(section.id)}
              >
                {section.icon && <span>{section.icon}</span>}
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="col-span-9">
          {sections.find(s => s.id === active)?.content}
        </div>
      </div>
    );
  }
  
  // Tab Bar Layout (mobile app style)
  if (effectiveLayoutType === 'tabBar') {
    return (
      <div className={`platform-layout platform-tab-bar ${className}`}>
        <div className="content-area pb-16">
          {sections.find(s => s.id === active)?.content}
        </div>
        
        <div className="tab-bar fixed bottom-0 left-0 right-0 bg-background border-t z-10 flex justify-around p-1">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`flex flex-col items-center p-2 rounded-md transition-colors ${
                section.id === active 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
              onClick={() => handleActiveChange(section.id)}
            >
              <div className="mb-1">{section.icon}</div>
              <span className="text-xs">{section.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  
  // Fallback to tabs if no matching layout
  return (
    <Tabs 
      value={active} 
      onValueChange={handleActiveChange}
      className={`platform-layout platform-default ${className}`}
    >
      <TabsList>
        {sections.map((section) => (
          <TabsTrigger key={section.id} value={section.id}>
            {section.title}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {sections.map((section) => (
        <TabsContent key={section.id} value={section.id}>
          {section.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default PlatformLayout;

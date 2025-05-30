
import React, { useState, useEffect, useMemo } from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { TabsList, TabsTrigger, Tabs, TabsContent } from '../ui/tabs';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface PlatformLayoutProps {
  sections: Section[];
  defaultActive?: string;
  onActiveChange?: (active: string) => void;
  className?: string;
  layoutType?: 'auto' | 'stack' | 'tabs' | 'split' | 'tabBar';
  // Enhanced responsive props
  mobileLayoutType?: 'stack' | 'tabs' | 'tabBar';
  tabletLayoutType?: 'tabs' | 'split';
  desktopLayoutType?: 'tabs' | 'split';
  adaptToOrientation?: boolean;
}

const PlatformLayout: React.FC<PlatformLayoutProps> = ({
  sections,
  defaultActive,
  onActiveChange,
  className = '',
  layoutType = 'auto',
  mobileLayoutType,
  tabletLayoutType,
  desktopLayoutType,
  adaptToOrientation = true
}) => {
  const [active, setActive] = useState(defaultActive || (sections[0]?.id || ''));
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    isLandscape, 
    isPortrait,
    isPlatformIOS,
    isPlatformAndroid 
  } = useResponsive();
  
  // Memoized layout type calculation for better performance
  const effectiveLayoutType = useMemo(() => {
    if (layoutType !== 'auto') {
      return layoutType;
    }
    
    // Use explicit layout types if provided
    if (isMobile && mobileLayoutType) return mobileLayoutType;
    if (isTablet && tabletLayoutType) return tabletLayoutType;
    if (isDesktop && desktopLayoutType) return desktopLayoutType;
    
    // Enhanced auto-detection logic
    if (isMobile) {
      if (adaptToOrientation) {
        return isPortrait ? 'stack' : 'tabs';
      }
      return 'stack';
    }
    
    if (isTablet) {
      return adaptToOrientation && isLandscape ? 'split' : 'tabs';
    }
    
    // Desktop default
    return 'split';
  }, [
    layoutType, isMobile, isTablet, isDesktop, isLandscape, isPortrait,
    mobileLayoutType, tabletLayoutType, desktopLayoutType, adaptToOrientation
  ]);
  
  // Handle active section change with validation
  const handleActiveChange = (newActive: string) => {
    const section = sections.find(s => s.id === newActive);
    if (section && !section.disabled) {
      setActive(newActive);
      onActiveChange?.(newActive);
    }
  };
  
  // Update active section if defaultActive changes
  useEffect(() => {
    if (defaultActive && sections.find(s => s.id === defaultActive)) {
      setActive(defaultActive);
    }
  }, [defaultActive, sections]);
  
  // Get platform-specific button classes
  const getNavButtonClasses = (isActive: boolean) => {
    const baseClasses = 'flex flex-col items-center p-3 rounded-lg transition-all duration-200';
    const activeClasses = isActive ? 'text-primary bg-muted' : 'text-muted-foreground hover:text-primary hover:bg-muted/50';
    
    if (isPlatformIOS) {
      return cn(baseClasses, activeClasses, 'active:scale-95');
    }
    
    if (isPlatformAndroid) {
      return cn(baseClasses, activeClasses, 'active:bg-muted/70');
    }
    
    return cn(baseClasses, activeClasses);
  };
  
  // Stack Layout (mobile portrait)
  if (effectiveLayoutType === 'stack') {
    const activeSection = sections.find(s => s.id === active);
    
    return (
      <div className={cn('platform-layout platform-stack flex flex-col h-full', className)}>
        <div className="flex-1 overflow-auto">
          {activeSection?.content}
        </div>
        
        {/* Bottom Navigation */}
        <div className="bg-background border-t border-border pt-safe pb-safe">
          <div className="flex justify-around px-2 py-1">
            {sections.map((section) => (
              <button
                key={section.id}
                disabled={section.disabled}
                className={getNavButtonClasses(section.id === active)}
                onClick={() => handleActiveChange(section.id)}
                aria-label={`Switch to ${section.title}`}
              >
                {section.icon && (
                  <div className="mb-1 text-lg">
                    {section.icon}
                  </div>
                )}
                <span className="text-xs font-medium">{section.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Tabs Layout
  if (effectiveLayoutType === 'tabs') {
    return (
      <Tabs 
        value={active} 
        onValueChange={handleActiveChange}
        className={cn('platform-layout platform-tabs flex flex-col h-full', className)}
      >
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent shrink-0">
          {sections.map((section) => (
            <TabsTrigger 
              key={section.id} 
              value={section.id}
              disabled={section.disabled}
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none py-3 px-4"
            >
              <div className="flex items-center space-x-2">
                {section.icon && <span className="text-base">{section.icon}</span>}
                <span className="font-medium">{section.title}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="flex-1 overflow-auto">
          {sections.map((section) => (
            <TabsContent 
              key={section.id} 
              value={section.id} 
              className="mt-0 h-full data-[state=inactive]:hidden"
            >
              {section.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    );
  }
  
  // Split Layout (tablet/desktop)
  if (effectiveLayoutType === 'split') {
    const sidebarCols = isMobile ? 'col-span-4' : 'col-span-3';
    const contentCols = isMobile ? 'col-span-8' : 'col-span-9';
    
    return (
      <div className={cn('platform-layout platform-split grid grid-cols-12 gap-6 h-full', className)}>
        <div className={cn(sidebarCols, 'border-r border-border pr-6 overflow-auto')}>
          <nav className="space-y-1" role="navigation" aria-label="Section navigation">
            {sections.map((section) => (
              <button
                key={section.id}
                disabled={section.disabled}
                className={cn(
                  'w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-all duration-200',
                  section.id === active 
                    ? 'bg-muted text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  section.disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => handleActiveChange(section.id)}
                aria-pressed={section.id === active}
                aria-label={`Switch to ${section.title} section`}
              >
                {section.icon && (
                  <span className="text-lg shrink-0">
                    {section.icon}
                  </span>
                )}
                <span className="font-medium">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className={cn(contentCols, 'overflow-auto')}>
          {sections.find(s => s.id === active)?.content}
        </div>
      </div>
    );
  }
  
  // Tab Bar Layout (alternative mobile style)
  if (effectiveLayoutType === 'tabBar') {
    const activeSection = sections.find(s => s.id === active);
    
    return (
      <div className={cn('platform-layout platform-tab-bar flex flex-col h-full', className)}>
        <div className="flex-1 overflow-auto">
          {activeSection?.content}
        </div>
        
        {/* Tab Bar */}
        <div className="bg-background border-t border-border pt-safe pb-safe">
          <div className="flex justify-around px-1 py-2">
            {sections.map((section) => (
              <button
                key={section.id}
                disabled={section.disabled}
                className={cn(
                  'flex flex-col items-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1',
                  section.id === active ? 'text-primary' : 'text-muted-foreground',
                  section.disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => handleActiveChange(section.id)}
                aria-label={`Switch to ${section.title}`}
              >
                {section.icon && (
                  <div className="mb-1 text-lg">
                    {section.icon}
                  </div>
                )}
                <span className="text-xs font-medium truncate w-full">
                  {section.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback to tabs layout
  return (
    <Tabs 
      value={active} 
      onValueChange={handleActiveChange}
      className={cn('platform-layout platform-default', className)}
    >
      <TabsList>
        {sections.map((section) => (
          <TabsTrigger 
            key={section.id} 
            value={section.id}
            disabled={section.disabled}
          >
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

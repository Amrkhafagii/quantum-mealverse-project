
import React, { useState, useEffect } from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';
import { Platform } from '@/utils/platform';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlatformTabBar } from '@/components/ui/platform-tab-bar';

type LayoutType = 'stack' | 'split' | 'tabs' | 'tabBar';

interface LayoutSection {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface PlatformLayoutProps {
  sections: LayoutSection[];
  className?: string;
  defaultActive?: string;
  layoutType?: LayoutType | 'auto';
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onSectionChange?: (sectionId: string) => void;
}

/**
 * A layout component that adapts based on platform and screen size
 */
export const PlatformLayout: React.FC<PlatformLayoutProps> = ({
  sections,
  className = '',
  defaultActive,
  layoutType = 'auto',
  sidebar,
  header,
  footer,
  onSectionChange,
}) => {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    isLandscape, 
    isPlatformIOS,
    isPlatformAndroid
  } = useResponsive();
  
  // Determine the current layout type based on device and orientation
  const determineLayoutType = (): LayoutType => {
    if (layoutType !== 'auto') return layoutType;
    
    // Mobile in portrait - use tab bar for iOS, stack for Android
    if (isMobile && !isLandscape) {
      return isPlatformIOS ? 'tabBar' : 'tabs';
    }
    
    // Mobile in landscape or tablet - use split view
    if ((isMobile && isLandscape) || isTablet) {
      return 'split';
    }
    
    // Desktop - use sidebar + content layout
    return 'split';
  };
  
  const currentLayout = determineLayoutType();
  const [activeSection, setActiveSection] = useState<string>(
    defaultActive || (sections.length > 0 ? sections[0].id : '')
  );
  
  // Handle section change
  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };
  
  // Update if default changes
  useEffect(() => {
    if (defaultActive) {
      setActiveSection(defaultActive);
    }
  }, [defaultActive]);

  // Render appropriate layout based on the determined type
  const renderLayout = () => {
    switch (currentLayout) {
      case 'stack':
        return (
          <div className="flex flex-col w-full h-full">
            {sections.map(section => (
              <div 
                key={section.id} 
                className={`${activeSection === section.id ? 'block' : 'hidden'}`}
              >
                {section.content}
              </div>
            ))}
          </div>
        );
        
      case 'split':
        return (
          <div className="flex flex-row h-full">
            <div className={`shrink-0 ${sidebar ? '' : 'border-r dark:border-gray-800'}`} style={{ width: '250px' }}>
              {sidebar || (
                <div className="p-2">
                  <ul className="space-y-1">
                    {sections.map(section => (
                      <li key={section.id}>
                        <button
                          className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                            activeSection === section.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => handleSectionChange(section.id)}
                        >
                          <div className="flex items-center gap-2">
                            {section.icon}
                            <span>{section.title}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto">
              {sections.map(section => (
                <div 
                  key={section.id} 
                  className={`${activeSection === section.id ? 'block' : 'hidden'} h-full`}
                >
                  {section.content}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'tabs':
        return (
          <Tabs 
            value={activeSection} 
            onValueChange={handleSectionChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4">
              {sections.map(section => (
                <TabsTrigger key={section.id} value={section.id}>
                  <div className="flex flex-col items-center gap-1">
                    {section.icon}
                    <span>{section.title}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            {sections.map(section => (
              <TabsContent key={section.id} value={section.id}>
                {section.content}
              </TabsContent>
            ))}
          </Tabs>
        );
        
      case 'tabBar':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              {sections.map(section => (
                <div 
                  key={section.id} 
                  className={`${activeSection === section.id ? 'block' : 'hidden'} h-full`}
                >
                  {section.content}
                </div>
              ))}
            </div>
            <PlatformTabBar 
              items={sections.map(section => ({
                id: section.id,
                label: section.title,
                icon: section.icon,
              }))} 
              activeItemId={activeSection}
              onItemClick={handleSectionChange}
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex flex-col w-full h-full', className)}>
      {header && <div className="flex-shrink-0">{header}</div>}
      <div className="flex-1 overflow-auto">
        {renderLayout()}
      </div>
      {footer && currentLayout !== 'tabBar' && (
        <div className="flex-shrink-0">{footer}</div>
      )}
    </div>
  );
};

export default PlatformLayout;


import React from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { Platform } from '@/utils/platform';
import { Smartphone, Tablet, MonitorSmartphone } from 'lucide-react';

interface PlatformLayoutProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  sidebarContent?: React.ReactNode;
  bottomTabItems?: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }>;
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export const PlatformLayout: React.FC<PlatformLayoutProps> = ({
  children,
  headerContent,
  footerContent,
  sidebarContent,
  bottomTabItems,
  activeTabId,
  onTabChange,
  className = '',
}) => {
  const { 
    isPlatformIOS, 
    isPlatformAndroid, 
    isPlatformWeb,
    isDesktop,
    isTablet,
    isMobile 
  } = useResponsive();

  // Determine which platform UI pattern to use
  const renderContent = () => {
    if (isPlatformIOS || isPlatformAndroid) {
      return renderMobileLayout();
    } else if (isTablet) {
      return renderTabletLayout();
    } else {
      return renderDesktopLayout();
    }
  };

  // Mobile layout with bottom tabs or basic layout
  const renderMobileLayout = () => {
    const safeAreaClass = isPlatformIOS ? 'pb-[env(safe-area-inset-bottom)]' : 'pb-4';
    
    return (
      <div className={`flex flex-col min-h-screen ${className}`}>
        {/* Mobile Header */}
        {headerContent && (
          <header className={`sticky top-0 z-10 bg-background ${isPlatformIOS ? 'pt-[env(safe-area-inset-top)]' : 'pt-2'}`}>
            {headerContent}
          </header>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        
        {/* Mobile Footer or Tab Bar */}
        {(bottomTabItems && bottomTabItems.length > 0) ? (
          <PlatformTabBar 
            activeItemId={activeTabId || bottomTabItems[0].id} 
            onItemClick={onTabChange || (() => {})} 
            bottomTabItems={bottomTabItems}
            isPlatformIOS={isPlatformIOS}
          />
        ) : footerContent ? (
          <footer className={`bg-background ${safeAreaClass}`}>
            {footerContent}
          </footer>
        ) : null}
      </div>
    );
  };

  // Tablet layout with sidebar
  const renderTabletLayout = () => {
    return (
      <div className={`flex min-h-screen ${className}`}>
        {/* Sidebar */}
        {sidebarContent && (
          <aside className="w-64 border-r border-border bg-muted/10">
            {sidebarContent}
          </aside>
        )}
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          {headerContent && (
            <header className="sticky top-0 z-10 bg-background">
              {headerContent}
            </header>
          )}
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          
          {/* Footer */}
          {footerContent && (
            <footer className="bg-background">
              {footerContent}
            </footer>
          )}
        </div>
      </div>
    );
  };

  // Desktop layout with sidebar and fixed width
  const renderDesktopLayout = () => {
    return (
      <div className={`flex justify-center ${className}`}>
        <div className="flex min-h-screen max-w-7xl w-full">
          {/* Sidebar */}
          {sidebarContent && (
            <aside className="w-64 border-r border-border bg-muted/10">
              {sidebarContent}
            </aside>
          )}
          
          <div className="flex-1 flex flex-col">
            {/* Header */}
            {headerContent && (
              <header className="sticky top-0 z-10 bg-background">
                {headerContent}
              </header>
            )}
            
            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
            
            {/* Footer */}
            {footerContent && (
              <footer className="bg-background">
                {footerContent}
              </footer>
            )}
          </div>
        </div>
      </div>
    );
  };

  return renderContent();
};

// Platform-specific tab bar component
interface PlatformTabBarProps {
  activeItemId: string;
  onItemClick: (itemId: string) => void;
  bottomTabItems: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }>;
  isPlatformIOS: boolean;
}

const PlatformTabBar: React.FC<PlatformTabBarProps> = ({
  activeItemId,
  onItemClick,
  bottomTabItems,
  isPlatformIOS
}) => {
  const safeAreaClass = isPlatformIOS ? 'pb-[env(safe-area-inset-bottom)]' : 'pb-1';
  
  // iOS style tab bar vs Material style
  return (
    <div className={`sticky bottom-0 border-t border-border bg-background ${safeAreaClass}`}>
      <div className="flex items-center justify-around">
        {bottomTabItems.map((item) => {
          const isActive = item.id === activeItemId;
          
          // iOS style: icon above label
          if (isPlatformIOS) {
            return (
              <button
                key={item.id}
                className={`flex flex-col items-center justify-center py-2 px-4 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => onItemClick(item.id)}
              >
                <div className="mb-1">{item.icon}</div>
                <span className="text-xs">{item.label}</span>
              </button>
            );
          }
          
          // Android style: icon with label side by side when active
          return (
            <button
              key={item.id}
              className={`flex items-center justify-center py-3 px-4 ${
                isActive
                  ? 'text-primary bg-primary/10 rounded-full'
                  : 'text-muted-foreground'
              }`}
              onClick={() => onItemClick(item.id)}
            >
              <div className="mr-2">{item.icon}</div>
              {isActive && <span className="text-xs">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformLayout;

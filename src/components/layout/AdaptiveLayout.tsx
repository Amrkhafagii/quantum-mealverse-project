
import React, { useEffect } from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';
import { PlatformContainer } from './PlatformContainer';
import { 
  useLayoutHelpers, 
  MobileLayout, 
  SidebarLayout, 
  SplitLayout 
} from './LayoutHelpers';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  sidebarContent?: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: string;
  splitLayout?: boolean;
  foldableAware?: boolean;
  containerVariant?: 'default' | 'elevated' | 'outlined';
  // New props for enhanced flexibility
  breakpointBehavior?: {
    forceMobileBelow?: 'sm' | 'md' | 'lg';
    forceSidebarAbove?: 'sm' | 'md' | 'lg';
  };
  customLayoutRules?: {
    mobileFirst?: boolean;
    respectUserPreferences?: boolean;
  };
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  children,
  className,
  sidebarContent,
  sidebarPosition = 'left',
  sidebarWidth = '300px',
  splitLayout = false,
  foldableAware = true,
  containerVariant = 'default',
  breakpointBehavior,
  customLayoutRules = { mobileFirst: true, respectUserPreferences: true }
}) => {
  const {
    shouldUseMobileLayout,
    shouldUseSidebarLayout,
    shouldUseSplitLayout,
    getSidebarConfig,
    getContainerConfig,
    deviceInfo
  } = useLayoutHelpers();
  
  // Handle orientation change specifically for foldable devices
  useEffect(() => {
    if (deviceInfo.isFoldable && foldableAware) {
      console.log("Adapting layout for foldable device in", 
        deviceInfo.isLandscape ? "landscape" : "portrait", "mode");
    }
  }, [deviceInfo.isFoldable, deviceInfo.isLandscape, foldableAware]);
  
  // Apply custom breakpoint behavior if specified
  const shouldForceMobile = breakpointBehavior?.forceMobileBelow && 
    (deviceInfo.isMobile || (breakpointBehavior.forceMobileBelow === 'md' && !deviceInfo.isTablet));
  
  const shouldForceSidebar = breakpointBehavior?.forceSidebarAbove && 
    ((breakpointBehavior.forceSidebarAbove === 'sm' && !deviceInfo.isMobile) ||
     (breakpointBehavior.forceSidebarAbove === 'md' && deviceInfo.isTablet));

  // Simple mobile view - single column layout
  if (shouldUseMobileLayout(shouldForceMobile)) {
    return (
      <MobileLayout
        containerVariant={containerVariant}
        className={className}
        sidebarContent={sidebarContent}
      >
        {children}
      </MobileLayout>
    );
  }
  
  // Split layout for foldable devices
  if (shouldUseSplitLayout(splitLayout, foldableAware)) {
    return (
      <SplitLayout
        containerVariant={containerVariant}
        className={className}
      >
        {children}
      </SplitLayout>
    );
  }
  
  // Sidebar layout for larger screens or when forced
  if (shouldUseSidebarLayout(sidebarContent) || shouldForceSidebar) {
    const sidebarConfig = getSidebarConfig(sidebarPosition, sidebarWidth);
    
    return (
      <SidebarLayout
        containerVariant={containerVariant}
        className={className}
        sidebarContent={sidebarContent}
        sidebarPosition={sidebarPosition}
        sidebarConfig={sidebarConfig}
      >
        {children}
      </SidebarLayout>
    );
  }
  
  // Default layout (desktop or no special cases)
  if (sidebarContent) {
    const sidebarConfig = getSidebarConfig(sidebarPosition, sidebarWidth);
    
    return (
      <PlatformContainer 
        variant={containerVariant} 
        className={cn('flex', className)}
      >
        {sidebarPosition === 'left' && (
          <div 
            className={sidebarConfig.className}
            style={sidebarConfig.style}
          >
            {sidebarContent}
          </div>
        )}
        
        <div className="flex-1">
          {children}
        </div>
        
        {sidebarPosition === 'right' && (
          <div 
            className={sidebarConfig.className}
            style={sidebarConfig.style}
          >
            {sidebarContent}
          </div>
        )}
      </PlatformContainer>
    );
  }
  
  // Just return children if no special layout is needed
  return (
    <PlatformContainer 
      variant={containerVariant} 
      className={className}
    >
      {children}
    </PlatformContainer>
  );
};

export default AdaptiveLayout;

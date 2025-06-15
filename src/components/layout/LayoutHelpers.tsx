
import React from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { getLayoutClasses } from '@/utils/responsiveUtils';
import { PlatformContainer } from './PlatformContainer';

// Helper functions for adaptive layout logic
export const useLayoutHelpers = () => {
  const { 
    isMobile, 
    isTablet, 
    isLandscape, 
    isFoldable,
    safeAreaLeft,
    safeAreaRight
  } = useResponsive();

  const shouldUseMobileLayout = (forceMobile?: boolean) => {
    return forceMobile || (isMobile && !isLandscape);
  };

  const shouldUseSidebarLayout = (sidebarContent?: React.ReactNode) => {
    return sidebarContent && ((isMobile && isLandscape) || isTablet || !isMobile);
  };

  const shouldUseSplitLayout = (splitLayout?: boolean, foldableAware?: boolean) => {
    return splitLayout && isFoldable && foldableAware;
  };

  const getSidebarConfig = (
    sidebarPosition: 'left' | 'right', 
    sidebarWidth: string
  ) => {
    return getLayoutClasses.sidebar(
      sidebarPosition, 
      sidebarWidth, 
      { left: safeAreaLeft, right: safeAreaRight }
    );
  };

  const getContainerConfig = () => {
    return getLayoutClasses.container(isMobile, isTablet);
  };

  return {
    shouldUseMobileLayout,
    shouldUseSidebarLayout,
    shouldUseSplitLayout,
    getSidebarConfig,
    getContainerConfig,
    deviceInfo: {
      isMobile,
      isTablet,
      isLandscape,
      isFoldable,
      safeAreaLeft,
      safeAreaRight
    }
  };
};

// Separate component for mobile layout
export const MobileLayout: React.FC<{
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  containerVariant: 'default' | 'elevated' | 'outlined';
  className?: string;
}> = ({ children, sidebarContent, containerVariant, className }) => {
  return (
    <PlatformContainer 
      variant={containerVariant} 
      className={`flex flex-col w-full ${className || ''}`}
    >
      {children}
      {sidebarContent && (
        <div className="mt-4 border-t pt-4">
          {sidebarContent}
        </div>
      )}
    </PlatformContainer>
  );
};

// Separate component for sidebar layout
export const SidebarLayout: React.FC<{
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
  sidebarPosition: 'left' | 'right';
  sidebarConfig: { className: string; style: any };
  containerVariant: 'default' | 'elevated' | 'outlined';
  className?: string;
}> = ({ 
  children, 
  sidebarContent, 
  sidebarPosition, 
  sidebarConfig, 
  containerVariant, 
  className 
}) => {
  return (
    <PlatformContainer 
      variant={containerVariant} 
      className={`flex w-full ${className || ''}`}
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
};

// Separate component for split layout (foldable devices)
export const SplitLayout: React.FC<{
  children: React.ReactNode;
  containerVariant: 'default' | 'elevated' | 'outlined';
  className?: string;
}> = ({ children, containerVariant, className }) => {
  return (
    <PlatformContainer 
      variant={containerVariant} 
      className={`grid grid-cols-2 gap-4 ${className || ''}`}
    >
      <div className="col-span-1">
        {React.Children.toArray(children)[0]}
      </div>
      <div className="col-span-1">
        {React.Children.toArray(children).slice(1)}
      </div>
    </PlatformContainer>
  );
};

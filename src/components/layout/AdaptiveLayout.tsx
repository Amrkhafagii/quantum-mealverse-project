
import React, { useEffect } from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  sidebarContent?: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: string;
  splitLayout?: boolean;
  foldableAware?: boolean;
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  children,
  className,
  sidebarContent,
  sidebarPosition = 'left',
  sidebarWidth = '300px',
  splitLayout = false,
  foldableAware = true,
}) => {
  const { 
    isMobile, 
    isTablet, 
    isLandscape, 
    isFoldable,
    safeAreaLeft,
    safeAreaRight
  } = useResponsive();
  
  // Handle orientation change specifically for foldable devices
  useEffect(() => {
    if (isFoldable) {
      // In a real app, we'd use the native foldable APIs
      console.log("Adapting layout for foldable device in", 
        isLandscape ? "landscape" : "portrait", "mode");
    }
  }, [isFoldable, isLandscape]);
  
  // Simple mobile view - single column layout
  if (isMobile && !isLandscape) {
    return (
      <div className={cn('flex flex-col w-full', className)}>
        {children}
        {sidebarContent && (
          <div className="mt-4 border-t pt-4">
            {sidebarContent}
          </div>
        )}
      </div>
    );
  }
  
  // Landscape mobile or tablet - side-by-side if we have sidebar content
  if ((isMobile && isLandscape) || isTablet) {
    // Calculate safe area padding for iOS/Android
    const leftPadding = sidebarPosition === 'left' ? safeAreaLeft : 0;
    const rightPadding = sidebarPosition === 'right' ? safeAreaRight : 0;
    
    const sidebarStyle = {
      width: sidebarWidth,
      paddingLeft: sidebarPosition === 'left' ? `${leftPadding}px` : undefined,
      paddingRight: sidebarPosition === 'right' ? `${rightPadding}px` : undefined,
    };
    
    // For tablets and landscape mobile with sidebar content
    if (sidebarContent) {
      return (
        <div className={cn('flex w-full', className)}>
          {sidebarPosition === 'left' && (
            <div 
              className="shrink-0 border-r dark:border-gray-800" 
              style={sidebarStyle}
            >
              {sidebarContent}
            </div>
          )}
          
          <div className="flex-1">
            {children}
          </div>
          
          {sidebarPosition === 'right' && (
            <div 
              className="shrink-0 border-l dark:border-gray-800" 
              style={sidebarStyle}
            >
              {sidebarContent}
            </div>
          )}
        </div>
      );
    }
    
    // If we have no sidebar content, but split layout is requested (e.g. for foldable devices)
    if (splitLayout && isFoldable) {
      return (
        <div className={cn('grid grid-cols-2 gap-4', className)}>
          <div className="col-span-1">
            {React.Children.toArray(children)[0]}
          </div>
          <div className="col-span-1">
            {React.Children.toArray(children).slice(1)}
          </div>
        </div>
      );
    }
  }
  
  // Default layout (desktop or no special cases)
  if (sidebarContent) {
    return (
      <div className={cn('flex', className)}>
        {sidebarPosition === 'left' && (
          <div 
            className="shrink-0 border-r dark:border-gray-800" 
            style={{ width: sidebarWidth }}
          >
            {sidebarContent}
          </div>
        )}
        
        <div className="flex-1">
          {children}
        </div>
        
        {sidebarPosition === 'right' && (
          <div 
            className="shrink-0 border-l dark:border-gray-800" 
            style={{ width: sidebarWidth }}
          >
            {sidebarContent}
          </div>
        )}
      </div>
    );
  }
  
  // Just return children if no special layout is needed
  return <div className={className}>{children}</div>;
};

export default AdaptiveLayout;

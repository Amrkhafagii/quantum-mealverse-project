import React from 'react';
import { useResponsive } from '@/responsive/core';

type ResourceDensity = 'ldpi' | 'mdpi' | 'hdpi' | 'xhdpi' | 'xxhdpi' | 'xxxhdpi';
type ScreenSize = 'small' | 'normal' | 'large' | 'xlarge';
type MinWidth = 'sw600dp' | 'sw720dp';

interface ResourceQualifierProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  // Android-style qualifier props
  screenSize?: ScreenSize;
  minWidth?: MinWidth;
  orientation?: 'port' | 'land';
  density?: ResourceDensity;
  uiMode?: 'car' | 'desk' | 'television' | 'appliance' | 'watch';
  nightMode?: boolean;
}

export const ResourceQualifier: React.FC<ResourceQualifierProps> = ({
  children,
  fallback,
  screenSize,
  minWidth,
  orientation,
  density,
  uiMode,
  nightMode,
}) => {
  const { 
    isMobile, 
    isTablet, 
    isPortrait, 
    androidScreenSize,
    isDarkMode,
    isPlatformAndroid
  } = useResponsive();
  
  // Map our responsive sizes to Android min width qualifiers
  const getAndroidMinWidth = (): MinWidth | null => {
    if (isTablet) return 'sw600dp';
    if (!isMobile) return 'sw720dp';
    return null;
  };
  
  // Check if the component should be rendered based on the qualifiers
  const shouldRender = (): boolean => {
    const currentScreenSize = androidScreenSize;
    const currentMinWidth = getAndroidMinWidth();
    const currentOrientation = isPortrait ? 'port' : 'land';
    
    // Compare requested qualifiers with current device state
    if (screenSize && screenSize !== currentScreenSize) return false;
    if (minWidth && (!currentMinWidth || minWidth !== currentMinWidth)) return false;
    if (orientation && orientation !== currentOrientation) return false;
    if (nightMode !== undefined && nightMode !== isDarkMode) return false;
    
    // Density and UI mode are more complex to simulate in web
    // We'll simply check Android platform for these
    if ((density || uiMode) && !isPlatformAndroid) return false;
    
    // All qualifiers match or weren't specified
    return true;
  };
  
  return shouldRender() ? <>{children}</> : <>{fallback}</>;
};

export default ResourceQualifier;

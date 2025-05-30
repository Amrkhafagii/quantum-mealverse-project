
import React from 'react';
import { Platform } from '../../utils/platform';
import { useResponsive } from '../../core/ResponsiveContext';

interface PlatformSpecificProps {
  children: React.ReactNode;
  platform?: 'ios' | 'android' | 'native' | 'web' | 'mobile-web' | 'tablet';
  fallback?: React.ReactNode;
}

export const PlatformSpecific: React.FC<PlatformSpecificProps> = ({
  children,
  platform,
  fallback = null,
}) => {
  const { 
    isPlatformIOS, 
    isPlatformAndroid, 
    isPlatformWeb,
    isTablet,
    isMobile
  } = useResponsive();

  // Determine if we should render the children
  const shouldRender = () => {
    // If no platform is specified, always render
    if (!platform) return true;

    try {
      switch (platform) {
        case 'ios':
          return isPlatformIOS;
        case 'android':
          return isPlatformAndroid;
        case 'native':
          return Platform.isNative();
        case 'web':
          return isPlatformWeb;
        case 'mobile-web':
          return isPlatformWeb && isMobile;
        case 'tablet':
          return isTablet;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error in platform detection:', error);
      // Default to showing content if there's an error
      return true;
    }
  };

  return shouldRender() ? <>{children}</> : <>{fallback}</>;
};

// Shorthand components for specific platforms
export const IOSOnly: React.FC<Omit<PlatformSpecificProps, 'platform'>> = (props) => (
  <PlatformSpecific platform="ios" {...props} />
);

export const AndroidOnly: React.FC<Omit<PlatformSpecificProps, 'platform'>> = (props) => (
  <PlatformSpecific platform="android" {...props} />
);

export const NativeOnly: React.FC<Omit<PlatformSpecificProps, 'platform'>> = (props) => (
  <PlatformSpecific platform="native" {...props} />
);

export const WebOnly: React.FC<Omit<PlatformSpecificProps, 'platform'>> = (props) => (
  <PlatformSpecific platform="web" {...props} />
);

export const TabletOnly: React.FC<Omit<PlatformSpecificProps, 'platform'>> = (props) => (
  <PlatformSpecific platform="tablet" {...props} />
);

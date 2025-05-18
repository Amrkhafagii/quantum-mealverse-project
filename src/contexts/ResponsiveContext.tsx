
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from '@/utils/platform';

export type ScreenSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isFoldable: boolean;
  screenSize: ScreenSizeType;
  isPlatformIOS: boolean;
  isPlatformAndroid: boolean;
  isPlatformWeb: boolean;
  isDarkMode: boolean;
  screenWidth: number;
  screenHeight: number;
  androidScreenSize: 'small' | 'normal' | 'large' | 'xlarge';
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
}

const defaultContext: ResponsiveContextType = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isPortrait: true,
  isLandscape: false,
  isFoldable: false,
  screenSize: 'lg',
  isPlatformIOS: false,
  isPlatformAndroid: false,
  isPlatformWeb: true,
  isDarkMode: false,
  screenWidth: 0,
  screenHeight: 0,
  androidScreenSize: 'normal',
  safeAreaTop: 0,
  safeAreaBottom: 0,
  safeAreaLeft: 0,
  safeAreaRight: 0
};

const ResponsiveContext = createContext<ResponsiveContextType>(defaultContext);

export const useResponsive = () => useContext(ResponsiveContext);

interface ResponsiveProviderProps {
  children: React.ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const [state, setState] = useState<ResponsiveContextType>({
    ...defaultContext,
    isPlatformIOS: Platform.isIOS(),
    isPlatformAndroid: Platform.isAndroid(),
    isPlatformWeb: Platform.isWeb(),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  });

  // Update responsive state on mount and resize
  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      const isLandscape = !isPortrait;
      
      // Attempt to detect foldable devices - simplified detection
      // This would need device-specific API implementation for accurate detection
      const isFoldable = Platform.isAndroid() && width > 700 && height > 600;
      
      // Determine screenSize
      let screenSize: ScreenSizeType;
      if (width < 640) screenSize = 'xs';
      else if (width < 768) screenSize = 'sm';
      else if (width < 1024) screenSize = 'md';
      else if (width < 1280) screenSize = 'lg';
      else if (width < 1536) screenSize = 'xl';
      else screenSize = '2xl';
      
      // Android-style screen sizes
      let androidScreenSize: 'small' | 'normal' | 'large' | 'xlarge';
      if (width < 480) androidScreenSize = 'small';
      else if (width < 840) androidScreenSize = 'normal';
      else if (width < 1280) androidScreenSize = 'large';
      else androidScreenSize = 'xlarge';
      
      // Get safe area insets
      const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0');
      const safeAreaRight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0');
      const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0');
      const safeAreaLeft = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0');
      
      // Update the state
      setState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isPortrait,
        isLandscape,
        isFoldable,
        screenSize,
        isPlatformIOS: Platform.isIOS(),
        isPlatformAndroid: Platform.isAndroid(),
        isPlatformWeb: Platform.isWeb(),
        isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        screenWidth: width,
        screenHeight: height,
        androidScreenSize,
        safeAreaTop,
        safeAreaBottom,
        safeAreaLeft,
        safeAreaRight
      });
    };
    
    // Initial update
    updateResponsiveState();
    
    // Listen for resize events
    window.addEventListener('resize', updateResponsiveState);
    
    // Listen for dark mode changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', updateResponsiveState);
    
    return () => {
      window.removeEventListener('resize', updateResponsiveState);
      darkModeMediaQuery.removeEventListener('change', updateResponsiveState);
    };
  }, []);

  return (
    <ResponsiveContext.Provider value={state}>
      {children}
    </ResponsiveContext.Provider>
  );
};

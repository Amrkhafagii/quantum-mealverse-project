
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from '@/utils/platform';

export type ScreenSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  screenSize: ScreenSizeType;
  isPlatformIOS: boolean;
  isPlatformAndroid: boolean;
  isPlatformWeb: boolean;
  isDarkMode: boolean;
  screenWidth: number;
  screenHeight: number;
  // Android-specific responsive types
  androidScreenSize: 'small' | 'normal' | 'large' | 'xlarge';
}

const defaultContext: ResponsiveContextType = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isPortrait: true,
  screenSize: 'lg',
  isPlatformIOS: false,
  isPlatformAndroid: false,
  isPlatformWeb: true,
  isDarkMode: false,
  screenWidth: 0,
  screenHeight: 0,
  androidScreenSize: 'normal',
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
      
      // Update the state
      setState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isPortrait,
        screenSize,
        isPlatformIOS: Platform.isIOS(),
        isPlatformAndroid: Platform.isAndroid(),
        isPlatformWeb: Platform.isWeb(),
        isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        screenWidth: width,
        screenHeight: height,
        androidScreenSize,
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

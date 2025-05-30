
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPlatformIOS: boolean;
  isPlatformAndroid: boolean;
  isPlatformWeb: boolean;
  screenSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  orientation: 'portrait' | 'landscape';
  isLandscape: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
  statusBarHeight: number;
  hasNotch: boolean;
  hasDynamicIsland: boolean;
  isPortrait: boolean;
  androidScreenSize: string;
  isDarkMode: boolean;
  isFoldable: boolean;
  isInitialized: boolean;
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

export const useResponsive = () => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
};

interface ResponsiveProviderProps {
  children: React.ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const [contextValue, setContextValue] = useState<ResponsiveContextType>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isPlatformIOS: false,
    isPlatformAndroid: false,
    isPlatformWeb: true,
    screenSize: 'lg',
    orientation: 'landscape',
    isLandscape: true,
    safeAreaTop: 0,
    safeAreaBottom: 0,
    safeAreaLeft: 0,
    safeAreaRight: 0,
    statusBarHeight: 0,
    hasNotch: false,
    hasDynamicIsland: false,
    isPortrait: false,
    androidScreenSize: 'normal',
    isDarkMode: false,
    isFoldable: false,
    isInitialized: false,
  });

  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobileDevice = width < 768;
      const isTabletDevice = width >= 768 && width < 1024;
      const isDesktopDevice = width >= 1024;
      
      let screenSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'lg';
      if (width < 640) screenSize = 'sm';
      else if (width < 768) screenSize = 'md';
      else if (width < 1024) screenSize = 'lg';
      else if (width < 1280) screenSize = 'xl';
      else screenSize = '2xl';

      const orientation = height > width ? 'portrait' : 'landscape';
      const isPortraitMode = orientation === 'portrait';
      const isLandscapeMode = orientation === 'landscape';
      
      // Basic platform detection
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isWeb = !isIOS && !isAndroid;
      
      // Dark mode detection
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      setContextValue({
        isMobile: isMobileDevice,
        isTablet: isTabletDevice,
        isDesktop: isDesktopDevice,
        isPlatformIOS: isIOS,
        isPlatformAndroid: isAndroid,
        isPlatformWeb: isWeb,
        screenSize,
        orientation,
        isLandscape: isLandscapeMode,
        safeAreaTop: 0,
        safeAreaBottom: 0,
        safeAreaLeft: 0,
        safeAreaRight: 0,
        statusBarHeight: isIOS ? 20 : 0,
        hasNotch: isIOS && width >= 375,
        hasDynamicIsland: false,
        isPortrait: isPortraitMode,
        androidScreenSize: isAndroid ? 'normal' : 'normal',
        isDarkMode: isDark,
        isFoldable: false,
        isInitialized: true,
      });
    };

    updateResponsiveState();
    window.addEventListener('resize', updateResponsiveState);
    
    return () => window.removeEventListener('resize', updateResponsiveState);
  }, []);

  return (
    <ResponsiveContext.Provider value={contextValue}>
      {children}
    </ResponsiveContext.Provider>
  );
};

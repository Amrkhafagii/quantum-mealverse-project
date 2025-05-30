
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from '@/responsive/utils/platform';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveContextType {
  screenSize: ScreenSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPlatformIOS: boolean;
  isPlatformAndroid: boolean;
  isInitialized: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

interface ResponsiveProviderProps {
  children: ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const [screenSize, setScreenSize] = useState<ScreenSize>('mobile');
  const [isLandscape, setIsLandscape] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
      
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    const updateSafeArea = () => {
      if (Platform.isNative()) {
        // Get safe area insets from CSS environment variables
        const computedStyle = getComputedStyle(document.documentElement);
        setSafeAreaInsets({
          top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
          bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
          left: parseInt(computedStyle.getPropertyValue('--sal') || '0'),
          right: parseInt(computedStyle.getPropertyValue('--sar') || '0')
        });
      }
    };

    updateScreenSize();
    updateSafeArea();
    setIsInitialized(true);

    window.addEventListener('resize', updateScreenSize);
    window.addEventListener('orientationchange', updateScreenSize);

    return () => {
      window.removeEventListener('resize', updateScreenSize);
      window.removeEventListener('orientationchange', updateScreenSize);
    };
  }, []);

  const contextValue: ResponsiveContextType = {
    screenSize,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    isLandscape,
    isPlatformIOS: Platform.isIOS(),
    isPlatformAndroid: Platform.isAndroid(),
    isInitialized,
    safeAreaTop: safeAreaInsets.top,
    safeAreaBottom: safeAreaInsets.bottom,
    safeAreaLeft: safeAreaInsets.left,
    safeAreaRight: safeAreaInsets.right,
  };

  return (
    <ResponsiveContext.Provider value={contextValue}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useResponsive = (): ResponsiveContextType => {
  const context = useContext(ResponsiveContext);
  if (context === undefined) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
};

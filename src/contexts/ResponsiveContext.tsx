
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from '@/utils/platform';

interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPlatformIOS: boolean;
  isPlatformAndroid: boolean;
  isPlatformWeb: boolean;
  isInitialized: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

interface ResponsiveProviderProps {
  children: React.ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  // Platform detection (stable once determined)
  const isPlatformIOS = Platform.isIOS();
  const isPlatformAndroid = Platform.isAndroid();
  const isPlatformWeb = Platform.isWeb();

  // Responsive breakpoints
  const isMobile = dimensions.width < 768;
  const isTablet = dimensions.width >= 768 && dimensions.width < 1024;
  const isDesktop = dimensions.width >= 1024;

  useEffect(() => {
    // Initialize dimensions and safe area
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    const updateSafeArea = () => {
      if (isPlatformIOS && typeof window !== 'undefined') {
        // Get CSS custom properties for safe area
        const computedStyle = getComputedStyle(document.documentElement);
        const top = parseInt(computedStyle.getPropertyValue('--sat').replace('px', '')) || 0;
        const bottom = parseInt(computedStyle.getPropertyValue('--sab').replace('px', '')) || 0;
        const left = parseInt(computedStyle.getPropertyValue('--sal').replace('px', '')) || 0;
        const right = parseInt(computedStyle.getPropertyValue('--sar').replace('px', '')) || 0;
        
        setSafeArea({ top, bottom, left, right });
      }
    };

    // Initial setup
    updateDimensions();
    updateSafeArea();
    
    // Mark as initialized after initial setup
    setIsInitialized(true);

    // Event listeners
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        updateDimensions();
        updateSafeArea();
      }, 100);
    });

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, [isPlatformIOS]);

  const value: ResponsiveContextType = {
    isMobile,
    isTablet,
    isDesktop,
    isPlatformIOS,
    isPlatformAndroid,
    isPlatformWeb,
    isInitialized,
    safeAreaTop: safeArea.top,
    safeAreaBottom: safeArea.bottom,
    safeAreaLeft: safeArea.left,
    safeAreaRight: safeArea.right,
  };

  return (
    <ResponsiveContext.Provider value={value}>
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

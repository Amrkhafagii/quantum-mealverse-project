
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Platform } from '@/utils/platform';

export interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isFoldable: boolean;
  isDarkMode: boolean;
  isPlatformIOS: boolean;
  isPlatformAndroid: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
  windowWidth: number;
  windowHeight: number;
}

const defaultResponsiveContext: ResponsiveContextType = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isPortrait: true,
  isLandscape: false,
  isFoldable: false,
  isDarkMode: false,
  isPlatformIOS: false,
  isPlatformAndroid: false,
  safeAreaTop: 0,
  safeAreaBottom: 0,
  safeAreaLeft: 0,
  safeAreaRight: 0,
  windowWidth: 0,
  windowHeight: 0,
};

const ResponsiveContext = createContext<ResponsiveContextType>(defaultResponsiveContext);

export const useResponsive = () => useContext(ResponsiveContext);

interface ResponsiveProviderProps {
  children: ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  // Screen size breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  
  // Orientation detection
  const isPortrait = useMediaQuery({ orientation: 'portrait' });
  const isLandscape = useMediaQuery({ orientation: 'landscape' });
  
  // Platform detection
  const isPlatformIOS = Platform.isIOS;
  const isPlatformAndroid = Platform.isAndroid;
  
  // Color scheme detection
  const isDarkMode = useMediaQuery({ query: '(prefers-color-scheme: dark)' });
  
  // Foldable device detection (simplified version)
  const [isFoldable, setIsFoldable] = useState(false);
  
  // Safe area insets (used for mobile devices)
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });
  
  // Window dimensions
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0
  });
  
  // Effect to handle window resize and detect dimensions
  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    
    // Initialize dimensions
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Check for foldable device support
    if (typeof window !== 'undefined' && 'screen' in window) {
      try {
        // @ts-ignore - TypeScript doesn't know about experimental screen spanning API
        if (window.screen.isExtended !== undefined) {
          setIsFoldable(true);
        }
      } catch (e) {
        // Not a foldable device or API not available
      }
    }
    
    // Get safe area insets from CSS variables if available
    if (typeof document !== 'undefined') {
      const computedStyle = getComputedStyle(document.documentElement);
      
      const safeAreaTop = parseInt(computedStyle.getPropertyValue('--sat') || '0', 10);
      const safeAreaBottom = parseInt(computedStyle.getPropertyValue('--sab') || '0', 10);
      const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--sal') || '0', 10);
      const safeAreaRight = parseInt(computedStyle.getPropertyValue('--sar') || '0', 10);
      
      setSafeArea({
        top: safeAreaTop,
        bottom: safeAreaBottom,
        left: safeAreaLeft,
        right: safeAreaRight
      });
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Combine all context values
  const contextValue: ResponsiveContextType = {
    isMobile,
    isTablet,
    isDesktop,
    isPortrait,
    isLandscape,
    isFoldable,
    isDarkMode,
    isPlatformIOS,
    isPlatformAndroid,
    safeAreaTop: safeArea.top,
    safeAreaBottom: safeArea.bottom,
    safeAreaLeft: safeArea.left,
    safeAreaRight: safeArea.right,
    windowWidth: windowDimensions.width,
    windowHeight: windowDimensions.height,
  };
  
  return (
    <ResponsiveContext.Provider value={contextValue}>
      {children}
    </ResponsiveContext.Provider>
  );
};

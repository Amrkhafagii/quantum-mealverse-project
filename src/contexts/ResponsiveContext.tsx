
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useScreenDimensions } from '../hooks/useScreenDimensions';
import { Platform } from '@/utils/platform';
import { useTheme } from '@/components/theme-provider';

interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isPadWidth: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isPlatformIOS: boolean;
  isPlatformAndroid: boolean;
  isPlatformWeb: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
  isFoldable: boolean;
  isDarkMode: boolean;
  isReducedMotion: boolean;
}

const ResponsiveContext = createContext<ResponsiveContextType>({
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isPortrait: true,
  isLandscape: false,
  isPadWidth: false,
  screenSize: 'lg',
  isPlatformIOS: false,
  isPlatformAndroid: false,
  isPlatformWeb: true,
  safeAreaTop: 0,
  safeAreaBottom: 0,
  safeAreaLeft: 0,
  safeAreaRight: 0,
  isFoldable: false,
  isDarkMode: false,
  isReducedMotion: false,
});

export const useResponsive = () => useContext(ResponsiveContext);

interface ResponsiveProviderProps {
  children: ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const dimensions = useScreenDimensions();
  const { theme } = useTheme();
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  // Get safe area values - These would ideally come from native APIs
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });
  
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      setIsReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);
  
  useEffect(() => {
    // For native platforms, we would use the actual safe area API
    // This is a simple approximation for iOS-like devices
    if (Platform.isIOS()) {
      setSafeArea({
        top: dimensions.isLandscape ? 0 : 47, // Approximate status bar height
        bottom: dimensions.isLandscape ? 21 : 34, // Approximate home indicator height
        left: dimensions.isLandscape ? 44 : 0, // Only in landscape
        right: dimensions.isLandscape ? 44 : 0, // Only in landscape
      });
    } else {
      // Android or other platforms might have different safe areas
      setSafeArea({
        top: 24, // Approximate status bar height
        bottom: 0,
        left: 0,
        right: 0,
      });
    }
  }, [dimensions.isLandscape]);
  
  const value = {
    isMobile: dimensions.deviceType === 'mobile',
    isTablet: dimensions.deviceType === 'tablet',
    isDesktop: dimensions.deviceType === 'desktop',
    isPortrait: dimensions.isPortrait,
    isLandscape: dimensions.isLandscape,
    isPadWidth: dimensions.width >= 768,
    screenSize: dimensions.screenSize,
    isPlatformIOS: Platform.isIOS(),
    isPlatformAndroid: Platform.isAndroid(),
    isPlatformWeb: Platform.isWeb(),
    safeAreaTop: safeArea.top,
    safeAreaBottom: safeArea.bottom,
    safeAreaLeft: safeArea.left,
    safeAreaRight: safeArea.right,
    isFoldable: dimensions.foldable,
    isDarkMode: theme === 'dark',
    isReducedMotion,
  };
  
  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

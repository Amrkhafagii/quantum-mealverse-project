
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from '@/utils/platform';

export type ScreenSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type iOSDeviceModel = 
  | 'iPhone5_SE1' 
  | 'iPhone6_7_8' 
  | 'iPhone6_7_8Plus' 
  | 'iPhoneX_XS_11Pro_12mini_13mini' 
  | 'iPhoneXR_XSMax_11' 
  | 'iPhone12_12Pro_13_13Pro_14' 
  | 'iPhone12ProMax_13ProMax_14Plus' 
  | 'iPhone14Pro' 
  | 'iPhone14ProMax' 
  | 'iPad' 
  | 'unknown';

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
  statusBarHeight: number;
  hasNotch: boolean;
  hasDynamicIsland: boolean;
  iPhoneModel: iOSDeviceModel;
  applyIOSSafeArea: (element: HTMLElement, options?: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
  }) => void;
  getIOSStatusBarHeight: () => number;
  deviceOrientation: 'portrait' | 'landscape';
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
  safeAreaRight: 0,
  statusBarHeight: 0,
  hasNotch: false,
  hasDynamicIsland: false,
  iPhoneModel: 'unknown',
  applyIOSSafeArea: () => {},
  getIOSStatusBarHeight: () => 0,
  deviceOrientation: 'portrait'
};

const ResponsiveContext = createContext<ResponsiveContextType>(defaultContext);

export const useResponsive = () => useContext(ResponsiveContext);

interface ResponsiveProviderProps {
  children: React.ReactNode;
}

/**
 * Gets the safe area inset values from CSS environment variables
 */
const getSafeAreaInsets = (): {top: number; right: number; bottom: number; left: number} => {
  // Get computed values from CSS environment variables
  const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat').replace('px', '') || '0');
  const safeAreaRight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar').replace('px', '') || '0');
  const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab').replace('px', '') || '0');
  const safeAreaLeft = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal').replace('px', '') || '0');
  
  return {
    top: isNaN(safeAreaTop) ? 0 : safeAreaTop,
    right: isNaN(safeAreaRight) ? 0 : safeAreaRight,
    bottom: isNaN(safeAreaBottom) ? 0 : safeAreaBottom,
    left: isNaN(safeAreaLeft) ? 0 : safeAreaLeft
  };
};

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const [state, setState] = useState<ResponsiveContextType>({
    ...defaultContext,
    isPlatformIOS: Platform.isIOS(),
    isPlatformAndroid: Platform.isAndroid(),
    isPlatformWeb: Platform.isWeb(),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    hasNotch: Platform.hasNotch(),
    hasDynamicIsland: Platform.hasDynamicIsland(),
    iPhoneModel: Platform.getiPhoneModel() as iOSDeviceModel,
    deviceOrientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  });

  // Apply iOS safe area padding to an element
  const applyIOSSafeArea = (
    element: HTMLElement, 
    options = { top: true, bottom: true, left: true, right: true }
  ) => {
    if (!Platform.isIOS()) return;
    
    const insets = getSafeAreaInsets();
    
    if (options.top) element.style.paddingTop = `${insets.top}px`;
    if (options.bottom) element.style.paddingBottom = `${insets.bottom}px`;
    if (options.left) element.style.paddingLeft = `${insets.left}px`;
    if (options.right) element.style.paddingRight = `${insets.right}px`;
  };

  // Get iOS status bar height based on device model and orientation
  const getIOSStatusBarHeight = (): number => {
    if (!Platform.isIOS()) return 0;
    
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    const model = Platform.getiPhoneModel();
    
    // Return status bar height based on device model and orientation
    if (Platform.hasDynamicIsland()) {
      return orientation === 'portrait' ? 54 : 21;
    } else if (Platform.hasNotch()) {
      return orientation === 'portrait' ? 44 : 0;
    } else {
      return orientation === 'portrait' ? 20 : 0;
    }
  };

  // Update responsive state on mount and resize
  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      const isLandscape = !isPortrait;
      
      // Attempt to detect foldable devices - simplified detection
      const isFoldable = Platform.isAndroid() && width > 700 && height < 900;
      
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
      const safeAreaInsets = getSafeAreaInsets();
      
      // Get iOS-specific information
      const statusBarHeight = getIOSStatusBarHeight();
      const hasNotch = Platform.hasNotch();
      const hasDynamicIsland = Platform.hasDynamicIsland();
      const iPhoneModel = Platform.getiPhoneModel() as iOSDeviceModel;
      
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
        safeAreaTop: safeAreaInsets.top,
        safeAreaBottom: safeAreaInsets.bottom,
        safeAreaLeft: safeAreaInsets.left,
        safeAreaRight: safeAreaInsets.right,
        statusBarHeight,
        hasNotch,
        hasDynamicIsland,
        iPhoneModel,
        applyIOSSafeArea,
        getIOSStatusBarHeight,
        deviceOrientation: isPortrait ? 'portrait' : 'landscape'
      });
    };
    
    // Initial update
    updateResponsiveState();
    
    // Listen for resize events with debounce
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateResponsiveState, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Listen for dark mode changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', updateResponsiveState);

    // Listen for orientation changes specifically on mobile devices
    window.addEventListener('orientationchange', () => {
      // Small delay to let the orientation change complete
      setTimeout(updateResponsiveState, 150);
    });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateResponsiveState);
      darkModeMediaQuery.removeEventListener('change', updateResponsiveState);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <ResponsiveContext.Provider value={state}>
      {children}
    </ResponsiveContext.Provider>
  );
};

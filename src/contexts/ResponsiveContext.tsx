
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  isInitialized: boolean; // New flag to track initialization state
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
  screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
  screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
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
  deviceOrientation: 'portrait',
  isInitialized: false // Start as not initialized
};

const ResponsiveContext = createContext<ResponsiveContextType>(defaultContext);

export const useResponsive = () => useContext(ResponsiveContext);

interface ResponsiveProviderProps {
  children: React.ReactNode;
}

/**
 * Gets the safe area inset values safely from CSS environment variables
 * with proper fallbacks and error handling
 */
const getSafeAreaInsets = (): {top: number; right: number; bottom: number; left: number} => {
  try {
    if (typeof document === 'undefined' || !document.documentElement) {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }
    
    // Ensure CSS variables are set
    const style = getComputedStyle(document.documentElement);
    
    // Extract values with fallbacks
    const extractValue = (prop: string): number => {
      try {
        const value = style.getPropertyValue(prop).replace('px', '') || '0';
        const parsed = parseInt(value);
        return isNaN(parsed) ? 0 : parsed;
      } catch (e) {
        console.warn(`Error parsing safe area value for ${prop}:`, e);
        return 0;
      }
    };
    
    return {
      top: extractValue('--sat'),
      right: extractValue('--sar'),
      bottom: extractValue('--sab'),
      left: extractValue('--sal')
    };
  } catch (error) {
    console.error('Error getting safe area insets:', error);
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
};

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  // Initial basic state with environment-safe values
  const [state, setState] = useState<ResponsiveContextType>({
    ...defaultContext,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    deviceOrientation: typeof window !== 'undefined' && window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  });
  
  // Track initialization phases
  const initializationPhase = useRef({
    basicPropertiesSet: false,
    platformDetectionComplete: false,
    safeAreaCalculated: false,
    fullInitComplete: false
  });
  
  // Apply iOS safe area padding to an element - enhanced with safety checks
  const applyIOSSafeArea = (
    element: HTMLElement, 
    options = { top: true, bottom: true, left: true, right: true }
  ) => {
    try {
      if (!element || !Platform.isIOS()) return;
      
      const insets = getSafeAreaInsets();
      
      if (options.top) element.style.paddingTop = `${insets.top}px`;
      if (options.bottom) element.style.paddingBottom = `${insets.bottom}px`;
      if (options.left) element.style.paddingLeft = `${insets.left}px`;
      if (options.right) element.style.paddingRight = `${insets.right}px`;
    } catch (error) {
      console.warn('Error applying iOS safe area insets:', error);
    }
  };

  // Get iOS status bar height safely based on device model and orientation
  const getIOSStatusBarHeight = (): number => {
    try {
      if (!Platform.isIOS()) return 0;
      
      const orientation = typeof window !== 'undefined' && window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      
      // Return status bar height based on device model and orientation
      if (Platform.hasDynamicIsland()) {
        return orientation === 'portrait' ? 54 : 21;
      } else if (Platform.hasNotch()) {
        return orientation === 'portrait' ? 44 : 0;
      } else {
        return orientation === 'portrait' ? 20 : 0;
      }
    } catch (error) {
      console.warn('Error getting iOS status bar height:', error);
      return 0;
    }
  };

  // Phase 1: Basic initialization for critical properties
  useEffect(() => {
    if (initializationPhase.current.basicPropertiesSet) return;
    
    try {
      // Basic properties that don't require complex detection
      setState(prev => ({
        ...prev,
        screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
        screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
        isPortrait: typeof window !== 'undefined' && window.innerHeight > window.innerWidth,
        isLandscape: typeof window !== 'undefined' && window.innerHeight <= window.innerWidth,
        isDarkMode: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
        deviceOrientation: typeof window !== 'undefined' && window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      }));
      
      initializationPhase.current.basicPropertiesSet = true;
    } catch (error) {
      console.error('Error during basic responsive context initialization:', error);
    }
  }, []);

  // Phase 2: Platform detection - run after a short delay to ensure DOM is ready
  useEffect(() => {
    if (!initializationPhase.current.basicPropertiesSet || 
        initializationPhase.current.platformDetectionComplete) {
      return;
    }
    
    const platformDetectionTimer = setTimeout(() => {
      try {
        // Platform-specific detection
        const isPlatformIOS = Platform.isIOS();
        const isPlatformAndroid = Platform.isAndroid();
        const isPlatformWeb = Platform.isWeb();
        
        setState(prev => ({
          ...prev,
          isPlatformIOS,
          isPlatformAndroid,
          isPlatformWeb,
          isMobile: (isPlatformIOS || isPlatformAndroid || Platform.isMobileBrowser()),
          isTablet: Platform.isTablet(),
        }));
        
        initializationPhase.current.platformDetectionComplete = true;
      } catch (error) {
        console.error('Error during platform detection in responsive context:', error);
      }
    }, 10);
    
    return () => clearTimeout(platformDetectionTimer);
  }, []);

  // Phase 3: iOS-specific calculations - run after platform detection is complete
  useEffect(() => {
    if (!initializationPhase.current.platformDetectionComplete || 
        initializationPhase.current.safeAreaCalculated ||
        !state.isPlatformIOS) {
      return;
    }
    
    const iOSCalculationsTimer = setTimeout(() => {
      try {
        // iOS-specific properties that might depend on platform detection
        const hasNotch = Platform.hasNotch();
        const hasDynamicIsland = Platform.hasDynamicIsland();
        let iPhoneModel: iOSDeviceModel = 'unknown';
        
        try {
          iPhoneModel = Platform.getiPhoneModel() as iOSDeviceModel;
        } catch (modelError) {
          console.warn('Error getting iPhone model:', modelError);
        }
        
        // Safe area insets
        const safeAreaInsets = getSafeAreaInsets();
        const statusBarHeight = getIOSStatusBarHeight();
        
        setState(prev => ({
          ...prev,
          hasNotch,
          hasDynamicIsland,
          iPhoneModel,
          safeAreaTop: safeAreaInsets.top,
          safeAreaBottom: safeAreaInsets.bottom,
          safeAreaLeft: safeAreaInsets.left,
          safeAreaRight: safeAreaInsets.right,
          statusBarHeight
        }));
        
        initializationPhase.current.safeAreaCalculated = true;
      } catch (error) {
        console.error('Error during iOS-specific calculations:', error);
      }
    }, 20);
    
    return () => clearTimeout(iOSCalculationsTimer);
  }, [state.isPlatformIOS]);

  // Final phase: Complete initialization and set up resize listeners
  useEffect(() => {
    if (!initializationPhase.current.basicPropertiesSet || 
        !initializationPhase.current.platformDetectionComplete ||
        (state.isPlatformIOS && !initializationPhase.current.safeAreaCalculated) ||
        initializationPhase.current.fullInitComplete) {
      return;
    }
    
    try {
      const updateResponsiveState = () => {
        try {
          const width = window.innerWidth;
          const height = window.innerHeight;
          const isPortrait = height > width;
          const isLandscape = !isPortrait;
          
          // Attempt to detect foldable devices - simplified detection
          const isFoldable = state.isPlatformAndroid && width > 700 && height < 900;
          
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
          
          // Determine device type based on screen size and platform
          const isMobile = width < 768 || Platform.isMobileBrowser();
          const isTablet = (width >= 768 && width < 1024) || Platform.isTablet();
          const isDesktop = width >= 1024 && !isMobile && !isTablet;
          
          // Safe area insets may change on rotation on iOS
          const safeAreaInsets = state.isPlatformIOS ? getSafeAreaInsets() : { top: 0, right: 0, bottom: 0, left: 0 };
          const statusBarHeight = state.isPlatformIOS ? getIOSStatusBarHeight() : 0;
          
          // Reset Platform cache when orientation changes to force recalculation
          if ((isPortrait && !state.isPortrait) || (isLandscape && !state.isLandscape)) {
            Platform.resetCache();
          }
          
          // Update the state
          setState(prev => ({
            ...prev,
            isMobile,
            isTablet,
            isDesktop,
            isPortrait,
            isLandscape,
            isFoldable,
            screenSize,
            androidScreenSize,
            screenWidth: width,
            screenHeight: height,
            safeAreaTop: safeAreaInsets.top,
            safeAreaBottom: safeAreaInsets.bottom,
            safeAreaLeft: safeAreaInsets.left,
            safeAreaRight: safeAreaInsets.right,
            statusBarHeight,
            deviceOrientation: isPortrait ? 'portrait' : 'landscape',
            isInitialized: true // Mark as fully initialized
          }));
        } catch (error) {
          console.error('Error updating responsive state:', error);
        }
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
      const handleDarkModeChange = () => {
        setState(prev => ({
          ...prev,
          isDarkMode: darkModeMediaQuery.matches
        }));
      };
      
      // Use the event listener method that works across browsers
      if (typeof darkModeMediaQuery.addEventListener === 'function') {
        darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
      } else if (typeof darkModeMediaQuery.addListener === 'function') {
        // Fallback for older browsers
        darkModeMediaQuery.addListener(handleDarkModeChange);
      }

      // Listen for orientation changes specifically on mobile devices
      const handleOrientationChange = () => {
        // Small delay to let the orientation change complete
        setTimeout(updateResponsiveState, 150);
      };
      
      window.addEventListener('orientationchange', handleOrientationChange);
      
      initializationPhase.current.fullInitComplete = true;
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleOrientationChange);
        
        if (typeof darkModeMediaQuery.removeEventListener === 'function') {
          darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
        } else if (typeof darkModeMediaQuery.removeListener === 'function') {
          darkModeMediaQuery.removeListener(handleDarkModeChange);
        }
        
        clearTimeout(resizeTimer);
      };
    } catch (error) {
      console.error('Error setting up responsive context resize handlers:', error);
    }
  }, [
    state.isPlatformIOS, 
    state.isPlatformAndroid, 
    state.isPortrait, 
    state.isLandscape,
    initializationPhase.current.basicPropertiesSet,
    initializationPhase.current.platformDetectionComplete,
    initializationPhase.current.safeAreaCalculated
  ]);

  return (
    <ResponsiveContext.Provider 
      value={{
        ...state,
        applyIOSSafeArea,
        getIOSStatusBarHeight
      }}
    >
      {children}
    </ResponsiveContext.Provider>
  );
};

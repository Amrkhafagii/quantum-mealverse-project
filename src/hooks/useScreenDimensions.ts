
import { useState, useEffect, useCallback } from 'react';
import { Platform } from '@/utils/platform';

type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type DeviceType = 'mobile' | 'tablet' | 'desktop';
type LocationFreshness = 'fresh' | 'stale' | 'expired';

type Dimensions = {
  width: number;
  height: number;
  isPortrait: boolean;
  isLandscape: boolean;
  aspectRatio: number;
  deviceType: DeviceType;
  screenSize: ScreenSize;
  foldable: boolean;
};

// Screen size breakpoints (mobile-first approach)
const SCREEN_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Device type breakpoints
const DEVICE_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

// Utility functions for clearer logic
const calculateAspectRatio = (width: number, height: number): number => {
  return Number((width / height).toFixed(2));
};

const determineOrientation = (width: number, height: number) => ({
  isPortrait: height > width,
  isLandscape: width >= height,
});

const classifyDeviceType = (width: number): DeviceType => {
  if (width < DEVICE_BREAKPOINTS.mobile || Platform.isMobileBrowser()) {
    return 'mobile';
  }
  if (width < DEVICE_BREAKPOINTS.tablet || Platform.isTablet()) {
    return 'tablet';
  }
  return 'desktop';
};

const determineScreenSize = (width: number): ScreenSize => {
  if (width >= SCREEN_BREAKPOINTS['2xl']) return '2xl';
  if (width >= SCREEN_BREAKPOINTS.xl) return 'xl';
  if (width >= SCREEN_BREAKPOINTS.lg) return 'lg';
  if (width >= SCREEN_BREAKPOINTS.md) return 'md';
  if (width >= SCREEN_BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

const detectFoldableDevice = (width: number, height: number, aspectRatio: number): boolean => {
  // Enhanced foldable detection heuristics
  if (!Platform.isAndroid()) return false;
  
  // Common foldable device patterns
  const isUnfoldedTablet = aspectRatio > 1 && aspectRatio < 1.3 && width > 700 && width < 900;
  const isUnfoldedPhone = width > 1200 && height < 900;
  const hasUnusualAspectRatio = aspectRatio > 2.5 || (aspectRatio > 1.5 && aspectRatio < 1.8);
  
  return isUnfoldedTablet || isUnfoldedPhone || hasUnusualAspectRatio;
};

export const useScreenDimensions = (): Dimensions => {
  // Memoized calculation function for better performance
  const calculateDimensions = useCallback((): Dimensions => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const orientation = determineOrientation(windowWidth, windowHeight);
    const aspectRatio = calculateAspectRatio(windowWidth, windowHeight);
    const deviceType = classifyDeviceType(windowWidth);
    const screenSize = determineScreenSize(windowWidth);
    const foldable = detectFoldableDevice(windowWidth, windowHeight, aspectRatio);
    
    return {
      width: windowWidth,
      height: windowHeight,
      ...orientation,
      aspectRatio,
      deviceType,
      screenSize,
      foldable,
    };
  }, []);

  const [dimensions, setDimensions] = useState<Dimensions>(calculateDimensions);

  useEffect(() => {
    // Throttled resize handler for better performance
    let timeoutId: ReturnType<typeof setTimeout>;
    let animationId: number;
    
    const handleResize = () => {
      // Cancel any pending updates
      clearTimeout(timeoutId);
      if (animationId) cancelAnimationFrame(animationId);
      
      // Use requestAnimationFrame for smooth updates
      animationId = requestAnimationFrame(() => {
        // Throttle with timeout to prevent excessive calculations
        timeoutId = setTimeout(() => {
          setDimensions(calculateDimensions());
        }, 100);
      });
    };

    // Optimized orientation change handler
    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated after orientation change
      setTimeout(() => {
        setDimensions(calculateDimensions());
      }, 150);
    };

    // Event listeners
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [calculateDimensions]);

  return dimensions;
};

// Export utility functions for external use
export {
  SCREEN_BREAKPOINTS,
  DEVICE_BREAKPOINTS,
  calculateAspectRatio,
  determineOrientation,
  classifyDeviceType,
  determineScreenSize,
  detectFoldableDevice,
};

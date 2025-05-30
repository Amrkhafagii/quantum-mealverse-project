
import { useState, useEffect } from 'react';
import { Platform } from '@/utils/platform';

type Dimensions = {
  width: number;
  height: number;
  isPortrait: boolean;
  isLandscape: boolean;
  aspectRatio: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  foldable: boolean;
};

export const useScreenDimensions = (): Dimensions => {
  const getScreenDimensions = (): Dimensions => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;
    const isLandscape = !isPortrait;
    const aspectRatio = width / height;
    
    // Determine device type
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (width <= 640 || (Platform.isMobileBrowser() && width <= 768)) {
      deviceType = 'mobile';
    } else if (width <= 1024 || (Platform.isTablet() && width <= 1280)) {
      deviceType = 'tablet';
    }
    
    // Map width to screen size
    let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'xs';
    if (width >= 640) screenSize = 'sm';
    if (width >= 768) screenSize = 'md';
    if (width >= 1024) screenSize = 'lg';
    if (width >= 1280) screenSize = 'xl';
    if (width >= 1536) screenSize = '2xl';
    
    // Check if the device is likely a foldable - this is a heuristic
    // In a real app, we would use specific Android APIs for this detection
    const foldable = Platform.isAndroid() && (
      // Potential indicators of foldable devices: unusual aspect ratios, specific heights
      (aspectRatio > 1 && aspectRatio < 1.3 && width > 700 && width < 900) ||
      (width > 1200 && height < 900 && Platform.isAndroid())
    );
    
    return {
      width,
      height,
      isPortrait,
      isLandscape,
      aspectRatio,
      deviceType,
      screenSize,
      foldable
    };
  };

  const [dimensions, setDimensions] = useState<Dimensions>(getScreenDimensions());

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getScreenDimensions());
    };

    // Throttle resize events for better performance
    let resizeTimer: ReturnType<typeof setTimeout>;
    
    const throttledResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', throttledResize);
    
    // For orientation change on mobile devices
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return dimensions;
};

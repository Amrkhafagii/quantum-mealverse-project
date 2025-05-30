
import { useState, useEffect } from 'react';
import { useResponsive } from '../ResponsiveContext';
import { Platform } from '../../utils/platform';

export type DeviceOrientationType = 'portrait' | 'landscape' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';

interface UseDeviceOrientationReturn {
  orientation: DeviceOrientationType;
  isPortrait: boolean;
  isLandscape: boolean;
  angle: number | null;
}

export const useDeviceOrientation = (): UseDeviceOrientationReturn => {
  const { isLandscape } = useResponsive();
  const [orientation, setOrientation] = useState<DeviceOrientationType>('portrait');
  const [angle, setAngle] = useState<number | null>(null);

  useEffect(() => {
    // Set initial values based on screen dimensions
    setOrientation(isLandscape ? 'landscape' : 'portrait');
    
    // Only use the device orientation API if on a mobile device
    if (Platform.isNative() || Platform.isMobileBrowser()) {
      const handleOrientationChange = () => {
        // For iOS and Android through Capacitor
        if (Platform.isNative() && window.screen.orientation) {
          const currentOrientation = window.screen.orientation.type;
          const currentAngle = window.screen.orientation.angle;
          
          // Map the type to our simplified types
          let orientationType: DeviceOrientationType = 'portrait';
          
          if (currentOrientation.includes('portrait')) {
            orientationType = currentOrientation.includes('secondary') 
              ? 'portrait-secondary' 
              : 'portrait-primary';
          } else if (currentOrientation.includes('landscape')) {
            orientationType = currentOrientation.includes('secondary') 
              ? 'landscape-secondary' 
              : 'landscape-primary';
          }
          
          setOrientation(orientationType);
          setAngle(currentAngle);
        } else {
          // Fallback method
          const width = window.innerWidth;
          const height = window.innerHeight;
          
          const isLandscape = width > height;
          setOrientation(isLandscape ? 'landscape' : 'portrait');
          setAngle(isLandscape ? 90 : 0); // Approximation
        }
      };
      
      // Check orientation immediately
      handleOrientationChange();
      
      // Listen for orientation change events
      window.addEventListener('orientationchange', handleOrientationChange);
      
      // Window resize can also indicate orientation change on some devices
      window.addEventListener('resize', handleOrientationChange);
      
      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleOrientationChange);
      };
    }
  }, [isLandscape]);

  return {
    orientation,
    isPortrait: orientation.includes('portrait'),
    isLandscape: orientation.includes('landscape'),
    angle,
  };
};

export default useDeviceOrientation;

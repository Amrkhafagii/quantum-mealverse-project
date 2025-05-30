
import { useState, useEffect } from 'react';

export interface DeviceOrientationData {
  angle: number;
  orientation: 'portrait' | 'landscape';
  isPortrait: boolean;
}

export const useDeviceOrientation = (): DeviceOrientationData => {
  const [orientation, setOrientation] = useState<DeviceOrientationData>({
    angle: 0,
    orientation: 'landscape',
    isPortrait: false
  });

  useEffect(() => {
    const updateOrientation = () => {
      const angle = screen.orientation?.angle || 0;
      const isPortrait = window.innerHeight > window.innerWidth;
      
      setOrientation({
        angle,
        orientation: isPortrait ? 'portrait' : 'landscape',
        isPortrait
      });
    };

    updateOrientation();
    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);

    return () => {
      window.removeEventListener('orientationchange', updateOrientation);
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

  return orientation;
};

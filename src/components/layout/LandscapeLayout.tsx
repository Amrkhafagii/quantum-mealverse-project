
import React, { useEffect } from 'react';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { Platform } from '@/utils/platform';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface LandscapeLayoutProps {
  children: React.ReactNode;
  landscapeContent?: React.ReactNode;
  enforcePortrait?: boolean;
  className?: string;
}

export const LandscapeLayout: React.FC<LandscapeLayoutProps> = ({
  children,
  landscapeContent,
  enforcePortrait = false,
  className = '',
}) => {
  const { orientation, isLandscape } = useDeviceOrientation();
  const { isMobile, isPlatformIOS, isPlatformAndroid } = useResponsive();
  
  useEffect(() => {
    // On native platforms, we could use screen orientation APIs to lock/unlock orientation
    if (enforcePortrait && Platform.isNative() && isLandscape) {
      console.log('Would lock screen to portrait on native device');
      
      // In a real implementation with Capacitor:
      // import { ScreenOrientation } from '@capacitor/screen-orientation';
      // await ScreenOrientation.lock({ orientation: 'portrait' });
      
      return () => {
        console.log('Would unlock screen orientation on unmount');
        // await ScreenOrientation.unlock();
      };
    }
  }, [enforcePortrait, isLandscape]);
  
  // Show rotation message for mobile devices in landscape when enforcePortrait is true
  if (enforcePortrait && isLandscape && isMobile) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 z-50">
        <div className="text-center">
          <RotateCcw className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <h2 className="text-xl font-semibold mb-2">Please Rotate Your Device</h2>
          <p className="text-muted-foreground mb-6">
            This content is optimized for portrait mode.
          </p>
          
          {/* Button for platforms that support orientation unlocking */}
          {(isPlatformIOS || isPlatformAndroid) && (
            <Button 
              onClick={() => {
                console.log('Would attempt to unlock orientation');
                // await ScreenOrientation.unlock();
              }}
              variant="outline"
            >
              Continue in Landscape
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  // Use specific landscape content if provided and in landscape mode
  if (landscapeContent && isLandscape) {
    return (
      <div className={className}>
        {landscapeContent}
      </div>
    );
  }
  
  // Default rendering of children
  return <div className={className}>{children}</div>;
};

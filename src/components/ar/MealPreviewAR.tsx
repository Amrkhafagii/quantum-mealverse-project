
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Platform } from '@/utils/platform';
import { Eye, Eye3d, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface MealPreviewARProps {
  menuItemId: string;
  modelUrl?: string;
  fallbackImageUrl: string;
  name: string;
}

const MealPreviewAR: React.FC<MealPreviewARProps> = ({
  menuItemId,
  modelUrl,
  fallbackImageUrl,
  name,
}) => {
  const [arSupported, setArSupported] = useState(false);
  const [arActive, setArActive] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check if AR is supported on this device
  useEffect(() => {
    const checkArSupport = async () => {
      // On web, check for WebXR support
      if (Platform.isWeb) {
        const supported = 'xr' in navigator && 'isSessionSupported' in (navigator as any).xr;
        
        if (supported) {
          try {
            const isSupported = await (navigator as any).xr.isSessionSupported('immersive-ar');
            setArSupported(isSupported);
          } catch (e) {
            console.error('Error checking AR support:', e);
            setArSupported(false);
          }
        } else {
          setArSupported(false);
        }
      } 
      // On iOS, we can use ARKit via a plugin
      else if (Platform.isIOS) {
        try {
          // For actual implementation, we'd check the device capabilities
          // This is just a placeholder
          setArSupported(true);
        } catch (e) {
          console.error('Error checking iOS AR support:', e);
          setArSupported(false);
        }
      }
      // On Android, we can use ARCore via a plugin
      else if (Platform.isAndroid) {
        try {
          // For actual implementation, we'd check for ARCore support
          // This is just a placeholder
          setArSupported(true);
        } catch (e) {
          console.error('Error checking Android AR support:', e);
          setArSupported(false);
        }
      }
    };
    
    checkArSupport();
  }, []);
  
  // Launch AR view
  const launchAR = async () => {
    setLoading(true);
    
    try {
      if (Platform.isWeb) {
        // Web implementation would use WebXR
        console.log('Launching Web AR experience');
        // Placeholder for actual WebXR implementation
        setTimeout(() => {
          setArActive(true);
          setLoading(false);
        }, 1000);
      } 
      else if (Platform.isIOS) {
        // iOS implementation would use ARKit
        console.log('Launching iOS AR experience');
        // Placeholder for actual ARKit implementation
        setTimeout(() => {
          setArActive(true);
          setLoading(false);
        }, 1000);
      }
      else if (Platform.isAndroid) {
        // Android implementation would use ARCore
        console.log('Launching Android AR experience');
        // Placeholder for actual ARCore implementation
        setTimeout(() => {
          setArActive(true);
          setLoading(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error launching AR:', error);
      setArActive(false);
      setLoading(false);
    }
  };
  
  // Exit AR view
  const exitAR = () => {
    setArActive(false);
  };
  
  // If AR is active, show the AR view
  if (arActive) {
    return (
      <div className="relative w-full h-[300px] bg-black rounded-lg overflow-hidden">
        {/* This would be replaced with actual AR content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white">AR View Active</p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={exitAR}
          className="absolute top-2 right-2 bg-black/50 text-white border-white/20"
        >
          <EyeOff className="h-4 w-4 mr-1" />
          Exit AR
        </Button>
      </div>
    );
  }
  
  // Show regular preview with AR button if supported
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative">
        <img 
          src={fallbackImageUrl} 
          alt={name} 
          className="w-full h-[200px] object-cover"
        />
        
        {arSupported && (
          <Button
            variant="outline"
            size="sm"
            onClick={launchAR}
            disabled={loading}
            className="absolute bottom-2 right-2 bg-white/80 border-gray-200"
          >
            {loading ? (
              <span className="flex items-center">Loading AR...</span>
            ) : (
              <>
                <Eye3d className="h-4 w-4 mr-1" />
                View in AR
              </>
            )}
          </Button>
        )}
      </CardContent>
      
      {!arSupported && modelUrl && (
        <Alert variant="default" className="mt-2">
          <AlertTitle className="text-sm font-semibold">AR Not Available</AlertTitle>
          <AlertDescription className="text-xs">
            AR preview is not supported on your current device or browser.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};

export default MealPreviewAR;

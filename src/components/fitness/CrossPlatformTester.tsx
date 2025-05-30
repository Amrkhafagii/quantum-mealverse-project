
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  Tablet, 
  Monitor,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  RotateCcw,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useResponsive } from '@/responsive/core/ResponsiveContext';
import { useDeviceOrientation } from '@/responsive/core/hooks/useDeviceOrientation';
import { useNetworkQuality } from '@/responsive/core/hooks';
import { Platform } from '@/responsive/utils/platform';

const CrossPlatformTester: React.FC = () => {
  const { 
    screenSize, 
    isPlatformIOS, 
    isPlatformAndroid, 
    isMobile, 
    isTablet,
    isLandscape 
  } = useResponsive();
  
  const { orientation, isPortrait, angle } = useDeviceOrientation();
  const { quality, metrics } = useNetworkQuality();
  
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Battery API (if available)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }).catch(() => {
        // Battery API not supported
      });
    }

    // Network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const resetTests = () => {
    window.location.reload();
  };

  const getPlatformIcon = () => {
    if (isMobile && !isTablet) return Smartphone;
    if (isTablet) return Tablet;
    return Monitor;
  };

  const PlatformIcon = getPlatformIcon();

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlatformIcon className="h-5 w-5" />
            Cross-Platform Testing Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Platform Detection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant={isPlatformIOS ? "default" : "secondary"}>
                    iOS: {isPlatformIOS ? "Yes" : "No"}
                  </Badge>
                  <Badge variant={isPlatformAndroid ? "default" : "secondary"}>
                    Android: {isPlatformAndroid ? "Yes" : "No"}
                  </Badge>
                  <Badge variant={Platform.isWeb() ? "default" : "secondary"}>
                    Web: {Platform.isWeb() ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Device Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant={isMobile ? "default" : "secondary"}>
                    Mobile: {isMobile ? "Yes" : "No"}
                  </Badge>
                  <Badge variant={isTablet ? "default" : "secondary"}>
                    Tablet: {isTablet ? "Yes" : "No"}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Screen: {screenSize}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Orientation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant={isPortrait ? "default" : "secondary"}>
                    Portrait: {isPortrait ? "Yes" : "No"}
                  </Badge>
                  <Badge variant={isLandscape ? "default" : "secondary"}>
                    Landscape: {isLandscape ? "Yes" : "No"}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Angle: {angle !== null ? `${angle}°` : "Unknown"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Network Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span>{isOnline ? "Online" : "Offline"}</span>
                  </div>
                  <Badge variant="outline">
                    Quality: {quality}
                  </Badge>
                  {metrics.latency && (
                    <p className="text-sm text-muted-foreground">
                      Latency: {metrics.latency}ms
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Battery className="h-4 w-4" />
                  Device Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {batteryLevel !== null ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {batteryLevel < 20 ? (
                          <BatteryLow className="h-4 w-4 text-red-500" />
                        ) : (
                          <Battery className="h-4 w-4 text-green-500" />
                        )}
                        <span>{batteryLevel}%</span>
                      </div>
                      <Progress value={batteryLevel} className="h-2" />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Battery info unavailable
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Controls */}
          <div className="flex gap-2">
            <Button onClick={resetTests} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Tests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossPlatformTester;

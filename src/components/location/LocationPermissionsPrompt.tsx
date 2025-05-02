
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, HelpCircle } from 'lucide-react';
import { useLocationPermission } from '@/hooks/useLocationPermission';

interface LocationPermissionsPromptProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  dismissable?: boolean;
  onDismiss?: () => void;
  compact?: boolean;
}

const LocationPermissionsPrompt: React.FC<LocationPermissionsPromptProps> = ({
  onPermissionGranted,
  onPermissionDenied,
  dismissable = true,
  onDismiss,
  compact = false
}) => {
  const { requestPermission, isRequesting, permissionStatus } = useLocationPermission();

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result && onPermissionGranted) {
      onPermissionGranted();
    } else if (!result && onPermissionDenied) {
      onPermissionDenied();
    }
  };

  if (permissionStatus === 'granted') {
    return null;
  }

  return (
    <Card className={compact ? "border-quantum-cyan/20" : "holographic-card"}>
      <CardHeader className={compact ? "p-4" : "p-6"}>
        <CardTitle className="flex items-center gap-2 text-quantum-cyan">
          <MapPin className="h-5 w-5" />
          Enable Location Services
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? "p-4 pt-0" : "p-6 pt-0"}>
        <div className="space-y-4">
          <p className="text-gray-300">
            We need your location to find restaurants near you and provide personalized meal recommendations.
          </p>
          
          {permissionStatus === 'denied' && (
            <div className="bg-red-900/20 border border-red-700/30 rounded-md p-3 text-sm">
              <div className="flex gap-2">
                <HelpCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p>
                  Location access is denied. Please enable location services in your browser settings to see nearby restaurants.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className={compact ? "p-4 pt-0 flex justify-between" : "p-6 pt-0 flex justify-between"}>
        <div className="flex gap-2">
          <Button
            onClick={handleRequestPermission}
            disabled={isRequesting || permissionStatus === 'denied'}
            className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black"
          >
            {isRequesting ? 'Requesting...' : 'Enable Location'}
          </Button>
          
          {dismissable && (
            <Button
              variant="ghost"
              onClick={onDismiss}
              className="border border-gray-700"
            >
              Not Now
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default LocationPermissionsPrompt;

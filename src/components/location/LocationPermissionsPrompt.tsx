
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertCircle } from 'lucide-react';

interface LocationPermissionsPromptProps {
  onRequestPermission: () => Promise<boolean>;
  isLoading: boolean;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  onDismiss?: () => void;
}

const LocationPermissionsPrompt: React.FC<LocationPermissionsPromptProps> = ({
  onRequestPermission,
  isLoading,
  onPermissionGranted,
  onPermissionDenied,
  onDismiss
}) => {
  const handleRequestPermission = async () => {
    try {
      const result = await onRequestPermission();
      if (result && onPermissionGranted) {
        onPermissionGranted();
      } else if (!result && onPermissionDenied) {
        onPermissionDenied();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      if (onPermissionDenied) {
        onPermissionDenied();
      }
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          Location Permission Required
        </CardTitle>
        <CardDescription className="text-orange-700">
          We need access to your location to show nearby restaurants and provide accurate delivery estimates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button 
            onClick={handleRequestPermission}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {isLoading ? 'Requesting...' : 'Enable Location Services'}
          </Button>
          {onDismiss && (
            <Button 
              variant="outline" 
              onClick={onDismiss}
              disabled={isLoading}
            >
              Skip
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPermissionsPrompt;

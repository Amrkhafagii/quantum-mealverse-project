
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { LocationService, UserType } from '@/services/locationService';
import { toast } from '@/components/ui/use-toast';

interface LocationPermissionFlowProps {
  userType: UserType;
  userId: string;
  onSuccess?: (coordinates: { latitude: number; longitude: number }) => void;
  onError?: (error: string) => void;
  onSkip?: () => void;
  autoRequest?: boolean;
}

export const LocationPermissionFlow: React.FC<LocationPermissionFlowProps> = ({
  userType,
  userId,
  onSuccess,
  onError,
  onSkip,
  autoRequest = false
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const getUserTypeMessage = () => {
    switch (userType) {
      case 'restaurant':
        return {
          title: 'Set Restaurant Location',
          description: 'We need your restaurant\'s location to help customers find you and enable delivery services.',
          buttonText: 'Share Restaurant Location'
        };
      case 'delivery':
        return {
          title: 'Enable Location Tracking',
          description: 'Location access is required for delivery assignments, route optimization, and tracking.',
          buttonText: 'Enable Location Services'
        };
      case 'customer':
        return {
          title: 'Find Nearby Restaurants',
          description: 'Share your location to discover restaurants near you and get accurate delivery estimates.',
          buttonText: 'Share My Location'
        };
      default:
        return {
          title: 'Location Permission',
          description: 'This app needs location access to provide location-based services.',
          buttonText: 'Enable Location'
        };
    }
  };

  const handleLocationRequest = async () => {
    if (isRequesting || permissionGranted) return;

    setIsRequesting(true);
    setPermissionDenied(false);

    try {
      console.log(`Requesting location permission for ${userType} user:`, userId);
      
      const coordinates = await LocationService.requestLocationAndUpdate(userType, userId);
      
      setPermissionGranted(true);
      setIsRequesting(false);
      
      toast({
        title: 'Location Updated',
        description: 'Your location has been successfully saved.',
      });

      if (onSuccess) {
        onSuccess(coordinates);
      }
    } catch (error: any) {
      console.error('Location permission request failed:', error);
      
      setPermissionDenied(true);
      setIsRequesting(false);
      
      const errorMessage = error.message || 'Failed to get location permission';
      
      toast({
        title: 'Location Permission Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      if (onError) {
        onError(errorMessage);
      }
    }
  };

  // Auto-request location on mount if specified
  React.useEffect(() => {
    if (autoRequest && !permissionGranted && !permissionDenied && !isRequesting) {
      handleLocationRequest();
    }
  }, [autoRequest, permissionGranted, permissionDenied, isRequesting]);

  const messages = getUserTypeMessage();

  // Don't render if permission already granted
  if (permissionGranted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Location successfully saved!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-quantum-cyan/20 bg-quantum-black/80 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-quantum-cyan">
          <MapPin className="h-5 w-5" />
          {messages.title}
        </CardTitle>
        <CardDescription className="text-gray-300">
          {messages.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissionDenied && (
          <div className="flex items-start gap-2 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-300">
              <p className="font-medium mb-1">Location permission denied</p>
              <p>You can still use the app, but some features may be limited. You can enable location services later in your settings.</p>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={handleLocationRequest}
            disabled={isRequesting}
            className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black flex-1"
          >
            {isRequesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                {messages.buttonText}
              </>
            )}
          </Button>
          
          {onSkip && (
            <Button
              variant="outline"
              onClick={onSkip}
              disabled={isRequesting}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Skip
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

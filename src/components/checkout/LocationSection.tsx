
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { useToast } from "@/components/ui/use-toast";
import { MapPin, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LocationSectionProps {
  onLocationUpdate: (location: { latitude: number; longitude: number }) => void;
  required?: boolean;
}

export const LocationSection = ({ onLocationUpdate, required = true }: LocationSectionProps) => {
  const { 
    location, 
    error, 
    isGettingLocation, 
    getCurrentLocation, 
    locationIsValid, 
    isLocationStale, 
    permissionStatus,
    hasInitialized 
  } = useLocationTracker();
  
  const [hasAttemptedLocation, setHasAttemptedLocation] = useState(false);
  const { toast } = useToast();

  // Update parent when location changes
  useEffect(() => {
    if (location && locationIsValid() && !isGettingLocation) {
      onLocationUpdate(location);
    }
  }, [location, locationIsValid, onLocationUpdate, isGettingLocation]);

  // Handle location button click
  const handleGetLocation = useCallback(async () => {
    if (isGettingLocation) return;
    
    setHasAttemptedLocation(true);
    
    try {
      const newLocation = await getCurrentLocation();
      if (newLocation && newLocation.latitude && newLocation.longitude) {
        onLocationUpdate(newLocation);
        toast({
          title: "Location updated",
          description: "Your current location has been saved.",
        });
      }
    } catch (error: any) {
      console.error("Location error:", error);
      toast({
        title: "Location error",
        description: error.message || "We couldn't get your location. Please try again.",
        variant: "destructive"
      });
    }
  }, [getCurrentLocation, onLocationUpdate, toast, isGettingLocation]);

  // Determine what to show
  const hasValidLocation = locationIsValid();
  const shouldShowError = hasAttemptedLocation && error && !hasValidLocation;
  const shouldShowPermissionDenied = permissionStatus === 'denied' && hasAttemptedLocation;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <MapPin className="mr-1 h-5 w-5" />
          Location
          {required && !hasValidLocation && <span className="text-red-500 ml-1">*</span>}
        </h3>
        <Button
          onClick={handleGetLocation}
          className="cyber-button"
          type="button"
          size="lg"
          disabled={isGettingLocation || !hasInitialized}
        >
          {isGettingLocation ? (
            <span className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Getting Location...
            </span>
          ) : (
            hasValidLocation ? "Update Location" : "Get Current Location"
          )}
        </Button>
      </div>
      
      {shouldShowPermissionDenied && (
        <Alert variant="destructive" className="border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            Location access denied. Please enable location services in your browser settings and refresh the page.
          </AlertDescription>
        </Alert>
      )}
      
      {shouldShowError && !shouldShowPermissionDenied && (
        <Alert variant="destructive" className="border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {hasValidLocation ? (
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <div>
            <p className="text-sm text-green-400">
              Location saved: {location!.latitude.toFixed(6)}, {location!.longitude.toFixed(6)}
            </p>
            {isLocationStale() && (
              <p className="text-sm text-yellow-400 mt-1">
                Warning: Your location data is outdated. Consider updating.
              </p>
            )}
          </div>
        </div>
      ) : (
        required && hasAttemptedLocation && !shouldShowError && !shouldShowPermissionDenied && (
          <Alert variant="destructive" className="border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              Location is required to continue with delivery
            </AlertDescription>
          </Alert>
        )
      )}
    </div>
  );
};

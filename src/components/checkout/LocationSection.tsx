
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { useToast } from "@/components/ui/use-toast";
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LocationSectionProps {
  onLocationUpdate: (location: { latitude: number; longitude: number }) => void;
  required?: boolean;
}

export const LocationSection = ({ onLocationUpdate, required = true }: LocationSectionProps) => {
  const { location, getCurrentLocation, locationIsValid, isLocationStale, permissionStatus } = useLocationTracker();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  // Use a more efficient useEffect implementation
  useEffect(() => {
    if (location && locationIsValid() && !isGettingLocation) {
      onLocationUpdate(location);
    }
  }, [location, locationIsValid, onLocationUpdate, isGettingLocation]);

  // Memoize handler to prevent unnecessary rerenders
  const handleGetLocation = useCallback(async () => {
    if (isGettingLocation) return;
    
    setIsGettingLocation(true);
    try {
      const newLocation = await getCurrentLocation();
      if (newLocation && newLocation.latitude && newLocation.longitude) {
        onLocationUpdate(newLocation);
        toast({
          title: "Location updated",
          description: "Your current location has been saved.",
        });
      } else {
        toast({
          title: "Location error",
          description: "Could not get valid location coordinates. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Location error:", error);
      toast({
        title: "Location error",
        description: error.message || "We couldn't get your location. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  }, [getCurrentLocation, onLocationUpdate, toast, isGettingLocation]);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <MapPin className="mr-1 h-5 w-5" />
          Location
          {required && !locationIsValid() && <span className="text-red-500 ml-1">*</span>}
        </h3>
        <Button
          onClick={handleGetLocation}
          className="cyber-button"
          type="button"
          size="lg"
          disabled={isGettingLocation}
        >
          {isGettingLocation ? (
            <span className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Getting Location...
            </span>
          ) : (
            location && locationIsValid() ? "Update Location" : "Get Current Location"
          )}
        </Button>
      </div>
      
      {permissionStatus === 'denied' && (
        <Alert variant="destructive" className="border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            Location access denied. Please enable location services in your browser settings.
          </AlertDescription>
        </Alert>
      )}
      
      {location && locationIsValid() ? (
        <div>
          <p className="text-sm text-green-400">
            Location saved: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
          {isLocationStale() && (
            <p className="text-sm text-yellow-400 mt-1">
              Warning: Your location data is outdated. Consider updating.
            </p>
          )}
        </div>
      ) : (
        required ? (
          <Alert variant="destructive" className="border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {required ? "Location is required to continue with delivery" : "Please set your current location"}
            </AlertDescription>
          </Alert>
        ) : null
      )}
    </div>
  );
};

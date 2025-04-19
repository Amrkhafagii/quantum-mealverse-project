
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { useToast } from "@/components/ui/use-toast";
import { MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LocationSectionProps {
  onLocationUpdate: (location: { latitude: number; longitude: number }) => void;
  required?: boolean;
}

export const LocationSection = ({ onLocationUpdate, required = true }: LocationSectionProps) => {
  const { location, getCurrentLocation, locationIsValid } = useLocationTracker();
  const { toast } = useToast();

  // Initialize with existing location if available
  useEffect(() => {
    if (location && locationIsValid()) {
      // Pass the existing location to the parent component on mount
      console.log("[Place Order Debug] Using existing location on mount:", location);
      onLocationUpdate(location);
    } else if (required) {
      console.log("[Place Order Debug] No location found, will prompt user to set location");
    }
  }, [location, locationIsValid, onLocationUpdate, required]);

  const handleGetLocation = async () => {
    try {
      const newLocation = await getCurrentLocation();
      console.log("[Place Order Debug] Got new location:", newLocation);
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
      console.error("[Place Order Debug] Error getting location:", error);
      toast({
        title: "Location error",
        description: "We couldn't get your location. Please try again.",
        variant: "destructive"
      });
    }
  };

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
        >
          {location && locationIsValid() ? "Update Location" : "Get Current Location"}
        </Button>
      </div>
      
      {location && locationIsValid() ? (
        <p className="text-sm text-green-400">
          Location saved: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </p>
      ) : (
        <Alert variant="destructive" className="border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {required ? "Location is required to continue with delivery" : "Please set your current location"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

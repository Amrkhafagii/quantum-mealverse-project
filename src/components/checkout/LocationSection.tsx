
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

  // Initialize with default location if none is found
  useEffect(() => {
    if (!location && required) {
      // Set a default location if none exists and it's required
      const defaultLocation = { latitude: 34.052235, longitude: -118.243683 }; // Default LA coordinates
      onLocationUpdate(defaultLocation);
      console.log("[Place Order Debug] Setting default location:", defaultLocation);
    } else if (location) {
      // Ensure we pass the existing location to the parent component on mount
      onLocationUpdate(location);
      console.log("[Place Order Debug] Using existing location:", location);
    }
  }, []);

  const handleGetLocation = async () => {
    try {
      const newLocation = await getCurrentLocation();
      onLocationUpdate(newLocation);
      toast({
        title: "Location updated",
        description: "Your current location has been saved.",
      });
    } catch (error: any) {
      // If location service fails, set a default location
      const defaultLocation = { latitude: 34.052235, longitude: -118.243683 }; // Default LA coordinates
      onLocationUpdate(defaultLocation);
      console.log("[Place Order Debug] Setting default location after error:", defaultLocation);
      
      toast({
        title: "Location approximated",
        description: "We couldn't get your exact location. An approximate location has been set.",
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

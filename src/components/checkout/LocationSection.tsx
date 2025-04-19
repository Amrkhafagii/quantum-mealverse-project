
import React from 'react';
import { Button } from "@/components/ui/button";
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { useToast } from "@/components/ui/use-toast";
import { MapPin } from 'lucide-react';

interface LocationSectionProps {
  onLocationUpdate: (location: { latitude: number; longitude: number }) => void;
  required?: boolean;
}

export const LocationSection = ({ onLocationUpdate, required = true }: LocationSectionProps) => {
  const { location, getCurrentLocation, locationIsValid } = useLocationTracker();
  const { toast } = useToast();

  const handleGetLocation = async () => {
    try {
      const newLocation = await getCurrentLocation();
      onLocationUpdate(newLocation);
      toast({
        title: "Location updated",
        description: "Your current location has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Location error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold flex items-center">
          <MapPin className="mr-1 h-5 w-5" />
          Location
          {required && !locationIsValid() && <span className="text-red-500 ml-1">*</span>}
        </h3>
        <Button
          onClick={handleGetLocation}
          className="cyber-button"
          type="button"
        >
          {location && locationIsValid() ? "Update Location" : "Get Current Location"}
        </Button>
      </div>
      {location && locationIsValid() && (
        <p className="text-sm text-green-400">
          Location saved: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </p>
      )}
      {required && !locationIsValid() && (
        <p className="text-sm text-red-400">
          Current location is required for delivery
        </p>
      )}
    </div>
  );
};

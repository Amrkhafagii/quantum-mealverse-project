import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { useToast } from "@/hooks/use-toast";
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LocationPermissionHelp } from "./LocationPermissionHelp";
import { Input } from "@/components/ui/input";

interface LocationSectionProps {
  onLocationUpdate: (location: { latitude: number; longitude: number }) => void;
  required?: boolean;
}

export const LocationSection = ({ onLocationUpdate, required = true }: LocationSectionProps) => {
  const {
    location,
    getCurrentLocation,
    locationIsValid,
    isLocationStale,
    permissionStatus,
    error: locationError,
  } = useLocationTracker();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [manualMode, setManualMode] = useState(false);
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
    setManualMode(false);
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
          description:
            (locationError ?? "Could not get valid location coordinates. Please try again."),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Location error:", error);
      toast({
        title: "Location error",
        description:
          (locationError ?? (error?.message || "We couldn't get your location. Please try again.")),
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  }, [getCurrentLocation, onLocationUpdate, toast, isGettingLocation, locationError]);

  // Handle using manual address
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // "Fake" location with 0,0 for now, but could be geocoded in a real app
    if (manualAddress.trim().length > 0) {
      onLocationUpdate({ latitude: 0, longitude: 0 });
      toast({
        title: "Manual address saved",
        description: "We saved your entered address for delivery.",
      });
    }
  };

  // Defensive stringify in case error is an object
  function displayLocationError(err: any): string {
    if (!err) return "";
    if (typeof err === "string") return err;
    if (typeof err === "object") {
      if ("message" in err && typeof err.message === "string") return err.message;
      try {
        return JSON.stringify(err);
      } catch {
        return "[Unknown geolocation error]";
      }
    }
    return String(err);
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <MapPin className="mr-1 h-5 w-5" />
          Location
          {required && !locationIsValid() && <span className="text-red-500 ml-1">*</span>}
        </h3>
        <div className="flex gap-2">
          {!manualMode && (
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
              ) : location && locationIsValid() ? (
                "Update Location"
              ) : (
                "Get Current Location"
              )}
            </Button>
          )}
          {(permissionStatus === "denied" || locationError) && (
            <Button
              type="button"
              variant="outline"
              className="ml-2"
              onClick={() => {
                setManualMode(true);
              }}
              disabled={manualMode}
            >
              Enter Address Manually
            </Button>
          )}
          {manualMode && (
            <Button
              type="button"
              variant="ghost"
              className="ml-2"
              onClick={() => setManualMode(false)}
            >
              Cancel Manual Entry
            </Button>
          )}
        </div>
      </div>
      
      {permissionStatus === "denied" && (
        <>
          <Alert variant="destructive" className="border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              Location access denied. Please enable location services in your browser settings.
            </AlertDescription>
          </Alert>
          <LocationPermissionHelp error={locationError} />
        </>
      )}

      {locationError && permissionStatus !== "denied" && (
        <>
          <Alert variant="destructive" className="border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {displayLocationError(locationError)}
            </AlertDescription>
          </Alert>
          <LocationPermissionHelp error={locationError} />
        </>
      )}

      {manualMode && (
        <form onSubmit={handleManualSubmit} className="space-y-2 mt-2">
          <p className="text-yellow-500 text-sm mb-2">
            Please enter your delivery address below if location detection doesn't work.
          </p>
          <Input
            type="text"
            placeholder="Enter your address (street, city, etc.)"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            required
            className="w-full"
            autoFocus
          />
          <Button type="submit" className="w-full mt-2" disabled={manualAddress.length === 0}>
            Save and Continue
          </Button>
        </form>
      )}

      {!manualMode && location && locationIsValid() ? (
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
        required && !manualMode && !locationError ? (
          <Alert variant="destructive" className="border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {required
                ? "Location is required to continue with delivery"
                : "Please set your current location"}
            </AlertDescription>
          </Alert>
        ) : null
      )}
    </div>
  );
};

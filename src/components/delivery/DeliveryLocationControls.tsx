import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDeliveryLocationService } from '@/hooks/useDeliveryLocationService';
import { MapPin, AlertCircle, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useDeliveryMap } from '@/contexts/DeliveryMapContext';
import { toast } from 'sonner';

interface DeliveryLocationControlsProps {
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void;
  required?: boolean;
  showHelp?: boolean;
}

export const DeliveryLocationControls: React.FC<DeliveryLocationControlsProps> = ({
  onLocationUpdate,
  required = true,
  showHelp = false
}) => {
  const { 
    location,
    permissionStatus,
    isStale,
    freshness,
    lastUpdated,
    updateLocation,
    resetAndRequestLocation,
    isUpdating,
    error,
    isTracking
  } = useDeliveryLocationService();
  
  const { updateDriverLocation } = useDeliveryMap();
  
  // Log when component mounts and whenever key props change
  useEffect(() => {
    console.log('DeliveryLocationControls: Mounted/Updated with props:', {
      hasOnLocationUpdate: !!onLocationUpdate,
      required,
      showHelp,
      currentLocation: location,
      permissionStatus,
      isTracking
    });
  }, [onLocationUpdate, required, showHelp, location, permissionStatus, isTracking]);
  
  // Update driver location on map when location changes
  useEffect(() => {
    if (location) {
      if (updateDriverLocation) {
        updateDriverLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          title: 'Your location',
          type: 'driver'
        });
      }
      
      if (onLocationUpdate) {
        console.log('DeliveryLocationControls: Calling onLocationUpdate with location', location);
        onLocationUpdate({
          latitude: location.latitude,
          longitude: location.longitude
        });
      } else {
        console.log('DeliveryLocationControls: No onLocationUpdate callback provided');
      }
    }
  }, [location, updateDriverLocation, onLocationUpdate]);

  const handleUpdateLocation = async () => {
    try {
      // Show loading toast immediately
      toast.loading('Updating your location...');
      console.log('DeliveryLocationControls: Updating location');
      
      // Call update location
      const result = await updateLocation();
      
      if (result) {
        console.log('DeliveryLocationControls: Location updated successfully', result);
        toast.success('Location updated successfully');
        
        // If we have an onLocationUpdate callback, call it with the new location
        if (onLocationUpdate && result) {
          console.log('DeliveryLocationControls: Calling onLocationUpdate after successful update', {
            latitude: result.latitude,
            longitude: result.longitude
          });
          onLocationUpdate({
            latitude: result.latitude,
            longitude: result.longitude
          });
        } else {
          console.log('DeliveryLocationControls: No onLocationUpdate callback to call');
        }
      } else if (error) {
        const errorMsg = typeof error === 'string' ? error : 'Failed to update location';
        toast.error(errorMsg);
        console.error('Location update failed with error:', error);
      } else {
        toast.warning('Location update timed out. Try again.');
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Unknown error updating location');
      console.error('Exception during location update:', err);
      toast.error('Error: ' + err.message);
    }
  };
  
  const handleForceReset = async () => {
    try {
      toast.loading('Resetting location services...');
      console.log('DeliveryLocationControls: Force resetting location');
      
      const result = await resetAndRequestLocation();
      
      // Check if result is a valid location object
      if (result && 'latitude' in result && 'longitude' in result) {
        console.log('DeliveryLocationControls: Location services reset successfully', result);
        toast.success('Location services reset successfully');
        
        // If we have an onLocationUpdate callback, call it with the new location
        if (onLocationUpdate) {
          console.log('DeliveryLocationControls: Calling onLocationUpdate after reset with', {
            latitude: result.latitude,
            longitude: result.longitude
          });
          onLocationUpdate({
            latitude: result.latitude,
            longitude: result.longitude
          });
        } else {
          console.log('DeliveryLocationControls: No onLocationUpdate callback to call after reset');
        }
      } else {
        toast.warning('Reset completed, but no location obtained');
      }
    } catch (e) {
      console.error('Error during location reset:', e);
      const errorMsg = e instanceof Error ? e.message : 'Failed to reset location services';
      toast.error(errorMsg);
    }
  };

  const getStatusColor = () => {
    switch (freshness) {
      case 'fresh': return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'moderate': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'stale': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'invalid': return 'bg-red-500/20 border-red-500/30 text-red-400';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  const renderFreshnessIcon = () => {
    switch (freshness) {
      case 'fresh': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'moderate': return <MapPin className="h-4 w-4 text-blue-500" />;
      case 'stale': return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      case 'invalid': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <MapPin className="mr-1 h-5 w-5" />
          Delivery Location
          {required && (!location || isStale) && <span className="text-red-500 ml-1">*</span>}
        </h3>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleUpdateLocation}
            className={`cyber-button ${isStale ? 'bg-quantum-cyan' : ''}`}
            type="button"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </span>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Location
              </>
            )}
          </Button>
          
          {/* Only show reset button when there's an error or permission issues */}
          {(permissionStatus === 'denied' || error) && (
            <Button
              onClick={handleForceReset}
              variant="outline"
              type="button"
              disabled={isUpdating}
            >
              Reset & Fix
            </Button>
          )}
        </div>
      </div>
      
      {/* Permission denied warning */}
      <AnimatePresence>
        {permissionStatus === 'denied' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert variant="destructive" className="border-red-500 bg-red-500/10 mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                <div className="space-y-2">
                  <p>Location access is required for delivery services.</p>
                  <div className="text-sm space-y-1">
                    <p className="font-bold">To fix this issue:</p>
                    <p>1. Click the lock/info icon in your browser address bar</p>
                    <p>2. Enable location access for this site</p>
                    <p>3. Refresh the page</p>
                    <p>4. Click "Reset & Fix" button above</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Location status display */}
      {location ? (
        <div></div>
      ) : (
        <Alert variant={required ? "destructive" : "default"} className={required ? "border-red-500 bg-red-500/10" : ""}>
          <MapPin className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {required 
              ? "Your location is required to receive and complete deliveries" 
              : "Please set your current location"}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Other errors */}
      <AnimatePresence>
        {error && !isUpdating && permissionStatus !== 'denied' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert variant="destructive" className="border-amber-500 bg-amber-500/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium text-amber-200">
                {error}
                <p className="text-xs mt-1 font-normal">
                  Try the "Reset & Fix" button if this persists.
                </p>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeliveryLocationControls;

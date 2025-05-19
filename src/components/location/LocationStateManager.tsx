
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { MapPin, AlertTriangle, MapPinOff, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import LocationPromptBanner from './LocationPromptBanner';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useNavigate } from 'react-router-dom';
import { useNearestRestaurant } from '@/hooks/useNearestRestaurant';

interface LocationStateManagerProps {
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void;
  loadingContent?: React.ReactNode;
  errorContent?: React.ReactNode;
  children: React.ReactNode;
  showLoadingState?: boolean;
  autoNavigateToMenu?: boolean;
  forcePrompt?: boolean;
}

export const LocationStateManager: React.FC<LocationStateManagerProps> = ({
  onLocationUpdate,
  loadingContent,
  errorContent,
  children,
  showLoadingState = true,
  autoNavigateToMenu = false,
  forcePrompt = false
}) => {
  const { 
    location, 
    permissionStatus, 
    requestPermission, 
    isRequesting,
    toggleTracking,
    isTracking,
    hasShownInitialPrompt,
    hasInitialized,
    isLocationStale
  } = useLocationPermission();
  
  const navigate = useNavigate();
  const { nearbyRestaurants, findNearestRestaurants } = useNearestRestaurant();
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasContentLoaded, setHasContentLoaded] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Check user type from current path
  const isDeliveryUser = window.location.pathname.includes('/delivery/');

  // Check for cached location in localStorage on mount
  useEffect(() => {
    if (!hasInitialized) return;

    const cachedLocationString = localStorage.getItem('userLocation');
    
    // Determine whether to show the prompt based on:
    // 1. If forcePrompt is true, we show it unless permission is already granted
    // 2. If we're a delivery user, we always need location permission
    // 3. If we've already shown the prompt before (tracked in hasShownInitialPrompt)
    // 4. If we already have permission granted (from permission state)
    const shouldShowPrompt = (forcePrompt && permissionStatus !== 'granted') || 
                             (isDeliveryUser && permissionStatus !== 'granted') ||
                             (!hasShownInitialPrompt && permissionStatus !== 'granted');
    
    setShowPermissionPrompt(shouldShowPrompt);
    
    // If we have cached location, use it immediately
    if (cachedLocationString && !location) {
      try {
        const parsedLocation = JSON.parse(cachedLocationString);
        if (parsedLocation?.latitude && parsedLocation?.longitude) {
          if (onLocationUpdate) {
            onLocationUpdate(parsedLocation);
            
            // Trigger content loading with cached data
            setIsLoading(true);
            setTimeout(() => {
              setIsLoading(false);
              setHasContentLoaded(true);
            }, 1000);
          }
        }
      } catch (e) {
        console.error('Error parsing cached location:', e);
      }
    }
    
    setInitialCheckDone(true);
  }, [hasInitialized, location, hasShownInitialPrompt, isDeliveryUser, forcePrompt, onLocationUpdate, permissionStatus]);

  // Update location cache when location changes
  useEffect(() => {
    if (location?.coords && location.coords.latitude && location.coords.longitude) {
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      
      if (onLocationUpdate) {
        onLocationUpdate(locationData);
      }

      // Find the nearest restaurants if not a delivery user
      if (!isDeliveryUser) {
        findNearestRestaurants();
      }
      
      // Show success toast when location is first acquired
      if (!hasContentLoaded) {
        toast.success("Location acquired!", {
          description: isDeliveryUser ? 
            "Your location is now being tracked for deliveries." : 
            "Finding awesome places near you..."
        });
        
        // Simulate content loading with a brief delay
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          setHasContentLoaded(true);
        }, 1500);
      }
    }
  }, [location, hasContentLoaded, onLocationUpdate, findNearestRestaurants, isDeliveryUser]);

  // Navigate to restaurant menu when restaurants are found
  useEffect(() => {
    if (
      autoNavigateToMenu && 
      nearbyRestaurants.length > 0 && 
      !hasNavigated && 
      hasContentLoaded && 
      !isLoading
    ) {
      setHasNavigated(true);
      const firstRestaurant = nearbyRestaurants[0];
      
      // Store selected restaurant in session storage
      sessionStorage.setItem('selectedRestaurant', JSON.stringify(firstRestaurant));
      
      // Navigate to restaurant detail page with menu tab active
      navigate(`/restaurants/${firstRestaurant.restaurant_id}?tab=menu`);
      
      toast.success(`Found ${nearbyRestaurants.length} restaurants near you!`, {
        description: "Taking you to the nearest menu..."
      });
    }
  }, [nearbyRestaurants, autoNavigateToMenu, hasNavigated, hasContentLoaded, isLoading, navigate]);

  const handlePermissionGranted = async () => {
    setIsLoading(true);
    
    try {
      const result = await requestPermission();
      if (result && location) {
        toast.success("Location enabled!", {
          description: "Now we can show you nearby options"
        });
        
        // Hide permission prompt immediately after successful location access
        if (result) {
          setShowPermissionPrompt(false);
        }
      }
    } catch (error) {
      console.error('Error requesting location:', error);
      toast.error("Location error", {
        description: "We couldn't get your location. Please try again."
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  // Decide what to render based on permission state and loading
  const renderContent = () => {
    // If we're still doing initial check or initialization, show brief loading
    if (!initialCheckDone || !hasInitialized) {
      return (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="small" text="Loading location data..." />
        </div>
      );
    }
    
    // Initial case: Show permission prompt if needed
    if (permissionStatus !== 'granted' && showPermissionPrompt) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <LocationPromptBanner onPermissionGranted={handlePermissionGranted} />
        </motion.div>
      );
    }
    
    // Error case: Permission denied
    if (permissionStatus === 'denied') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="bg-quantum-darkBlue/50 border-l-4 border-red-500 p-6 rounded-md mb-6"
        >
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-4 mt-1" />
            <div>
              <h3 className="text-lg font-medium mb-2">Location access denied</h3>
              <p className="text-gray-400 mb-4">
                {isDeliveryUser ? 
                  "Location access is required for delivery services. Please enable location in your browser settings." : 
                  "You'll need to enable location access in your browser settings to see nearby restaurants."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="border-quantum-cyan/30"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                {!isDeliveryUser && (
                  <Button
                    onClick={() => setShowPermissionPrompt(false)} 
                    variant="default"
                    className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black"
                  >
                    Continue Without Location
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }
    
    // Loading state while waiting for content
    if (isLoading && showLoadingState) {
      return loadingContent || (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="large" text={isDeliveryUser ? "Initializing delivery tracking..." : "Finding places near you..."} />
          </div>
          {!isDeliveryUser && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-quantum-darkBlue/30 rounded-lg overflow-hidden">
                  <Skeleton className="h-48 bg-quantum-darkBlue/50" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 bg-quantum-darkBlue/70 mb-3" />
                    <Skeleton className="h-4 w-1/2 bg-quantum-darkBlue/70 mb-2" />
                    <Skeleton className="h-4 w-5/6 bg-quantum-darkBlue/70" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    // Add a banner if location is stale and user is a delivery person
    if (isDeliveryUser && isLocationStale() && permissionStatus === 'granted') {
      return (
        <>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-600/20 border border-amber-500/30 rounded-md p-4 mb-6 flex items-center gap-3"
          >
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <div className="flex-grow">
              <p className="text-sm">Your location data is outdated. Please refresh your location.</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500/50"
              onClick={handlePermissionGranted}
              disabled={isRequesting}
            >
              {isRequesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Update</span>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </>
      );
    }
    
    // Content with location
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {renderContent()}
    </AnimatePresence>
  );
};

export default LocationStateManager;

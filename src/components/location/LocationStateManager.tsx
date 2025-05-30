
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { MapPin, AlertTriangle, MapPinOff, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useNavigate } from 'react-router-dom';
import { useNearestRestaurant } from '@/hooks/useNearestRestaurant';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/contexts/ResponsiveContext';

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
  
  const { user } = useAuth();
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
  const isMobileDevice = isPlatformIOS || isPlatformAndroid;
  
  const navigate = useNavigate();
  const { nearbyRestaurants, findNearestRestaurants } = useNearestRestaurant();
  const [isLoading, setIsLoading] = useState(false);
  const [hasContentLoaded, setHasContentLoaded] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Check if user type from current path
  const isDeliveryUser = window.location.pathname.includes('/delivery/');

  // Check for cached location in localStorage on mount
  useEffect(() => {
    if (!hasInitialized) return;

    const cachedLocationString = localStorage.getItem('userLocation');
    
    // We're not showing location prompt banners anymore, so we skip this logic
    
    // If we have cached location, use it immediately
    if (cachedLocationString && !location && user) {
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
  }, [hasInitialized, location, hasShownInitialPrompt, isDeliveryUser, forcePrompt, onLocationUpdate, permissionStatus, user, isMobileDevice]);

  // Update location cache when location changes
  useEffect(() => {
    // Don't update anything if user is not authenticated (except for delivery users who need location)
    if (!user && !isDeliveryUser) return;

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

      // Find the nearest restaurants if not a delivery user and user is authenticated
      if (!isDeliveryUser && user) {
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
  }, [location, hasContentLoaded, onLocationUpdate, findNearestRestaurants, isDeliveryUser, user]);

  // Navigate to restaurant menu when restaurants are found
  useEffect(() => {
    if (
      autoNavigateToMenu && 
      nearbyRestaurants.length > 0 && 
      !hasNavigated && 
      hasContentLoaded && 
      !isLoading &&
      user // Only auto-navigate if user is authenticated
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
  }, [nearbyRestaurants, autoNavigateToMenu, hasNavigated, hasContentLoaded, isLoading, navigate, user]);

  const handleSignIn = () => {
    // Redirect to auth page
    navigate('/auth', { state: { referrer: '/customer' } });
    
    toast.info("Sign in required", {
      description: "Please sign in to see restaurants near you"
    });
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

    // Check if user is authenticated (unless we're in the delivery section)
    if (!user && !isDeliveryUser) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="bg-quantum-darkBlue/50 border-l-4 border-quantum-cyan p-6 rounded-md mb-6"
        >
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-quantum-cyan mr-4 mt-1" />
            <div>
              <h3 className="text-lg font-medium mb-2">Sign in required</h3>
              <p className="text-gray-400 mb-4">
                Please sign in to see restaurants and meals near you.
              </p>
              <Button 
                onClick={handleSignIn}
                className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black"
              >
                Sign In
              </Button>
            </div>
          </div>
        </motion.div>
      );
    }
    
    // Removed all location prompt UI components
    
    // Error case: Permission denied
    if (permissionStatus === 'denied' && isDeliveryUser) {
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
                Location access is required for delivery services. Please enable location in your browser settings.
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
              onClick={requestPermission}
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

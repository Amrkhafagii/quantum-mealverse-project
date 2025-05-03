
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
}

export const LocationStateManager: React.FC<LocationStateManagerProps> = ({
  onLocationUpdate,
  loadingContent,
  errorContent,
  children,
  showLoadingState = true,
  autoNavigateToMenu = false
}) => {
  const { 
    location, 
    permissionStatus, 
    requestPermission, 
    isRequesting,
    toggleTracking,
    isTracking,
    hasShownInitialPrompt
  } = useLocationPermission();
  
  const navigate = useNavigate();
  const { nearbyRestaurants, findNearestRestaurants } = useNearestRestaurant();
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasContentLoaded, setHasContentLoaded] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Check for cached location in localStorage on mount
  useEffect(() => {
    const cachedLocationString = localStorage.getItem('userLocation');
    const storedPermission = localStorage.getItem('locationPermission');
    
    // Determine if we need to show the prompt
    const shouldShowPrompt = !storedPermission || 
                             storedPermission !== 'granted' || 
                             !cachedLocationString;
    
    setShowPermissionPrompt(shouldShowPrompt && !hasShownInitialPrompt);
    
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
  }, []);

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

      // Find the nearest restaurants
      findNearestRestaurants();
      
      // Show success toast when location is first acquired
      if (!hasContentLoaded) {
        toast.success("Location acquired!", {
          description: "Finding awesome places near you..."
        });
        
        // Simulate content loading with a brief delay
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          setHasContentLoaded(true);
        }, 1500);
      }
    }
  }, [location, hasContentLoaded, onLocationUpdate, findNearestRestaurants]);

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
      }
    } catch (error) {
      console.error('Error requesting location:', error);
      toast.error("Location error", {
        description: "We couldn't get your location. Please try again."
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        // Hide permission prompt after successful location access
        if (permissionStatus === 'granted') {
          setShowPermissionPrompt(false);
        }
      }, 1000);
    }
  };

  // Decide what to render based on permission state and loading
  const renderContent = () => {
    // If we're still doing initial check, show brief loading
    if (!initialCheckDone) {
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
                You'll need to enable location access in your browser settings to see nearby restaurants.
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
                <Button
                  onClick={() => setShowPermissionPrompt(false)} 
                  variant="default"
                  className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black"
                >
                  Continue Without Location
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
            <LoadingSpinner size="large" text="Finding places near you..." />
          </div>
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
        </div>
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

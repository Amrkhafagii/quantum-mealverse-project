import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { Button } from '@/components/ui/button';
import { useNearestRestaurant } from '@/hooks/useNearestRestaurant';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import LocationStateManager from '@/components/location/LocationStateManager';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useTestMenuItemsCheck } from '@/hooks/useTestMenuItemsCheck';
import { useAutoRestaurantNavigation } from '@/hooks/useAutoRestaurantNavigation';
import { ViewToggle } from '@/components/customer/ViewToggle';
import { MainContent } from '@/components/customer/MainContent';
import { motion } from 'framer-motion';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { Platform } from '@/utils/platform';
import { logLocationDebug, clearLocationStorage, exportLocationLogs } from '@/utils/locationDebug';
import { UnifiedLocation } from '@/types/unifiedLocation';
import { DeliveryLocation } from '@/types/location';
import { getHighAccuracyLocation, getLocationErrorGuidance } from '@/utils/locationAccuracyManager';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Alert, 
  AlertTitle, 
  AlertDescription 
} from '@/components/ui/alert';
import { RefreshCcw, Bug, Save, Trash2, MapPin, AlertTriangle } from 'lucide-react';

const Customer = () => {
  const { user } = useAuth();
  const { permissionStatus, requestPermission } = useLocationPermission();
  const { getCurrentLocation: getDirectLocation } = useCurrentLocation();
  const [isMapView, setIsMapView] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0); 
  const [lastLocationUpdate, setLastLocationUpdate] = useState<null | {latitude: number, longitude: number}>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Use our enhanced nearest restaurant hook
  const { 
    nearbyRestaurants, 
    loading: loadingRestaurants,
    findNearestRestaurants,
    refreshRestaurants
  } = useNearestRestaurant();

  // Check if restaurants need test menu items
  useTestMenuItemsCheck(nearbyRestaurants);

  // Fetch menu items from nearby restaurants
  const { data: menuItems, isLoading: loadingMenuItems, error } = useMenuItems(nearbyRestaurants);
  
  // Log authentication status on component mount and auth changes
  useEffect(() => {
    console.log('Customer component - Auth state:', { 
      isAuthenticated: !!user, 
      userId: user?.id, 
      email: user?.email
    });

    // Debug log
    logLocationDebug('auth-state', {
      context: {
        isAuthenticated: !!user,
        userId: user?.id
      }
    });
  }, [user]);

  // Enhanced handler for location request using only high-accuracy sources
  const handleLocationRequest = useCallback(async () => {
    try {
      logLocationDebug('request-location-start', {
        context: { 
          isAuthenticated: !!user,
          permissionStatus
        }
      });
      
      console.log('handleLocationRequest called - requesting high accuracy location');
      toast.loading('Getting your location...');
      
      // First ensure we have location permission
      const permissionSuccess = await requestPermission();
      
      if (!permissionSuccess) {
        toast.error('Location permission denied', {
          description: 'Please enable location in your browser settings to use this feature'
        });
        setLocationError('Location permission denied. Please enable location access in your browser settings.');
        return false;
      }
      
      // Try to get high-accuracy location (GPS/WiFi only)
      const location = await getHighAccuracyLocation();
      
      if (!location) {
        toast.error('Unable to get accurate location');
        setLocationError('Could not determine your precise location. Please try again in an area with better GPS reception.');
        return false;
      }
      
      logLocationDebug('high-accuracy-location-success', { 
        context: { location } 
      });
      
      setLastLocationUpdate({
        latitude: location.latitude,
        longitude: location.longitude
      });
      
      if (user) {
        console.log('User is authenticated, finding nearby restaurants with location');
        await findNearestRestaurants(50);
        toast.success('Location updated successfully');
        setLocationError(null);
        return true;
      } else {
        console.error('Cannot find restaurants: user not authenticated');
        toast.error('You must be logged in to find restaurants');
        return false;
      }
    } catch (error: any) {
      console.error('Location request error:', error);
      const guidance = getLocationErrorGuidance(error);
      logLocationDebug('location-request-error', { error });
      toast.error('Location error', { description: guidance });
      setLocationError(guidance);
      return false;
    }
  }, [requestPermission, findNearestRestaurants, user, permissionStatus]);
  
  const handleLocationUpdate = useCallback(async (loc: UnifiedLocation | DeliveryLocation) => {
    // This will be called by LocationStateManager when location is updated
    if (loc && 'latitude' in loc && 'longitude' in loc) {
      console.log('Location updated in Customer.tsx:', loc);
      logLocationDebug('location-updated', { 
        location: loc,
        context: { component: 'Customer.tsx' } 
      });
      
      setLastLocationUpdate({
        latitude: loc.latitude,
        longitude: loc.longitude
      });
      
      try {
        // Check authentication before refreshing restaurants
        if (user) {
          console.log('User is authenticated, finding nearby restaurants with location');
          const results = await findNearestRestaurants(50);
          
          if (results && results.length > 0) {
            toast.success(`Found ${results.length} restaurants near you!`);
            setLocationError(null);
          } else {
            toast.warning('No restaurants found nearby, try a different location');
          }
          
          localStorage.setItem('autoNavigateToMenu', 'true');
          setForceRefresh(prev => prev + 1);
        } else {
          console.error('Cannot find restaurants: user not authenticated');
          toast.error('You must be logged in to find restaurants');
        }
      } catch (err) {
        console.error('Error finding restaurants after location update:', err);
        toast.error('Could not find nearby restaurants');
      }
    } else {
      console.error('Invalid location data received in handleLocationUpdate', loc);
    }
  }, [findNearestRestaurants, user]);
  
  // Add an effect to retry finding restaurants if none are found but we have location
  useEffect(() => {
    if (forceRefresh > 0 && nearbyRestaurants.length === 0 && !loadingRestaurants && lastLocationUpdate) {
      // Try again after a small delay
      const timer = setTimeout(() => {
        console.log('No restaurants found, retrying...');
        
        if (user) {
          refreshRestaurants(50);
        } else {
          console.error('Retry failed: user not authenticated');
          toast.error('Please log in to find restaurants');
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [forceRefresh, nearbyRestaurants.length, loadingRestaurants, refreshRestaurants, user, lastLocationUpdate]);

  // Log when nearby restaurants change
  useEffect(() => {
    console.log('Nearby restaurants updated:', nearbyRestaurants);
    logLocationDebug('restaurants-updated', { 
      context: { 
        count: nearbyRestaurants.length,
        restaurants: nearbyRestaurants.map(r => ({
          id: r.restaurant_id,
          name: r.restaurant_name,
          distance: r.distance_km
        }))
      } 
    });
  }, [nearbyRestaurants]);
  
  const toggleMapView = () => {
    setIsMapView(prev => !prev);
    if (!isMapView) {
      toast("Switching to map view", { icon: "🗺️" });
    } else {
      toast("Switching to list view", { icon: "📋" });
    }
  };

  const handleClearLocationStorage = async () => {
    const success = await clearLocationStorage();
    if (success) {
      toast.success("Location storage cleared", {
        description: "Please reload the page for changes to take effect"
      });
    } else {
      toast.error("Failed to clear location storage");
    }
  };

  const handleExportLogs = () => {
    if (exportLocationLogs()) {
      toast.success("Debug logs exported successfully");
    } else {
      toast.error("Failed to export debug logs");
    }
  };

  // Generate appropriate loading UI for LocationStateManager
  const loadingUI = (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-quantum-darkBlue/30 h-12 w-40 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-quantum-darkBlue/30 rounded-lg overflow-hidden">
            <div className="h-48 bg-quantum-darkBlue/50 animate-pulse"></div>
            <div className="p-4 space-y-2">
              <div className="h-6 w-3/4 bg-quantum-darkBlue/70 animate-pulse"></div>
              <div className="h-4 w-1/2 bg-quantum-darkBlue/70 animate-pulse"></div>
              <div className="h-4 w-5/6 bg-quantum-darkBlue/70 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Handle auto-navigation to first restaurant
  useAutoRestaurantNavigation(
    true, 
    nearbyRestaurants,
    true, 
    loadingMenuItems,
    user
  );

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <motion.h1 
              className="text-4xl font-bold text-quantum-cyan neon-text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Quantum Meals
            </motion.h1>
            
            <div className="flex items-center gap-2">
              <ViewToggle 
                isMapView={isMapView}
                onToggle={toggleMapView}
                showToggle={permissionStatus === 'granted'}
              />
              
              <Dialog open={showDebugPanel} onOpenChange={setShowDebugPanel}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Bug className="h-4 w-4" />
                    Debug
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Location Debugging</DialogTitle>
                    <DialogDescription>
                      Debug information and tools for troubleshooting location issues
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 bg-gray-900 p-4 rounded-md">
                        <h3 className="text-sm font-medium text-gray-400">Auth Status</h3>
                        <pre className="text-xs bg-black/50 p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify({ 
                            isAuthenticated: !!user, 
                            userId: user?.id,
                            email: user?.email 
                          }, null, 2)}
                        </pre>
                      </div>
                      
                      <div className="space-y-2 bg-gray-900 p-4 rounded-md">
                        <h3 className="text-sm font-medium text-gray-400">Location Status</h3>
                        <pre className="text-xs bg-black/50 p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify({ 
                            permissionStatus,
                            lastLocationUpdate,
                            restaurantCount: nearbyRestaurants.length,
                            loading: loadingRestaurants
                          }, null, 2)}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="space-y-2 bg-gray-900 p-4 rounded-md">
                      <h3 className="text-sm font-medium text-gray-400">Restaurants Found</h3>
                      <pre className="text-xs bg-black/50 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(nearbyRestaurants, null, 2)}
                      </pre>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button 
                        onClick={() => handleLocationRequest()}
                        className="flex items-center gap-2"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Force Location Update 
                      </Button>
                      
                      <Button 
                        onClick={handleClearLocationStorage}
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear Location Storage
                      </Button>
                      
                      <Button 
                        onClick={handleExportLogs}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Export Debug Logs
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {locationError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Location Error</AlertTitle>
              <AlertDescription>
                {locationError}
              </AlertDescription>
              <div className="mt-4">
                <Button 
                  onClick={handleLocationRequest}
                  variant="outline" 
                  size="sm"
                  className="bg-transparent text-white border-white/30"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </Alert>
          )}
          
          <ErrorBoundary>
            <LocationStateManager 
              onLocationUpdate={handleLocationUpdate}
              loadingContent={loadingUI}
              showLoadingState
              autoNavigateToMenu={true}
              forcePrompt={false}
            >
              <MainContent 
                isMapView={isMapView}
                menuItems={menuItems}
                isLoading={loadingMenuItems}
                error={error}
                nearbyRestaurants={nearbyRestaurants}
                toggleMapView={toggleMapView}
                onLocationRequest={handleLocationRequest}
              />
            </LocationStateManager>
          </ErrorBoundary>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Customer;

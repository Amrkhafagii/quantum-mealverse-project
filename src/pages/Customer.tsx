
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { RefreshCcw, Bug, Save, Trash2 } from 'lucide-react';

const Customer = () => {
  const { user } = useAuth();
  const { permissionStatus, requestPermission } = useLocationPermission();
  const { getCurrentLocation: getDirectLocation } = useCurrentLocation();
  const [isMapView, setIsMapView] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0); // Added to force refresh
  const [lastLocationUpdate, setLastLocationUpdate] = useState<null | {latitude: number, longitude: number}>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
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

  // Enhanced handler for location request with fallback and debug logging
  const handleLocationRequest = useCallback(async () => {
    try {
      logLocationDebug('request-location-start', {
        context: { 
          isAuthenticated: !!user,
          permissionStatus
        }
      });
      console.log('handleLocationRequest called - requesting user location');
      toast.loading('Requesting your location...');
      
      console.log('Authentication state before location request:', { isLoggedIn: !!user });
      
      let success = await requestPermission();
      
      logLocationDebug('request-permission-result', {
        context: { success, permissionStatus }
      });
      
      // If the primary method failed and we're on web, try the direct web implementation fallback
      if (!success && Platform.isWeb()) {
        console.log('Primary location request failed, trying direct browser implementation');
        logLocationDebug('fallback-location-attempt', { context: { method: 'direct-browser' } });
        
        const location = await getDirectLocation();
        
        logLocationDebug('fallback-location-result', { location });
        
        if (location && location.latitude && location.longitude) {
          // Manual call to find restaurants if we got location via fallback
          console.log('Got location via fallback:', location);
          setLastLocationUpdate(location);
          
          if (user) {
            console.log('User is authenticated, calling findNearestRestaurants');
            logLocationDebug('find-restaurants-call', { 
              context: { 
                via: 'fallback',
                location
              } 
            });
            
            await findNearestRestaurants(50); // Pass the maxDistance parameter (default 50km)
            toast.success('Location updated successfully');
            success = true;
          } else {
            console.error('Cannot find restaurants: user not authenticated');
            logLocationDebug('auth-error', { 
              error: 'User not authenticated when trying to find restaurants',
              context: { via: 'fallback' } 
            });
            toast.error('You must be logged in to find restaurants');
          }
        }
      }
      
      if (!success) {
        logLocationDebug('location-request-failed', { 
          error: 'Could not get location',
          context: { permissionStatus } 
        });
        toast.error('Could not get your location. Please check your browser settings.');
      }
      
      return success;
    } catch (error) {
      console.error('Location request error:', error);
      logLocationDebug('location-request-error', { error });
      toast.error('Failed to access your location');
      return false;
    }
  }, [requestPermission, getDirectLocation, findNearestRestaurants, user, permissionStatus]);
  
  const handleLocationUpdate = useCallback(async (loc: { latitude: number; longitude: number }) => {
    // This will be called by LocationStateManager when location is updated
    if (loc && loc.latitude && loc.longitude) {
      console.log('Location updated in Customer.tsx:', loc);
      logLocationDebug('location-updated', { 
        location: loc,
        context: { component: 'Customer.tsx' } 
      });
      
      setLastLocationUpdate(loc);
      
      try {
        // Check authentication before refreshing restaurants
        if (user) {
          console.log('User is authenticated, finding nearby restaurants with location:', loc);
          logLocationDebug('find-restaurants-attempt', { 
            context: { 
              userAuthenticated: true,
              location: loc 
            } 
          });
          
          // Explicitly refresh restaurants when location is updated
          console.log('Calling findNearestRestaurants with updated location');
          const results = await findNearestRestaurants(50);
          
          logLocationDebug('find-restaurants-result', { 
            context: { 
              results: results?.length || 0,
              location: loc
            } 
          });
          
          if (results && results.length > 0) {
            toast.success(`Found ${results.length} restaurants near you!`);
          } else {
            toast.warning('No restaurants found nearby, try a different location');
            logLocationDebug('no-restaurants-found', { 
              context: { 
                location: loc
              } 
            });
          }
          
          // Set the flag to auto-navigate to menu when location is first acquired
          localStorage.setItem('autoNavigateToMenu', 'true');
          
          // Force a refresh of restaurant data
          setForceRefresh(prev => prev + 1);
        } else {
          console.error('Cannot find restaurants: user not authenticated');
          logLocationDebug('auth-error', { 
            error: 'User not authenticated when trying to find restaurants',
            context: { via: 'locationUpdate' } 
          });
          toast.error('You must be logged in to find restaurants');
        }
      } catch (err) {
        console.error('Error finding restaurants after location update:', err);
        logLocationDebug('restaurant-search-error', { error: err });
        toast.error('Could not find nearby restaurants');
      }
    } else {
      console.error('Invalid location data received in handleLocationUpdate', loc);
      logLocationDebug('invalid-location-data', { 
        error: 'Invalid location data received',
        context: { location: loc } 
      });
    }
  }, [findNearestRestaurants, user]);
  
  // Add an effect to retry finding restaurants if none are found but we have location
  useEffect(() => {
    if (forceRefresh > 0 && nearbyRestaurants.length === 0 && !loadingRestaurants && lastLocationUpdate) {
      // Try again after a small delay
      const timer = setTimeout(() => {
        console.log('No restaurants found, retrying...');
        logLocationDebug('retry-find-restaurants', { 
          context: { 
            attempt: forceRefresh,
            location: lastLocationUpdate
          } 
        });
        
        if (user) {
          refreshRestaurants(50);
        } else {
          console.error('Retry failed: user not authenticated');
          logLocationDebug('auth-error', { 
            error: 'User not authenticated when trying to retry restaurant search'
          });
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
    // Show appropriate toast message
    if (!isMapView) {
      toast("Switching to map view", { 
        icon: "🗺️"
      });
    } else {
      toast("Switching to list view", { 
        icon: "📋"
      });
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
    true, // autoNavigateToMenu
    nearbyRestaurants,
    true, // hasContentLoaded
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

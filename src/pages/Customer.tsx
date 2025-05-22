
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

const Customer = () => {
  const { user } = useAuth();
  const { permissionStatus, requestPermission } = useLocationPermission();
  const { getCurrentLocation: getDirectLocation } = useCurrentLocation();
  const [isMapView, setIsMapView] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0); // Added to force refresh
  const [lastLocationUpdate, setLastLocationUpdate] = useState<null | {latitude: number, longitude: number}>(null);
  
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
  }, [user]);

  // Enhanced handler for location request with fallback
  const handleLocationRequest = useCallback(async () => {
    try {
      console.log('handleLocationRequest called - requesting user location');
      toast.loading('Requesting your location...');
      
      console.log('Authentication state before location request:', { isLoggedIn: !!user });
      
      let success = await requestPermission();
      
      // If the primary method failed and we're on web, try the direct web implementation fallback
      if (!success && Platform.isWeb()) {
        console.log('Primary location request failed, trying direct browser implementation');
        const location = await getDirectLocation();
        
        if (location && location.latitude && location.longitude) {
          // Manual call to find restaurants if we got location via fallback
          console.log('Got location via fallback:', location);
          setLastLocationUpdate(location);
          
          if (user) {
            console.log('User is authenticated, calling findNearestRestaurants');
            await findNearestRestaurants(50); // Pass the maxDistance parameter (default 50km)
            toast.success('Location updated successfully');
            success = true;
          } else {
            console.error('Cannot find restaurants: user not authenticated');
            toast.error('You must be logged in to find restaurants');
          }
        }
      }
      
      if (!success) {
        toast.error('Could not get your location. Please check your browser settings.');
      }
      
      return success;
    } catch (error) {
      console.error('Location request error:', error);
      toast.error('Failed to access your location');
      return false;
    }
  }, [requestPermission, getDirectLocation, findNearestRestaurants, user]);
  
  const handleLocationUpdate = useCallback(async (loc: { latitude: number; longitude: number }) => {
    // This will be called by LocationStateManager when location is updated
    if (loc && loc.latitude && loc.longitude) {
      console.log('Location updated in Customer.tsx:', loc);
      setLastLocationUpdate(loc);
      
      try {
        // Check authentication before refreshing restaurants
        if (user) {
          console.log('User is authenticated, finding nearby restaurants with location:', loc);
          
          // Explicitly refresh restaurants when location is updated
          console.log('Calling findNearestRestaurants with updated location');
          const results = await findNearestRestaurants(50);
          
          if (results && results.length > 0) {
            toast.success(`Found ${results.length} restaurants near you!`);
          } else {
            toast.warning('No restaurants found nearby, try a different location');
          }
          
          // Set the flag to auto-navigate to menu when location is first acquired
          localStorage.setItem('autoNavigateToMenu', 'true');
          
          // Force a refresh of restaurant data
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
            
            <ViewToggle 
              isMapView={isMapView}
              onToggle={toggleMapView}
              showToggle={permissionStatus === 'granted'}
            />
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


import React, { useState } from 'react';
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

const Customer = () => {
  const { user } = useAuth();
  const { permissionStatus, requestPermission } = useLocationPermission();
  const [isMapView, setIsMapView] = useState(false);
  
  // Use our enhanced nearest restaurant hook
  const { 
    nearbyRestaurants, 
    loading: loadingRestaurants,
    findNearestRestaurants 
  } = useNearestRestaurant();

  // Check if restaurants need test menu items
  useTestMenuItemsCheck(nearbyRestaurants);

  // Fetch menu items from nearby restaurants
  const { data: menuItems, isLoading: loadingMenuItems, error } = useMenuItems(nearbyRestaurants);
  
  const handleLocationUpdate = (loc: { latitude: number; longitude: number }) => {
    // This will be called by LocationStateManager when location is updated
    if (loc) {
      findNearestRestaurants();
      // Set the flag to auto-navigate to menu when location is first acquired
      localStorage.setItem('autoNavigateToMenu', 'true');
    }
  };
  
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
                onLocationRequest={requestPermission}
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

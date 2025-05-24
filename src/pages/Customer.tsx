import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { clearLocationStorage, exportLocationLogs } from '@/utils/locationDebug';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MainContent } from '@/components/customer/MainContent';
import { RestaurantSummary } from '@/components/customer/RestaurantSummary';
import { ViewToggle } from '@/components/customer/ViewToggle';
import { EmptyState } from '@/components/EmptyState';
import { RecommendedMeals } from '@/components/recommendations/RecommendedMeals';
import { CustomerMealGrid } from '@/components/customer/CustomerMealGrid';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { useLocationHistory } from '@/hooks/useLocationHistory';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { DeliveryLocation } from '@/types/location';
import { UnifiedLocation } from '@/types/unifiedLocation';
import { calculateDistance } from '@/utils/locationUtils';
import { downloadJsonFile } from '@/utils/fileDownloads';
import { Menu, MenuItem } from '@/types/menu';
import { Restaurant } from '@/types/restaurant';
import { LogDisplayModal } from '@/components/LogDisplayModal';
import { LocationPermissionsPrompt } from '@/components/location/LocationPermissionsPrompt';
import { LocationStateManager } from '@/components/location/LocationStateManager';
import { LocationStatusIndicator } from '@/components/location/LocationStatusIndicator';
import { LocationHistoryDashboard } from '@/components/location/LocationHistoryDashboard';
import { AdaptiveLocationTracker } from '@/components/location/AdaptiveLocationTracker';
import { LocationPromptBanner } from '@/components/location/LocationPromptBanner';

const Customer: React.FC = () => {
  const { user, signOut } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showLocationLogs, setShowLocationLogs] = useState(false);
  const [showLocationHistory, setShowLocationHistory] = useState(false);
  const [showAdaptiveTracker, setShowAdaptiveTracker] = useState(false);
  
  const { currentLocation, isLoading: locationLoading } = useCurrentLocation();
  const { locationHistory } = useLocationHistory();
  const { 
    permissionStatus, 
    requestPermission, 
    isLoading: permissionLoading 
  } = useLocationPermission();

  const { data: restaurants, isLoading: restaurantsLoading, error: restaurantsError } = useQuery<Restaurant[]>({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase.from('restaurants').select('*');
      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    },
  });

  const { data: menus, isLoading: menusLoading, error: menusError } = useQuery<Menu[]>({
    queryKey: ['menus', selectedRestaurant],
    queryFn: async () => {
      if (!selectedRestaurant) return [];
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('restaurant_id', selectedRestaurant);
      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    },
    enabled: !!selectedRestaurant,
  });

  const handleRestaurantSelect = (restaurantId: string) => {
    setSelectedRestaurant(restaurantId);
  };

  const handleViewToggle = (newViewMode: 'grid' | 'map') => {
    setViewMode(newViewMode);
  };

  const calculateDistanceToRestaurant = (restaurant: Restaurant): number | null => {
    if (!currentLocation || !restaurant) return null;
    return calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      restaurant.latitude,
      restaurant.longitude
    );
  };

  const handleClearLocationStorage = () => {
    try {
      clearLocationStorage();
      console.log('Location storage cleared successfully');
    } catch (error) {
      console.error('Error clearing location storage:', error);
    }
  };

  const handleExportLogs = () => {
    try {
      const logs = exportLocationLogs();
      downloadJsonFile(logs, 'location-logs.json');
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  return (
    <MainContent>
      <Card>
        <CardHeader>
          <CardTitle>Customer Dashboard</CardTitle>
          <CardDescription>
            Welcome, {user?.email}! Explore restaurants and view recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => signOut()}>Sign Out</Button>
        </CardContent>
      </Card>

      <LocationStateManager />
      <LocationStatusIndicator />
      <LocationPromptBanner />

      {permissionStatus !== 'granted' && (
        <LocationPermissionsPrompt
          isOpen={permissionStatus !== 'granted'}
          onClose={() => {}}
          onRequestPermission={requestPermission}
          isLoading={permissionLoading}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Restaurants</CardTitle>
          <CardDescription>Select a restaurant to view its menu.</CardDescription>
        </CardHeader>
        <CardContent>
          {restaurantsLoading ? (
            <p>Loading restaurants...</p>
          ) : restaurantsError ? (
            <p className="text-red-500">Error: {restaurantsError.message}</p>
          ) : restaurants && restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <RestaurantSummary
                key={restaurant.id}
                restaurant={restaurant}
                onSelect={handleRestaurantSelect}
                distance={calculateDistanceToRestaurant(restaurant)}
              />
            ))
          ) : (
            <EmptyState message="No restaurants found." />
          )}
        </CardContent>
      </Card>

      {selectedRestaurant && (
        <Card>
          <CardHeader>
            <CardTitle>Menu</CardTitle>
            <CardDescription>
              View the menu for the selected restaurant.
              <ViewToggle viewMode={viewMode} onViewToggle={handleViewToggle} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            {menusLoading ? (
              <p>Loading menu...</p>
            ) : menusError ? (
              <p className="text-red-500">Error: {menusError.message}</p>
            ) : menus && menus.length > 0 ? (
              <CustomerMealGrid meals={menus} viewMode={viewMode} />
            ) : (
              <EmptyState message="No menu items found." />
            )}
          </CardContent>
        </Card>
      )}

      {currentLocation && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Meals</CardTitle>
            <CardDescription>Personalized recommendations based on your location.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecommendedMeals
              latitude={currentLocation.latitude}
              longitude={currentLocation.longitude}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Location Debugging</CardTitle>
          <CardDescription>Tools for testing and debugging location services.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowLocationLogs(true)}>Show Location Logs</Button>
          <Button onClick={handleClearLocationStorage}>Clear Location Storage</Button>
          <Button onClick={handleExportLogs}>Export Location Logs</Button>
          <Button onClick={() => setShowLocationHistory(true)}>Show Location History</Button>
          <Button onClick={() => setShowAdaptiveTracker(true)}>
            Show Adaptive Location Tracker
          </Button>
        </CardContent>
      </Card>

      <LogDisplayModal
        isOpen={showLocationLogs}
        onClose={() => setShowLocationLogs(false)}
      />

      <LocationHistoryDashboard
        isOpen={showLocationHistory}
        onClose={() => setShowLocationHistory(false)}
        locationHistory={locationHistory}
      />

      {showAdaptiveTracker && (
        <Card>
          <CardHeader>
            <CardTitle>Adaptive Location Tracker</CardTitle>
            <CardDescription>
              Demonstrates adaptive location tracking based on various factors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdaptiveLocationTracker />
            <Button onClick={() => setShowAdaptiveTracker(false)}>Close Tracker</Button>
          </CardContent>
        </Card>
      )}
    </MainContent>
  );
};

export default Customer;

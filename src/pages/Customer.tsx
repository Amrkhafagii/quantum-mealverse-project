import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clearLocationStorage, exportLocationLogs } from '@/utils/locationDebug';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { useLocationHistory } from '@/hooks/useLocationHistory';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { calculateDistance } from '@/utils/locationUtils';
import { downloadJsonFile } from '@/utils/fileDownloads';
import { MenuItem } from '@/types/menu';
import { Restaurant } from '@/types/restaurant';
import { LocationStateManager } from '@/components/location/LocationStateManager';
import { LocationStatusIndicator } from '@/components/location/LocationStatusIndicator';
import LocationPermissionsPrompt from '@/components/location/LocationPermissionsPrompt';
import LocationPromptBanner from '@/components/location/LocationPromptBanner';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { RestaurantSection } from '@/components/customer/RestaurantSection';
import { MenuSection } from '@/components/customer/MenuSection';
import { RecommendationsSection } from '@/components/customer/RecommendationsSection';
import { DebugSection } from '@/components/customer/DebugSection';

const Customer: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showLocationLogs, setShowLocationLogs] = useState(false);
  const [showLocationHistory, setShowLocationHistory] = useState(false);
  const [showAdaptiveTracker, setShowAdaptiveTracker] = useState(false);
  
  const { currentLocation } = useCurrentLocation();
  const { locationHistory } = useLocationHistory();
  const { 
    permissionStatus, 
    requestPermission, 
    isRequesting: permissionLoading 
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

  const { data: menus, isLoading: menusLoading, error: menusError } = useQuery<MenuItem[]>({
    queryKey: ['menus', selectedRestaurant],
    queryFn: async () => {
      if (!selectedRestaurant) return [];
      const { data, error } = await supabase
        .from('menu_items')
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

  // Convert restaurants to proper format for RestaurantSummary
  const nearbyRestaurants = restaurants?.map(restaurant => ({
    restaurant_id: restaurant.id,
    restaurant_name: restaurant.name,
    restaurant_address: restaurant.address,
    restaurant_email: restaurant.email || '',
    distance_km: calculateDistanceToRestaurant(restaurant) || 0
  })) || [];

  // Convert MenuItem to MealType for CustomerMealGrid
  const mealTypeMenus = menus?.map(menu => ({
    id: menu.id,
    name: menu.name,
    description: menu.description || '',
    price: menu.price,
    image_url: menu.image_url,
    calories: menu.nutritional_info?.calories || 0,
    protein: menu.nutritional_info?.protein || 0,
    carbs: menu.nutritional_info?.carbs || 0,
    fat: menu.nutritional_info?.fat || 0,
    category: menu.category || 'other',
    preparation_time: menu.preparation_time || 15,
    is_available: menu.is_available ?? true,
    is_active: menu.is_available ?? true,
    restaurant_id: menu.restaurant_id,
    created_at: menu.created_at || new Date().toISOString(),
    updated_at: menu.updated_at || new Date().toISOString()
  })) || [];

  // Convert location history to correct format
  const convertedLocationHistory = locationHistory.map(entry => ({
    ...entry,
    timestamp: typeof entry.timestamp === 'string' ? Date.parse(entry.timestamp) : entry.timestamp
  }));

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <CustomerHeader 
        userEmail={user?.email}
        onLogout={logout}
      />

      <LocationStateManager>
        <LocationStatusIndicator 
          trackingMode="automatic" 
          isTracking={!!currentLocation} 
        />
        <LocationPromptBanner />

        {permissionStatus !== 'granted' && (
          <LocationPermissionsPrompt
            onRequestPermission={requestPermission}
            isLoading={permissionLoading}
          />
        )}

        <RestaurantSection
          restaurants={restaurants}
          nearbyRestaurants={nearbyRestaurants}
          isLoading={restaurantsLoading}
          error={restaurantsError}
        />

        <MenuSection
          selectedRestaurant={selectedRestaurant}
          menus={menus}
          mealTypeMenus={mealTypeMenus}
          viewMode={viewMode}
          onViewToggle={handleViewToggle}
          isLoading={menusLoading}
          error={menusError}
          onLocationRequest={requestPermission}
        />

        <RecommendationsSection currentLocation={currentLocation} />

        <DebugSection
          showLocationLogs={showLocationLogs}
          showLocationHistory={showLocationHistory}
          showAdaptiveTracker={showAdaptiveTracker}
          locationHistory={convertedLocationHistory}
          onToggleLocationLogs={() => setShowLocationLogs(!showLocationLogs)}
          onToggleLocationHistory={() => setShowLocationHistory(!showLocationHistory)}
          onToggleAdaptiveTracker={() => setShowAdaptiveTracker(!showAdaptiveTracker)}
          onClearLocationStorage={handleClearLocationStorage}
          onExportLogs={handleExportLogs}
        />
      </LocationStateManager>
    </div>
  );
};

export default Customer;

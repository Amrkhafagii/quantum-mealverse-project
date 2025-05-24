
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSimpleLocation } from '@/hooks/useSimpleLocation';
import { useRestaurantsData } from '@/hooks/useRestaurantsData';
import { useMenuData } from '@/hooks/useMenuData';

export interface CustomerState {
  // Auth state
  user: any;
  
  // Location state
  location: any;
  locationError: string | null;
  permissionStatus: string;
  hasRequestedPermission: boolean;
  
  // Restaurant state
  restaurants: any[];
  restaurantsError: string | null;
  
  // Menu state
  menuItems: any[];
  menuError: string | null;
  
  // Combined loading states
  isInitializing: boolean;
  isLoadingLocation: boolean;
  isLoadingRestaurants: boolean;
  isLoadingMenu: boolean;
  isLoading: boolean;
  
  // Combined error state
  hasError: boolean;
  errorMessage: string | null;
  
  // Actions
  requestLocation: () => Promise<boolean>;
  refetchRestaurants: () => void;
  clearErrors: () => void;
}

export const useCustomerState = (): CustomerState => {
  const { user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Location management
  const {
    location,
    isLoading: locationLoading,
    error: locationError,
    permissionStatus,
    hasRequestedPermission,
    requestLocation
  } = useSimpleLocation();
  
  // Restaurant management
  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError,
    refetch: refetchRestaurants
  } = useRestaurantsData(location);
  
  // Menu management
  const { 
    data: menuItems = [], 
    isLoading: menuLoading, 
    error: menuError 
  } = useMenuData(restaurants);

  // Initialize state
  useEffect(() => {
    if (user !== undefined) {
      setIsInitializing(false);
    }
  }, [user]);

  // Calculate combined loading states
  const isLoadingLocation = locationLoading;
  const isLoadingRestaurants = restaurantsLoading;
  const isLoadingMenu = menuLoading;
  const isLoading = isInitializing || isLoadingLocation || isLoadingRestaurants || isLoadingMenu;

  // Calculate combined error state with proper string conversion
  const hasError = !!(restaurantsError || menuError);
  const errorMessage = restaurantsError || (menuError ? String(menuError) : null);

  // Clear errors action
  const clearErrors = useCallback(() => {
    // Note: Individual hooks should handle their own error clearing
    console.log('Clearing errors - individual hooks should implement their own error clearing');
  }, []);

  // Enhanced location request with error handling
  const handleLocationRequest = useCallback(async (): Promise<boolean> => {
    const success = await requestLocation();
    if (success && refetchRestaurants) {
      refetchRestaurants();
    }
    return success;
  }, [requestLocation, refetchRestaurants]);

  return {
    // Auth state
    user,
    
    // Location state
    location,
    locationError,
    permissionStatus,
    hasRequestedPermission,
    
    // Restaurant state
    restaurants,
    restaurantsError,
    
    // Menu state
    menuItems,
    menuError: menuError ? String(menuError) : null,
    
    // Combined loading states
    isInitializing,
    isLoadingLocation,
    isLoadingRestaurants,
    isLoadingMenu,
    isLoading,
    
    // Combined error state
    hasError,
    errorMessage,
    
    // Actions
    requestLocation: handleLocationRequest,
    refetchRestaurants,
    clearErrors
  };
};

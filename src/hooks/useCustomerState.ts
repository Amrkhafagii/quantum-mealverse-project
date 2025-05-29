
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurantsData } from '@/hooks/useRestaurantsData';
import { useMenuItems } from '@/hooks/menu/useMenuItems';

export const useCustomerState = () => {
  const { user } = useAuth();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch restaurants using the correct hook
  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError
  } = useRestaurantsData();

  // Fetch menu items - this hook needs nearby restaurants
  const {
    menuItems,
    isLoading: menuLoading
  } = useMenuItems(restaurants || []);

  const isLoading = restaurantsLoading || menuLoading;

  const clearErrors = () => {
    setHasError(false);
    setErrorMessage(null);
  };

  // Handle errors from hooks
  useEffect(() => {
    if (restaurantsError) {
      setHasError(true);
      setErrorMessage('Failed to load restaurants');
    } else {
      setHasError(false);
      setErrorMessage(null);
    }
  }, [restaurantsError]);

  return {
    user,
    restaurants,
    restaurantsError,
    menuItems,
    menuError: null, // useMenuItems doesn't expose error in this interface
    isLoading,
    hasError,
    errorMessage,
    clearErrors
  };
};

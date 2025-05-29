
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
    data: restaurants,
    isLoading: restaurantsLoading,
    error: restaurantsError
  } = useRestaurantsData();

  // Fetch menu items
  const {
    data: menuItems,
    isLoading: menuLoading,
    error: menuError
  } = useMenuItems();

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
    } else if (menuError) {
      setHasError(true);
      setErrorMessage('Failed to load menu items');
    } else {
      setHasError(false);
      setErrorMessage(null);
    }
  }, [restaurantsError, menuError]);

  return {
    user,
    restaurants,
    restaurantsError,
    menuItems,
    menuError,
    isLoading,
    hasError,
    errorMessage,
    clearErrors
  };
};


import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useMenuItems } from '@/hooks/useMenuItems';

export const useCustomerState = () => {
  const { user } = useAuth();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch restaurants (now without location dependency)
  const {
    data: restaurants,
    isLoading: restaurantsLoading,
    error: restaurantsError
  } = useRestaurants();

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


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { NearbyRestaurant } from './useNearestRestaurant';

export const useAutoRestaurantNavigation = (
  autoNavigateToMenu: boolean,
  nearbyRestaurants: NearbyRestaurant[],
  hasContentLoaded: boolean,
  isLoading: boolean,
  user: any
) => {
  const [hasNavigated, setHasNavigated] = useState(false);
  const navigate = useNavigate();

  // Check if user was redirected from restaurant menu and navigate back there if needed
  useEffect(() => {
    const restaurantData = sessionStorage.getItem('selectedRestaurant');
    const shouldAutoNavigate = localStorage.getItem('autoNavigateToMenu') === 'true';
    
    if (restaurantData && shouldAutoNavigate) {
      try {
        const parsedData = JSON.parse(restaurantData);
        // Clear the flag to prevent loops
        localStorage.setItem('autoNavigateToMenu', 'false');
      } catch (error) {
        console.error('Error parsing stored restaurant data:', error);
      }
    }
  }, []);

  // Navigate to restaurant menu when restaurants are found
  useEffect(() => {
    if (
      autoNavigateToMenu && 
      nearbyRestaurants.length > 0 && 
      !hasNavigated && 
      hasContentLoaded && 
      !isLoading &&
      user // Only auto-navigate if user is authenticated
    ) {
      setHasNavigated(true);
      const firstRestaurant = nearbyRestaurants[0];
      
      // Store selected restaurant in session storage
      sessionStorage.setItem('selectedRestaurant', JSON.stringify(firstRestaurant));
      
      // Navigate to restaurant detail page with menu tab active
      navigate(`/restaurants/${firstRestaurant.restaurant_id}?tab=menu`);
      
      toast.success(`Found ${nearbyRestaurants.length} restaurants near you!`, {
        description: "Taking you to the nearest menu..."
      });
    }
  }, [nearbyRestaurants, autoNavigateToMenu, hasNavigated, hasContentLoaded, isLoading, navigate, user]);
};

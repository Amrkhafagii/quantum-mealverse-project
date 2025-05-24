
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserWithMetadata } from '@/contexts/AuthContext';

export type Restaurant = {
  id: string;
  name: string;
  address: string;
  owner_id: string;
  created_at: string;
  status: string;
};

export const useRestaurantAuth = () => {
  const { user, loading, logout } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestaurantOwner, setIsRestaurantOwner] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user || loading) {
        setIsLoading(false);
        return;
      }

      try {
        // For now we'll use a mock restaurant until we have a real API
        const mockRestaurant: Restaurant = {
          id: 'rest1',
          name: 'Quantum Delights',
          address: '123 Quantum Street',
          owner_id: user.id,
          created_at: new Date().toISOString(),
          status: 'active'
        };
        
        setRestaurant(mockRestaurant);
        
        // Check if user is restaurant owner
        setIsRestaurantOwner(mockRestaurant.owner_id === user.id);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, [user, loading]);

  return {
    user,
    restaurant,
    isLoading: loading || isLoading,
    isRestaurantOwner,
    logout
  };
};

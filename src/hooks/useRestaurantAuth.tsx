
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestaurantOwner, setIsRestaurantOwner] = useState(false);

  useEffect(() => {
    const checkRestaurantAuth = async () => {
      console.log('useRestaurantAuth - checking auth state:', { user, loading });
      
      if (loading) {
        return; // Still loading auth state
      }

      if (!user) {
        console.log('useRestaurantAuth - no user, redirecting to auth');
        navigate('/auth');
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is a restaurant type
        const userType = user.user_metadata?.user_type;
        console.log('useRestaurantAuth - user type:', userType);
        
        if (userType !== 'restaurant') {
          console.log('useRestaurantAuth - not a restaurant user, redirecting based on type');
          setIsRestaurantOwner(false);
          setIsLoading(false);
          
          // Redirect based on actual user type
          if (userType === 'delivery') {
            navigate('/delivery/dashboard', { replace: true });
          } else if (userType === 'customer') {
            navigate('/customer', { replace: true });
          } else {
            navigate('/auth', { replace: true });
          }
          return;
        }

        // Create mock restaurant data for now
        const mockRestaurant: Restaurant = {
          id: 'rest_' + user.id.slice(0, 8),
          name: 'Quantum Delights Restaurant',
          address: '123 Quantum Street, Food City',
          owner_id: user.id,
          created_at: new Date().toISOString(),
          status: 'active'
        };
        
        console.log('useRestaurantAuth - setting restaurant:', mockRestaurant);
        setRestaurant(mockRestaurant);
        setIsRestaurantOwner(true);
      } catch (error) {
        console.error('useRestaurantAuth - Error:', error);
        setIsRestaurantOwner(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRestaurantAuth();
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        navigate('/auth');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    restaurant,
    isLoading: loading || isLoading,
    isRestaurantOwner,
    logout: handleLogout
  };
};

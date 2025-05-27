
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export type Restaurant = {
  id: string;
  name: string;
  address: string;
  owner_id: string;
  created_at: string;
  status: string;
};

export const useRestaurantAuth = () => {
  const { user, userType, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestaurantOwner, setIsRestaurantOwner] = useState(false);

  useEffect(() => {
    const checkRestaurantAuth = async () => {
      console.log('useRestaurantAuth - checking auth state:', { user: !!user, userType, loading });
      
      if (loading) {
        return; // Still loading auth state
      }

      if (!user) {
        console.log('useRestaurantAuth - no user, redirecting to auth');
        navigate('/auth');
        setIsLoading(false);
        return;
      }

      // Wait for userType to be determined
      if (userType === null) {
        console.log('useRestaurantAuth - userType still loading');
        return;
      }

      try {
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

        // Fetch actual restaurant data from database
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('useRestaurantAuth - Error fetching restaurant:', error);
          throw error;
        }
        
        if (data) {
          console.log('useRestaurantAuth - setting restaurant:', data);
          setRestaurant(data);
          setIsRestaurantOwner(true);
        } else {
          console.log('useRestaurantAuth - no restaurant found for user');
          setIsRestaurantOwner(false);
        }
      } catch (error) {
        console.error('useRestaurantAuth - Error:', error);
        setIsRestaurantOwner(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRestaurantAuth();
  }, [user, userType, loading, navigate]);

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


import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export type Restaurant = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code?: string;
  country: string;
  description?: string;
  cuisine_type?: string;
  logo_url?: string;
  cover_image_url?: string;
  business_license?: string;
  tax_number?: string;
  is_active: boolean;
  is_verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected' | 'under_review';
  verification_notes?: string;
  latitude?: number;
  longitude?: number;
  opening_hours?: any;
  delivery_radius: number;
  minimum_order_amount?: number;
  delivery_fee?: number;
  estimated_delivery_time: number;
  created_at: string;
  updated_at: string;
  // Add status property for dashboard compatibility
  status?: string;
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
          // Ensure required fields have default values
          const restaurantData: Restaurant = {
            ...data,
            delivery_radius: data.delivery_radius || 10,
            estimated_delivery_time: data.estimated_delivery_time || 45,
            status: data.is_active ? 'active' : 'inactive'
          };
          setRestaurant(restaurantData);
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

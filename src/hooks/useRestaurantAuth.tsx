
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/types/restaurant';

export const useRestaurantAuth = () => {
  const { user, session, loading: authLoading } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching restaurant data:', error);
          setError(error.message);
          setRestaurant(null);
        } else {
          setRestaurant(data as Restaurant);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchRestaurantData();
    }
  }, [user, authLoading]);

  const isRestaurantOwner = !!restaurant;

  return {
    user,
    session,
    restaurant,
    loading: authLoading || loading,
    error,
    isRestaurantOwner
  };
};

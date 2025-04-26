
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/types/restaurant';
import { useToast } from '@/hooks/use-toast';

export const useRestaurantAuth = () => {
  const { user, session, loading: authLoading, logout: authLogout } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
  
  const logout = async () => {
    try {
      await authLogout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your restaurant account",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error logging out",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    user,
    session,
    restaurant,
    loading: authLoading || loading,
    error,
    isRestaurantOwner,
    logout
  };
};

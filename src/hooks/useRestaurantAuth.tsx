
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/types/restaurant';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useRestaurantAuth = () => {
  const { user, session, loading: authLoading, logout: authLogout } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!user) {
        setRestaurant(null);
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
      console.log("Restaurant logout initiated");
      
      // Call the auth logout function
      await authLogout();
      
      // Clear local restaurant state
      setRestaurant(null);
      
      // Show success toast
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your restaurant account",
      });
      
      // Navigate to auth page
      navigate('/auth');
      
      return true;
    } catch (error) {
      console.error("Error logging out restaurant:", error);
      toast({
        title: "Error logging out",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive"
      });
      throw error;
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

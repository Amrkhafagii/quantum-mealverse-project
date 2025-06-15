export interface CreateRestaurantData {
  name: string;
  email: string;
  password: string;
  description?: string;
  cuisine_type?: string;
  address?: string;
  city?: string;
  phone?: string;
}

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export const useRestaurantAuth = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const signUp = async (data: CreateRestaurantData) => {
    setLoading(true);
    try {
      const { user, session, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            description: data.description,
            cuisine_type: data.cuisine_type,
            address: data.address,
            city: data.city,
            phone: data.phone,
            role: 'restaurant'
          }
        }
      });

      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      // Create restaurant profile
      if (user?.id) {
        await createRestaurantProfile(user.id, data);
      }

      toast({
        title: 'Sign up successful',
        description: 'Please check your email to verify your account.'
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password || ''
      });

      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      router.push('/restaurant/profile');
      router.refresh();
      toast({
        title: 'Sign in successful',
        description: 'Welcome back!'
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          title: 'Sign out failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      router.push('/sign-in');
      router.refresh();
      toast({
        title: 'Sign out successful',
        description: 'See you soon!'
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    loading
  };
};

const createRestaurantProfile = async (userId: string, data: CreateRestaurantData) => {
  try {
    const { error } = await supabase.from('restaurants').insert([
      {
        restaurant_owner_id: userId,
        name: data.name,
        description: data.description,
        cuisine_type: data.cuisine_type,
        address: data.address,
        city: data.city,
        phone: data.phone
      }
    ]);

    if (error) {
      console.error('Error creating restaurant profile:', error);
    }
  } catch (error) {
    console.error('Error creating restaurant profile:', error);
  }
};

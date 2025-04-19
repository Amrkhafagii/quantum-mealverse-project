
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MealType } from '@/types/meal';

export const useAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [meals, setMeals] = useState<MealType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) throw error;
      if (data) setMeals(data);
    } catch (error: any) {
      toast({
        title: "Error fetching meals",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select()
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (data) {
        setIsAdmin(true);
        fetchMeals();
      } else {
        navigate('/');
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access this page",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMeals = async () => {
    const { data: existingMeals } = await supabase
      .from('meals')
      .select('*');

    if (!existingMeals || existingMeals.length === 0) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      let restaurant_id;
      
      if (restaurants && restaurants.length > 0) {
        restaurant_id = restaurants[0].id;
      } else {
        const { data: newRestaurant } = await supabase
          .from('restaurants')
          .insert({
            name: 'Default Restaurant',
            user_id: user.id,
            address: '123 Main Street',
            location: { type: 'Point', coordinates: [0, 0] }
          })
          .select('id')
          .single();
        
        if (newRestaurant) restaurant_id = newRestaurant.id;
      }

      if (restaurant_id) {
        // Define initial meals
        const initialMeals = [
          {
            name: 'Quantum Protein Bowl',
            description: 'High protein meal with grilled chicken, quinoa, and vegetables',
            price: 10.99,
            calories: 450,
            protein: 35,
            carbs: 40,
            fat: 15,
            is_active: true,
            restaurant_id
          },
          {
            name: 'Fusion Energy Salad',
            description: 'Mixed greens with superfoods, avocado, and citrus dressing',
            price: 8.99,
            calories: 320,
            protein: 12,
            carbs: 25,
            fat: 22,
            is_active: true,
            restaurant_id
          },
          {
            name: 'Particle Pasta',
            description: 'Whole grain pasta with turkey meatballs and organic marinara',
            price: 12.99,
            calories: 520,
            protein: 28,
            carbs: 65,
            fat: 18,
            is_active: true,
            restaurant_id
          }
        ];
        
        for (const meal of initialMeals) {
          await supabase
            .from('meals')
            .insert(meal);
        }
        fetchMeals();
      }
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      initializeMeals();
    }
  }, [isAdmin]);

  return {
    isAdmin,
    meals,
    loading,
    fetchMeals
  };
};

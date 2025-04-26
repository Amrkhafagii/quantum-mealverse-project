import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MealType } from '@/types/meal';
import { MenuItem, NutritionalInfo } from '@/types/menu';

export const useAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [meals, setMeals] = useState<MealType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) throw error;
      if (data) {
        // Convert MenuItem to MealType with proper type handling
        const convertedMeals: MealType[] = data.map((item) => {
          const nutritionalInfo = item.nutritional_info as NutritionalInfo || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          };
          
          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            calories: nutritionalInfo.calories || 0,
            protein: nutritionalInfo.protein || 0,
            carbs: nutritionalInfo.carbs || 0,
            fat: nutritionalInfo.fat || 0,
            image_url: item.image_url,
            is_active: item.is_available,
            restaurant_id: item.restaurant_id,
            created_at: item.created_at || '',
            updated_at: item.updated_at || '',
            ingredients: [],
            steps: []
          };
        });
        setMeals(convertedMeals);
      }
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

  useEffect(() => {
    checkAdminStatus();
  }, [navigate, toast]);

  return {
    isAdmin,
    meals,
    loading,
    fetchMeals
  };
};

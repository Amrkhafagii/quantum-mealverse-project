
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

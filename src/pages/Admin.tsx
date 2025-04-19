
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import MealForm from '@/components/admin/MealForm';
import MealList from '@/components/admin/MealList';
import { useMealManagement } from '@/hooks/useMealManagement';
import { MealType, INITIAL_MEALS } from '@/types/meal';

const Admin = () => {
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

  const {
    editingMeal,
    formData,
    setEditingMeal,
    handleInputChange,
    handleEditMeal,
    handleSaveMeal,
    handleDeleteMeal,
    handleImageUpload,
  } = useMealManagement(fetchMeals);

  useEffect(() => {
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
    
    checkAdminStatus();
  }, [navigate, toast]);

  useEffect(() => {
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
          for (const meal of INITIAL_MEALS) {
            await supabase
              .from('meals')
              .insert({
                ...meal,
                restaurant_id
              });
          }
          fetchMeals();
        }
      }
    };

    initializeMeals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-quantum-black text-white flex items-center justify-center">
        <div className="text-quantum-cyan text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 px-4 container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-quantum-cyan neon-text">Admin Dashboard</h1>
          <Button 
            onClick={() => setEditingMeal(null)}
            className="cyber-button"
          >
            Create New Meal
          </Button>
        </div>
        
        {isAdmin ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MealForm
              formData={formData}
              editingMeal={editingMeal}
              onInputChange={handleInputChange}
              onSave={handleSaveMeal}
              onCancel={() => setEditingMeal(null)}
              onImageUpload={handleImageUpload}
            />
            <MealList
              meals={meals}
              onEdit={handleEditMeal}
              onDelete={handleDeleteMeal}
            />
          </div>
        ) : (
          <Card className="p-6 max-w-md mx-auto">
            <p className="text-center text-red-400">Access denied. You need admin privileges.</p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Admin;

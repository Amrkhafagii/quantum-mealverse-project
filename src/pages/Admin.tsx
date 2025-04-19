
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';

interface MealType {
  id: number;
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [meals, setMeals] = useState<MealType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMeal, setEditingMeal] = useState<MealType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  // Check if user is admin
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;
    
    // Convert numeric values
    if (['price', 'calories', 'protein', 'carbs', 'fat'].includes(name)) {
      processedValue = parseFloat(value) || 0;
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
  };

  const handleEditMeal = (meal: MealType) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      description: meal.description,
      price: meal.price,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat
    });
  };

  const handleSaveMeal = async () => {
    if (!editingMeal) return;
    
    try {
      const { error } = await supabase
        .from('meals')
        .update(formData)
        .eq('id', editingMeal.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${formData.name} has been updated`,
      });
      
      setEditingMeal(null);
      fetchMeals();
    } catch (error: any) {
      toast({
        title: "Error updating meal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateNewMeal = async () => {
    try {
      const { error } = await supabase
        .from('meals')
        .insert([formData]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${formData.name} has been created`,
      });
      
      setFormData({
        name: '',
        description: '',
        price: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
      
      fetchMeals();
    } catch (error: any) {
      toast({
        title: "Error creating meal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMeal = async (id: number) => {
    if (!confirm("Are you sure you want to delete this meal?")) return;
    
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Meal has been deleted",
      });
      
      fetchMeals();
    } catch (error: any) {
      toast({
        title: "Error deleting meal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
        <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Admin Dashboard</h1>
        
        {isAdmin ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Meal editor form */}
            <Card className="p-6 holographic-card">
              <h2 className="text-2xl font-bold text-quantum-cyan mb-4">
                {editingMeal ? `Edit Meal: ${editingMeal.name}` : 'Create New Meal'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Description</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Price ($)</label>
                    <Input
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Calories</label>
                    <Input
                      name="calories"
                      type="number"
                      value={formData.calories}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Protein (g)</label>
                    <Input
                      name="protein"
                      type="number"
                      value={formData.protein}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Carbs (g)</label>
                    <Input
                      name="carbs"
                      type="number"
                      value={formData.carbs}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Fat (g)</label>
                    <Input
                      name="fat"
                      type="number"
                      value={formData.fat}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                {editingMeal ? (
                  <div className="flex gap-4">
                    <Button 
                      className="flex-1 cyber-button" 
                      onClick={handleSaveMeal}
                    >
                      Save Changes
                    </Button>
                    <Button 
                      className="cyber-button bg-red-700 hover:bg-red-800" 
                      onClick={() => setEditingMeal(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full cyber-button" 
                    onClick={handleCreateNewMeal}
                  >
                    Create Meal
                  </Button>
                )}
              </div>
            </Card>
            
            {/* Meal list */}
            <Card className="p-6 holographic-card">
              <h2 className="text-2xl font-bold text-quantum-cyan mb-4">Meals</h2>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {meals.length === 0 ? (
                  <p className="text-center text-galaxy-purple">No meals found. Create your first meal!</p>
                ) : (
                  meals.map(meal => (
                    <Card key={meal.id} className="p-4 border border-quantum-cyan/30">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-bold text-quantum-cyan">{meal.name}</h3>
                          <p className="text-sm text-gray-300 line-clamp-2">{meal.description}</p>
                          <p className="text-galaxy-purple">${meal.price.toFixed(2)} | {meal.calories} kcal</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            variant="outline" 
                            onClick={() => handleEditMeal(meal)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm"
                            variant="destructive" 
                            onClick={() => handleDeleteMeal(meal.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>
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

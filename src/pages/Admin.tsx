import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import { ImageUpload } from '@/components/ImageUpload';

interface MealType {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  restaurant_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
}

const INITIAL_MEALS = [
  {
    name: "Quantum Quinoa Bowl",
    description: "A futuristic blend of quinoa, roasted vegetables, and quantum-infused sauce",
    price: 14.99,
    calories: 450,
    protein: 15,
    carbs: 65,
    fat: 12,
  },
  {
    name: "Nebula Noodles",
    description: "Space-inspired udon noodles with star-bright vegetables and cosmic broth",
    price: 16.99,
    calories: 520,
    protein: 18,
    carbs: 75,
    fat: 14,
  },
  {
    name: "Cyber Sushi Roll",
    description: "Digital-age inspired roll with neon-bright ingredients and holographic garnish",
    price: 18.99,
    calories: 380,
    protein: 22,
    carbs: 45,
    fat: 16,
  },
  {
    name: "Matrix Miso Soup",
    description: "A glowing green miso soup with binary-coded tofu and digital seaweed",
    price: 8.99,
    calories: 220,
    protein: 12,
    carbs: 25,
    fat: 8,
  },
  {
    name: "Hologram Hamburger",
    description: "Plant-based burger that seems to shift and change as you eat it",
    price: 17.99,
    calories: 580,
    protein: 25,
    carbs: 55,
    fat: 28,
  },
  {
    name: "Virtual Veggie Platter",
    description: "An array of vegetables prepared with augmented reality seasonings",
    price: 13.99,
    calories: 320,
    protein: 10,
    carbs: 45,
    fat: 12,
  }
];

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [meals, setMeals] = useState<MealType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMeal, setEditingMeal] = useState<MealType | null>(null);
  const [formData, setFormData] = useState<MealType>({
    id: '',
    name: '',
    description: '',
    price: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    restaurant_id: ''
  });

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
      if (data) setMeals(data as MealType[]);
    } catch (error: any) {
      toast({
        title: "Error fetching meals",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;
    
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
      id: meal.id,
      name: meal.name,
      description: meal.description,
      price: meal.price,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      restaurant_id: meal.restaurant_id
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a meal",
          variant: "destructive",
        });
        return;
      }
      
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

      const mealToCreate = {
        ...formData,
        restaurant_id
      };
      
      const { error } = await supabase
        .from('meals')
        .insert([mealToCreate]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${formData.name} has been created`,
      });
      
      setFormData({
        id: '',
        name: '',
        description: '',
        price: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        restaurant_id: restaurant_id
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

  const handleDeleteMeal = async (id: string) => {
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

  const handleImageUpload = async (file: File, mealId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${mealId}.${fileExt}`;
      const filePath = `meals/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('meals')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('meals')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('meals')
        .update({ image_url: publicUrl })
        .eq('id', mealId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      fetchMeals();
    } catch (error: any) {
      toast({
        title: "Error uploading image",
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
                
                {editingMeal && (
                  <div className="mt-4">
                    <label className="block text-sm mb-2">Meal Image</label>
                    <ImageUpload 
                      onUpload={(file) => handleImageUpload(file, editingMeal.id)}
                      currentImageUrl={editingMeal.image_url}
                    />
                  </div>
                )}
                
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
            
            <Card className="p-6 holographic-card">
              <h2 className="text-2xl font-bold text-quantum-cyan mb-4">Meals</h2>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {meals.length === 0 ? (
                  <p className="text-center text-galaxy-purple">No meals found. Create your first meal!</p>
                ) : (
                  meals.map(meal => (
                    <Card key={meal.id} className="p-4 border border-quantum-cyan/30">
                      <div className="flex gap-4">
                        {meal.image_url && (
                          <img 
                            src={meal.image_url} 
                            alt={meal.name}
                            className="w-24 h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
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

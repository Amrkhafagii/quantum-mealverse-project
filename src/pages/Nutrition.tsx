
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, ChefHat, Minus, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { useIsMobile } from '@/responsive/core/hooks/useIsMobile';
import { MobileContainer } from '@/responsive/components/containers/MobileContainer';
import { ResponsiveContainer } from '@/responsive/components/containers/ResponsiveContainer';
import { TouchFriendlyButton } from '@/components/mobile/TouchFriendlyButton';

interface MealPlanItem {
  id: string;
  meal_id: string;
  meal_name: string;
  title: string;
  image_url?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  rating: number;
  prep_time?: number;
  portions: number;
  category: string;
}

const Nutrition = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedMeals, setSelectedMeals] = useState<MealPlanItem[]>([]);

  const { data: meals, isLoading } = useQuery({
    queryKey: ['meals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .limit(20);

      if (error) throw error;
      
      // Transform the data to match MealPlanItem interface
      return (data as any[]).map(meal => ({
        id: meal.id,
        meal_id: meal.id,
        meal_name: meal.name,
        title: meal.name,
        image_url: meal.image_url,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        rating: meal.rating || 4.5,
        prep_time: meal.prep_time,
        portions: 1,
        category: meal.category
      })) as MealPlanItem[];
    },
  });

  const addToMealPlan = (meal: MealPlanItem) => {
    const existingMeal = selectedMeals.find(m => m.meal_id === meal.meal_id);
    if (existingMeal) {
      setSelectedMeals(prev =>
        prev.map(m =>
          m.meal_id === meal.meal_id
            ? { ...m, portions: m.portions + 1 }
            : m
        )
      );
    } else {
      setSelectedMeals(prev => [...prev, { ...meal, portions: 1 }]);
    }
    toast.success(`Added ${meal.title} to meal plan`);
  };

  const removeFromMealPlan = (mealId: string) => {
    setSelectedMeals(prev => prev.filter(m => m.meal_id !== mealId));
    toast.success('Removed from meal plan');
  };

  const updatePortions = (mealId: string, change: number) => {
    setSelectedMeals(prev =>
      prev.map(m => {
        if (m.meal_id === mealId) {
          const newPortions = Math.max(1, m.portions + change);
          return { ...m, portions: newPortions };
        }
        return m;
      })
    );
  };

  const totalNutrition = selectedMeals.reduce(
    (total, meal) => ({
      calories: total.calories + (meal.calories * meal.portions),
      protein: total.protein + (meal.protein * meal.portions),
      carbs: total.carbs + (meal.carbs * meal.portions),
      fats: total.fats + (meal.fats * meal.portions),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const saveMealPlan = async () => {
    if (!user) {
      toast.error('Please sign in to save your meal plan');
      return;
    }

    if (selectedMeals.length === 0) {
      toast.error('Please add some meals to your plan first');
      return;
    }

    try {
      const { error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          name: `Meal Plan - ${new Date().toLocaleDateString()}`,
          meals: selectedMeals,
          total_calories: totalNutrition.calories,
          total_protein: totalNutrition.protein,
          total_carbs: totalNutrition.carbs,
          total_fats: totalNutrition.fats,
        });

      if (error) throw error;
      
      toast.success('Meal plan saved successfully!');
      setSelectedMeals([]);
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast.error('Failed to save meal plan');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <ResponsiveContainer>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Nutrition Planner</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Create personalized meal plans and track your nutrition goals with our AI-powered recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Meal Selection */}
            <div className="lg:col-span-2">
              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                <CardHeader>
                  <CardTitle>Available Meals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meals?.map((meal) => (
                      <Card key={meal.id} className="bg-quantum-black/30 border-quantum-cyan/10">
                        <CardContent className="p-4">
                          {meal.image_url && (
                            <img
                              src={meal.image_url}
                              alt={meal.title}
                              className="w-full h-32 object-cover rounded-md mb-3"
                            />
                          )}
                          <h3 className="font-semibold mb-2">{meal.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{meal.rating}</span>
                            <Badge variant="outline" className="ml-auto">
                              {meal.category}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 mb-3">
                            <div>Calories: {meal.calories}</div>
                            <div>Protein: {meal.protein}g</div>
                            <div>Carbs: {meal.carbs}g</div>
                            <div>Fats: {meal.fats}g</div>
                          </div>
                          <TouchFriendlyButton
                            onClick={() => addToMealPlan(meal)}
                            className="w-full"
                          >
                            Add to Plan
                          </TouchFriendlyButton>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Meal Plan Summary */}
            <div>
              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 mb-6">
                <CardHeader>
                  <CardTitle>Your Meal Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMeals.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">
                      No meals selected yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedMeals.map((meal) => (
                        <div key={meal.meal_id} className="p-3 bg-quantum-black/30 rounded-md">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{meal.title}</h4>
                            <Button
                              onClick={() => removeFromMealPlan(meal.meal_id)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                            >
                              ×
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TouchFriendlyButton
                                onClick={() => updatePortions(meal.meal_id, -1)}
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </TouchFriendlyButton>
                              <span className="text-sm">{meal.portions}</span>
                              <TouchFriendlyButton
                                onClick={() => updatePortions(meal.meal_id, 1)}
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </TouchFriendlyButton>
                            </div>
                            <span className="text-xs text-gray-400">
                              {meal.calories * meal.portions} cal
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Nutrition Summary */}
              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                <CardHeader>
                  <CardTitle>Nutrition Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Calories:</span>
                      <span>{totalNutrition.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protein:</span>
                      <span>{totalNutrition.protein.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbs:</span>
                      <span>{totalNutrition.carbs.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fats:</span>
                      <span>{totalNutrition.fats.toFixed(1)}g</span>
                    </div>
                  </div>
                  
                  <TouchFriendlyButton
                    onClick={saveMealPlan}
                    className="w-full mt-4"
                    disabled={selectedMeals.length === 0}
                  >
                    Save Meal Plan
                  </TouchFriendlyButton>
                </CardContent>
              </Card>
            </div>
          </div>
        </ResponsiveContainer>
      </main>
      
      <Footer />
    </div>
  );
};

export default Nutrition;

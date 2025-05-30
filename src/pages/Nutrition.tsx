import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Apple, 
  Coffee, 
  Utensils, 
  TrendingUp, 
  Calendar,
  ChefHat,
  Heart,
  Zap,
  Target,
  Award,
  Minus,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { useMobile } from '@/hooks/use-mobile';
import { MobileContainer } from '@/components/mobile/MobileContainer';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { TouchFriendlyButton } from '@/components/mobile/TouchFriendlyButton';

interface MealPlanItem {
  meal_id: string;
  meal_name: string;
  description: string;
  image_url: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
  rating: number;
  portions: number;
}

const Nutrition = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [mealPlan, setMealPlan] = useState<MealPlanItem[]>([]);
  const { isMobile } = useMobile();

  const { data: meals, isLoading, error } = useQuery('meals', async () => {
    const { data, error } = await supabase
      .from('meals')
      .select('*');

    if (error) {
      console.error('Error fetching meals:', error);
      toast.error('Failed to load meals');
      throw error;
    }
    return data as MealPlanItem[];
  });

  useEffect(() => {
    if (meals) {
      // Initialize portions to 1 for each meal
      const initialMealPlan = meals.map(meal => ({ ...meal, portions: 1 }));
      setMealPlan(initialMealPlan);
    }
  }, [meals]);

  const updatePortions = async (mealId: string, newPortions: number) => {
    setMealPlan(prevMealPlan =>
      prevMealPlan.map(item =>
        item.meal_id === mealId ? { ...item, portions: newPortions } : item
      )
    );
  };

  const calculateTotals = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    mealPlan.forEach(item => {
      totalCalories += item.calories * item.portions;
      totalProtein += item.protein * item.portions;
      totalCarbs += item.carbs * item.portions;
      totalFat += item.fat * item.portions;
    });

    return { totalCalories, totalProtein, totalCarbs, totalFat };
  };

  const { totalCalories, totalProtein, totalCarbs, totalFat } = calculateTotals();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ResponsiveContainer>
      <MobileContainer>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                My Daily Nutrition Plan
              </CardTitle>
              <CardDescription>
                Track your daily nutrition and plan your meals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Calories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold">{totalCalories}</p>
                      <Progress value={(totalCalories / 2500) * 100} />
                      <p className="text-sm text-muted-foreground">
                        {totalCalories} / 2500 kcal
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-md font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Macro Nutrients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Protein</span>
                        <span>{totalProtein}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carbs</span>
                        <span>{totalCarbs}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fat</span>
                        <span>{totalFat}g</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="meals" className="w-full">
            <TabsList>
              <TabsTrigger value="meals" className="data-[state=active]:bg-muted">
                <Utensils className="mr-2 h-4 w-4" />
                Meals
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-muted">
                <TrendingUp className="mr-2 h-4 w-4" />
                Stats
              </TabsTrigger>
            </TabsList>
            <TabsContent value="meals" className="space-y-2">
              {mealPlan.map(item => (
                <Card key={item.meal_id} className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      {item.meal_name}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <img
                          src={item.image_url}
                          alt={item.meal_name}
                          className="rounded-md w-full h-32 object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Calories</span>
                          <span>{item.calories} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protein</span>
                          <span>{item.protein}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carbs</span>
                          <span>{item.carbs}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fat</span>
                          <span>{item.fat}g</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Portions: {item.portions}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <TouchFriendlyButton
                        variant="outline"
                        size="sm"
                        onClick={() => updatePortions(item.meal_id, Math.max(0, item.portions - 1))}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </TouchFriendlyButton>
                      
                      <span className="font-medium min-w-[2rem] text-center">
                        {item.portions}
                      </span>
                      
                      <TouchFriendlyButton
                        variant="outline"
                        size="sm"
                        onClick={() => updatePortions(item.meal_id, item.portions + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </TouchFriendlyButton>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Your Stats</CardTitle>
                  <CardDescription>Track your progress over time.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MobileContainer>
    </ResponsiveContainer>
  );
};

export default Nutrition;

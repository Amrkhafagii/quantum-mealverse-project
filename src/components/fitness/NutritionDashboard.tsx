
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Droplets, Utensils } from 'lucide-react';
import { TDEEResult } from './TDEECalculator';
import { MealPlan } from '@/types/food';
import MealCardGrid from './nutrition/MealCardGrid';
import { shuffleMeal } from '@/services/mealPlan/mealCreationService';

interface NutritionDashboardProps {
  calculationResult: TDEEResult;
  mealPlan: MealPlan;
  onUpdateMealPlan: (updatedPlan: MealPlan) => void;
}

const NutritionDashboard: React.FC<NutritionDashboardProps> = ({
  calculationResult,
  mealPlan,
  onUpdateMealPlan
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Calculate meal distribution (protein/carbs/fat ratios for each meal)
  const mealDistribution = [
    { name: 'Breakfast', protein: 0.25, carbs: 0.30, fat: 0.25 },
    { name: 'Lunch', protein: 0.35, carbs: 0.35, fat: 0.35 },
    { name: 'Dinner', protein: 0.30, carbs: 0.25, fat: 0.30 },
    { name: 'Snack', protein: 0.10, carbs: 0.10, fat: 0.10 }
  ];

  const handleShuffleMeal = (mealIndex: number) => {
    const mealNames = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    const mealName = mealNames[mealIndex];
    const distribution = mealDistribution[mealIndex];
    
    // Calculate targets for this specific meal
    const targetCalories = calculationResult.adjustedCalories * (mealIndex === 0 ? 0.25 : mealIndex === 1 ? 0.35 : mealIndex === 2 ? 0.30 : 0.10);
    const targetProtein = calculationResult.proteinGrams * distribution.protein;
    const targetCarbs = calculationResult.carbsGrams * distribution.carbs;
    const targetFat = calculationResult.fatsGrams * distribution.fat;

    // Get the current meal
    const currentMeal = mealPlan.meals[mealIndex];
    
    // Shuffle the meal
    const newMeal = shuffleMeal(currentMeal, targetCalories, targetProtein, targetCarbs, targetFat);
    
    // Update the meal plan
    const updatedMeals = [...mealPlan.meals];
    updatedMeals[mealIndex] = newMeal;
    
    const updatedPlan: MealPlan = {
      ...mealPlan,
      meals: updatedMeals,
      totalCalories: updatedMeals.reduce((sum, meal) => sum + meal.totalCalories, 0),
      totalProtein: updatedMeals.reduce((sum, meal) => sum + meal.totalProtein, 0),
      totalCarbs: updatedMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0),
      totalFat: updatedMeals.reduce((sum, meal) => sum + meal.totalFat, 0)
    };
    
    onUpdateMealPlan(updatedPlan);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header with key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Daily Calories</p>
                <p className="text-2xl font-bold text-quantum-cyan">{calculationResult.adjustedCalories}</p>
              </div>
              <Badge variant="outline" className="bg-quantum-cyan/10 text-quantum-cyan border-quantum-cyan/30">
                {calculationResult.goal}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-quantum-darkBlue/30 border-green-500/20">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-400">Protein</p>
              <p className="text-2xl font-bold text-green-400">{calculationResult.proteinGrams}g</p>
              <p className="text-xs text-gray-500">Current: {Math.round(mealPlan.totalProtein)}g</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-quantum-darkBlue/30 border-blue-500/20">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-400">Carbs</p>
              <p className="text-2xl font-bold text-blue-400">{calculationResult.carbsGrams}g</p>
              <p className="text-xs text-gray-500">Current: {Math.round(mealPlan.totalCarbs)}g</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-quantum-darkBlue/30 border-yellow-500/20">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-400">Fats</p>
              <p className="text-2xl font-bold text-yellow-400">{calculationResult.fatsGrams}g</p>
              <p className="text-xs text-gray-500">Current: {Math.round(mealPlan.totalFat)}g</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-quantum-darkBlue/50 w-full justify-start">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Meal Plan
          </TabsTrigger>
          <TabsTrigger value="hydration" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Hydration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="text-quantum-cyan">Your Personalized Meal Plan</CardTitle>
              <p className="text-gray-400">
                Meals optimized for your {calculationResult.goal.toLowerCase()} goal with enhanced protein portions and food compatibility
              </p>
            </CardHeader>
            <CardContent>
              <MealCardGrid
                meals={mealPlan.meals}
                onShuffleMeal={handleShuffleMeal}
                mealDistribution={mealDistribution}
                targetProtein={calculationResult.proteinGrams}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hydration" className="mt-6">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="text-quantum-cyan flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-400" />
                Daily Hydration Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {mealPlan.hydrationTarget} ml
                  </div>
                  <p className="text-gray-400">
                    Recommended daily water intake based on your activity level and goals
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default NutritionDashboard;

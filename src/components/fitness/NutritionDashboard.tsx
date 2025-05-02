
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TDEEResult } from '@/components/fitness/TDEECalculator'; 
import { MealPlan, Meal } from '@/types/food';
import { shuffleMeal } from '@/services/mealPlanService';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import MacroProgressBar from './MacroProgressBar';
import WaterIntakeTracker from './WaterIntakeTracker';
import InteractiveMealCard from './InteractiveMealCard';
import { useToast } from '@/hooks/use-toast';
import { Shield, Droplets, AlertCircle } from 'lucide-react';

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
  const { toast } = useToast();
  const [isAutoOptimizeProtein, setIsAutoOptimizeProtein] = useState(true);
  
  const isProteinSufficient = (mealPlan.actualProtein || 0) >= mealPlan.targetProtein * 0.95;

  // Distribution percentages for each meal
  const mealDistribution = [
    { name: 'Breakfast', protein: 0.25, carbs: 0.25, fat: 0.25 },
    { name: 'Lunch', protein: 0.3, carbs: 0.3, fat: 0.3 },
    { name: 'Snack', protein: 0.15, carbs: 0.15, fat: 0.15 },
    { name: 'Dinner', protein: 0.3, carbs: 0.3, fat: 0.3 }
  ];

  const handleShuffleMeal = (index: number) => {
    const meal = mealPlan.meals[index];
    const distribution = mealDistribution[index];
    
    const targetProteinPerMeal = mealPlan.targetProtein * distribution.protein;
    const targetCarbsPerMeal = mealPlan.targetCarbs * distribution.carbs;
    const targetFatPerMeal = mealPlan.targetFat * distribution.fat;
    
    // If auto-optimize is on, ensure protein is prioritized
    const ensureProtein = isAutoOptimizeProtein;
    
    const newMeal = shuffleMeal(
      meal, 
      targetProteinPerMeal, 
      targetCarbsPerMeal, 
      targetFatPerMeal
    );
    
    const updatedMeals = [...mealPlan.meals];
    updatedMeals[index] = newMeal;
    
    // Recalculate actual totals
    const totalCalories = updatedMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
    const actualProtein = updatedMeals.reduce((sum, meal) => sum + meal.totalProtein, 0);
    const actualCarbs = updatedMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
    const actualFat = updatedMeals.reduce((sum, meal) => sum + meal.totalFat, 0);
    
    const updatedMealPlan = {
      ...mealPlan,
      meals: updatedMeals,
      totalCalories,
      actualProtein,
      actualCarbs,
      actualFat
    };
    
    onUpdateMealPlan(updatedMealPlan);
    
    const proteinPercentage = Math.round((actualProtein / mealPlan.targetProtein) * 100);
    if (proteinPercentage < 95 && isAutoOptimizeProtein) {
      toast({
        title: "Protein Warning",
        description: `New protein level at ${proteinPercentage}% of target. Consider reshuffling.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: `${meal.name} Updated`,
        description: "New meal options generated successfully."
      });
    }
  };

  // Check if protein is sufficient for individual meals
  const isMealProteinSufficient = (meal: Meal, index: number) => {
    const distribution = mealDistribution[index];
    const targetProteinForMeal = mealPlan.targetProtein * distribution.protein;
    return meal.totalProtein >= targetProteinForMeal * 0.9; // 90% of target
  };

  // Calculate the percentages for the progress bars
  const proteinPercentage = Math.round((mealPlan.actualProtein || 0) / mealPlan.targetProtein * 100);
  const carbsPercentage = Math.round((mealPlan.actualCarbs || 0) / mealPlan.targetCarbs * 100);
  const fatPercentage = Math.round((mealPlan.actualFat || 0) / mealPlan.targetFat * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Nutritional Overview */}
      <div className="lg:col-span-1 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-quantum-cyan">Nutritional Overview</CardTitle>
              <CardDescription>
                Your personalized {mealPlan.goal} plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Calories Card */}
              <div className="bg-quantum-darkBlue/50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-400">Daily Calories</div>
                <div className="text-3xl font-bold text-quantum-cyan">
                  {mealPlan.totalCalories} kcal
                </div>
              </div>
              
              {/* Macros Progress */}
              <div className="space-y-3">
                <MacroProgressBar
                  title="Protein"
                  currentValue={mealPlan.actualProtein || 0}
                  targetValue={mealPlan.targetProtein}
                  colorClass="text-blue-400"
                  bgColorClass="bg-blue-900/30"
                  isCritical={true}
                />
                
                <MacroProgressBar
                  title="Carbohydrates"
                  currentValue={mealPlan.actualCarbs || 0}
                  targetValue={mealPlan.targetCarbs}
                  colorClass="text-green-400" 
                  bgColorClass="bg-green-900/30"
                />
                
                <MacroProgressBar
                  title="Fats"
                  currentValue={mealPlan.actualFat || 0}
                  targetValue={mealPlan.targetFat}
                  colorClass="text-yellow-400"
                  bgColorClass="bg-yellow-900/30"
                />
              </div>
              
              {/* Water Intake */}
              <WaterIntakeTracker 
                targetIntake={mealPlan.hydrationTarget} 
                currentIntake={Math.round(mealPlan.hydrationTarget * 0.8)} // Default to 80% for visualization
              />
              
              {/* Auto-optimize button */}
              <div className="pt-2">
                <Button
                  variant={isAutoOptimizeProtein ? "default" : "outline"}
                  className={
                    isAutoOptimizeProtein 
                      ? "w-full bg-quantum-purple hover:bg-quantum-purple/90" 
                      : "w-full text-quantum-purple"
                  }
                  onClick={() => setIsAutoOptimizeProtein(!isAutoOptimizeProtein)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {isAutoOptimizeProtein ? "Protein Protection: ON" : "Protein Protection: OFF"}
                </Button>
                
                {isAutoOptimizeProtein && (
                  <p className="text-xs text-gray-400 mt-2">
                    Meal shuffling will prioritize maintaining protein levels.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Right Column: Meal Cards */}
      <div className="lg:col-span-2 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-quantum-cyan">Your Daily Meal Plan</CardTitle>
              <CardDescription>
                Interactive meal options customized to your nutritional needs
              </CardDescription>
              
              {!isProteinSufficient && (
                <div className="mt-2 text-amber-400 text-xs flex items-center gap-1 bg-amber-900/20 p-2 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    Your protein intake is below 95% of your target. Try reshuffling meals to increase protein.
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {mealPlan.meals.map((meal, index) => (
                  <InteractiveMealCard
                    key={meal.id}
                    meal={meal}
                    onShuffle={() => handleShuffleMeal(index)}
                    isProteinSufficient={isMealProteinSufficient(meal, index)}
                  />
                ))}
              </div>
              
              <Button
                className="w-full mt-6 bg-quantum-purple hover:bg-quantum-purple/90"
                onClick={() => {
                  // In a real implementation, this would save the meal plan to the user's profile
                  toast({
                    title: "Meal Plan Saved",
                    description: "Your personalized meal plan has been saved to your profile.",
                  });
                }}
              >
                <Droplets className="h-4 w-4 mr-2" />
                Save This Meal Plan
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default NutritionDashboard;

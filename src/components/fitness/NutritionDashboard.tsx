
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
import InteractiveMealCard from './nutrition/InteractiveMealCard';
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { Shield, Droplets, AlertCircle, RefreshCw, Building, Check, ShoppingCart } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

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
  const [waterIntake, setWaterIntake] = useState(0);
  
  const isProteinSufficient = (mealPlan.actualProtein || 0) >= mealPlan.targetProtein * 0.95;

  // Distribution percentages for each meal
  const mealDistribution = [
    { name: 'Breakfast', protein: 0.25, carbs: 0.25, fat: 0.25 },
    { name: 'Lunch', protein: 0.3, carbs: 0.3, fat: 0.3 },
    { name: 'Snack', protein: 0.15, carbs: 0.15, fat: 0.15 },
    { name: 'Dinner', protein: 0.3, carbs: 0.3, fat: 0.3 }
  ];

  // Calculate recommended daily water intake based on weight and activity level
  const calculateRecommendedWaterIntake = () => {
    // Base calculation: 35ml per kg of body weight
    const weightInKg = calculationResult?.weight || 70; // Default to 70kg if not available
    let baseIntake = weightInKg * 35;
    
    // Adjust for activity level
    if (calculationResult?.activityLevel === 'sedentary') {
      baseIntake *= 0.9;
    } else if (calculationResult?.activityLevel === 'very-active' || calculationResult?.activityLevel === 'extremely-active') {
      baseIntake *= 1.2;
    }
    
    return Math.round(baseIntake);
  };

  useEffect(() => {
    // Update the hydration target in the meal plan with the calculated value
    if (mealPlan && (!mealPlan.hydrationTarget || mealPlan.hydrationTarget === 0)) {
      const hydrationTarget = calculateRecommendedWaterIntake();
      const updatedMealPlan = {
        ...mealPlan,
        hydrationTarget
      };
      onUpdateMealPlan(updatedMealPlan);
    }
  }, [calculationResult, mealPlan]);

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

  // Handle ordering meals
  const handleOrderMeals = () => {
    toast({
      title: "Order Placed",
      description: "Your meal plan has been sent to our partnered restaurants for preparation.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Nutritional Overview Header - Compact, horizontal layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Calories Display - Larger and more prominent */}
              <div className="col-span-3 bg-quantum-darkBlue/50 rounded-lg p-3 flex flex-col items-center justify-center">
                <div className="text-xs text-gray-400">Daily Calories</div>
                <div className="text-2xl md:text-3xl font-bold text-quantum-cyan">
                  {mealPlan.totalCalories} kcal
                </div>
              </div>
              
              {/* Macro Progress Indicators - More compact and color-coded */}
              <div className="col-span-6 grid grid-cols-3 gap-2">
                <div className="bg-blue-900/30 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-blue-400 text-xs font-medium">Protein</span>
                    <span className="text-xs">{proteinPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-blue-900/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-right">{mealPlan.actualProtein || 0}/{mealPlan.targetProtein}g</div>
                </div>
                
                <div className="bg-green-900/30 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-green-400 text-xs font-medium">Carbs</span>
                    <span className="text-xs">{carbsPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-green-900/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${Math.min(carbsPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-right">{mealPlan.actualCarbs || 0}/{mealPlan.targetCarbs}g</div>
                </div>
                
                <div className="bg-yellow-900/30 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-yellow-400 text-xs font-medium">Fats</span>
                    <span className="text-xs">{fatPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-yellow-900/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${Math.min(fatPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-right">{mealPlan.actualFat || 0}/{mealPlan.targetFat}g</div>
                </div>
              </div>
              
              {/* Water & Protein Protection - Compact controls */}
              <div className="col-span-3 space-y-2">
                {/* Water Intake Mini-Display */}
                <WaterIntakeTracker 
                  targetIntake={mealPlan.hydrationTarget || calculateRecommendedWaterIntake()}
                  currentIntake={waterIntake}
                />
                
                {/* Protein Protection Toggle */}
                <div className="flex items-center space-x-2 bg-quantum-darkBlue/40 p-2 rounded-lg">
                  <Switch 
                    checked={isAutoOptimizeProtein} 
                    onCheckedChange={setIsAutoOptimizeProtein}
                    className="data-[state=checked]:bg-quantum-purple" 
                  />
                  <label className="text-xs flex items-center">
                    <Shield className="h-3 w-3 mr-1 text-quantum-purple" />
                    Protein Protection
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {!isProteinSufficient && (
        <div className="bg-amber-900/20 border border-amber-800/30 text-amber-400 text-xs p-2 rounded flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          <span>Your protein intake is below 95% of your target. Try reshuffling meals to increase protein.</span>
        </div>
      )}
      
      {/* Meal Cards - Grid Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealPlan.meals.map((meal, index) => (
            <Card key={meal.id} className="bg-quantum-darkBlue/30 border-quantum-cyan/20 overflow-hidden">
              <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    {meal.name}
                    {isMealProteinSufficient(meal, index) ? (
                      <Badge variant="outline" className="ml-2 bg-green-900/30 border-green-600 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Balanced
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-2 bg-amber-900/30 border-amber-600 text-xs">
                        Low Protein
                      </Badge>
                    )}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-quantum-cyan rounded-full"
                    onClick={() => handleShuffleMeal(index)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Compact macro display for this meal */}
                <div className="flex space-x-2 text-xs text-gray-400 mt-1">
                  <div>{meal.totalCalories} kcal</div>
                  <div>•</div>
                  <div className="text-blue-400">P: {meal.totalProtein}g</div>
                  <div>•</div>
                  <div className="text-green-400">C: {meal.totalCarbs}g</div>
                  <div>•</div>
                  <div className="text-yellow-400">F: {meal.totalFat}g</div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2">
                  {meal.foods.map((mealFood, foodIndex) => (
                    <div key={foodIndex} className="bg-quantum-black/30 p-2 rounded-md flex justify-between text-sm">
                      <div className="flex gap-1 items-center">
                        {mealFood.food.name} 
                        <span className="text-gray-400 text-xs">({mealFood.portionSize}g)</span>
                        {mealFood.food.cookingState && (
                          <span className="text-gray-400 text-xs italic">
                            {mealFood.food.cookingState === 'cooked' ? '(cooked)' : '(raw)'}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400">{mealFood.food.calories} kcal</div>
                    </div>
                  ))}
                </div>
                
                {/* Order button (replacing restaurant meal matcher) */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 border-quantum-purple/30 hover:bg-quantum-purple/10 text-quantum-purple"
                  onClick={handleOrderMeals}
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                  Order This Meal
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
      
      {/* Save Meal Plan Button */}
      <div className="flex justify-center mt-6">
        <Button
          className="bg-quantum-purple hover:bg-quantum-purple/90 px-8"
          onClick={() => {
            toast({
              title: "Meal Plan Saved",
              description: "Your personalized meal plan has been saved to your profile.",
            });
          }}
        >
          <Droplets className="h-4 w-4 mr-2" />
          Save This Meal Plan
        </Button>
      </div>
    </div>
  );
};

export default NutritionDashboard;

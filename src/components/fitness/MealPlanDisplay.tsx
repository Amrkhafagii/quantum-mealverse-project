
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealPlan, Meal } from '@/types/food';
import { Shuffle, Droplets, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { shuffleMeal } from '@/services/mealPlanService';

interface MealCardProps {
  meal: Meal;
  onShuffle: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onShuffle }) => {
  return (
    <Card className="holographic-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-quantum-cyan">{meal.name}</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-quantum-purple"
            onClick={onShuffle}
          >
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="flex gap-2 text-xs">
          <span>{meal.totalCalories} kcal</span>
          <span>•</span>
          <span>P: {meal.totalProtein}g</span>
          <span>•</span>
          <span>C: {meal.totalCarbs}g</span>
          <span>•</span>
          <span>F: {meal.totalFat}g</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ul className="space-y-2">
          {meal.foods.map((item) => (
            <li key={item.food.id} className="flex justify-between py-1 border-b border-quantum-cyan/10 last:border-0">
              <div>
                <div className="text-sm font-medium">{item.food.name}</div>
                <div className="text-xs text-gray-400">
                  {Math.round((item.food.calories * item.portionSize) / 100)} kcal
                </div>
              </div>
              <div className="text-sm">{item.portionSize}g</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

interface MealPlanDisplayProps {
  mealPlan: MealPlan;
  onUpdateMealPlan: (mealPlan: MealPlan) => void;
}

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({
  mealPlan,
  onUpdateMealPlan
}) => {
  const { toast } = useToast();

  const handleShuffleMeal = (index: number) => {
    const meal = mealPlan.meals[index];
    const targetProteinPerMeal = mealPlan.targetProtein * [0.25, 0.3, 0.15, 0.3][index];
    const targetCarbsPerMeal = mealPlan.targetCarbs * [0.25, 0.3, 0.15, 0.3][index];
    const targetFatPerMeal = mealPlan.targetFat * [0.25, 0.3, 0.15, 0.3][index];
    
    const newMeal = shuffleMeal(meal, targetProteinPerMeal, targetCarbsPerMeal, targetFatPerMeal);
    
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
    
    toast({
      title: `${meal.name} Updated`,
      description: "New meal options generated.",
    });
  };

  // Calculate the percentage of actual vs target for macros
  const proteinPercent = Math.round((mealPlan.actualProtein || 0) / mealPlan.targetProtein * 100);
  const carbsPercent = Math.round((mealPlan.actualCarbs || 0) / mealPlan.targetCarbs * 100);
  const fatPercent = Math.round((mealPlan.actualFat || 0) / mealPlan.targetFat * 100);

  // Check if there's a significant variance in any macro
  const hasSignificantVariance = 
    Math.abs(proteinPercent - 100) > 15 || 
    Math.abs(carbsPercent - 100) > 15 || 
    Math.abs(fatPercent - 100) > 15;

  return (
    <Card className="border-quantum-cyan/30 bg-quantum-darkBlue/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Your Personalized Meal Plan</span>
          <span className="text-quantum-purple">
            {mealPlan.totalCalories} kcal
          </span>
        </CardTitle>
        <CardDescription>
          Based on your {mealPlan.goal} goal
        </CardDescription>
        
        <div className="mt-2 grid grid-cols-3 gap-1 text-sm">
          <div className="bg-blue-900/30 rounded-md p-2 text-center">
            <div className="text-blue-400 font-medium">Protein</div>
            <div>
              <span className="text-lg font-bold">{mealPlan.actualProtein || 0}g</span>
              <span className="text-gray-400 text-xs"> / {mealPlan.targetProtein}g</span>
            </div>
            <div className="text-xs text-gray-400">{proteinPercent}% of target</div>
          </div>
          <div className="bg-green-900/30 rounded-md p-2 text-center">
            <div className="text-green-400 font-medium">Carbs</div>
            <div>
              <span className="text-lg font-bold">{mealPlan.actualCarbs || 0}g</span>
              <span className="text-gray-400 text-xs"> / {mealPlan.targetCarbs}g</span>
            </div>
            <div className="text-xs text-gray-400">{carbsPercent}% of target</div>
          </div>
          <div className="bg-yellow-900/30 rounded-md p-2 text-center">
            <div className="text-yellow-400 font-medium">Fats</div>
            <div>
              <span className="text-lg font-bold">{mealPlan.actualFat || 0}g</span>
              <span className="text-gray-400 text-xs"> / {mealPlan.targetFat}g</span>
            </div>
            <div className="text-xs text-gray-400">{fatPercent}% of target</div>
          </div>
        </div>
        
        {hasSignificantVariance && (
          <div className="mt-2 text-amber-400 text-xs flex items-center gap-1 bg-amber-900/20 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            <span>The actual macros may vary from targets due to real food portion constraints.</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {mealPlan.meals.map((meal, index) => (
            <MealCard 
              key={meal.id} 
              meal={meal}
              onShuffle={() => handleShuffleMeal(index)}
            />
          ))}
        </div>
        
        <div className="mt-6 flex items-center gap-2 p-4 bg-blue-900/20 rounded-lg">
          <Droplets className="h-8 w-8 text-blue-400" />
          <div>
            <div className="font-medium">Daily Water Target</div>
            <div className="text-2xl font-bold text-blue-400">
              {mealPlan.hydrationTarget} ml
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Button 
            className="w-full bg-quantum-purple hover:bg-quantum-purple/90"
            onClick={() => {
              // In a real implementation, this would save the meal plan to the user's profile
              toast({
                title: "Meal Plan Saved",
                description: "Your personalized meal plan has been saved to your profile.",
              });
            }}
          >
            Save This Meal Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealPlanDisplay;

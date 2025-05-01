
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealPlan, Meal } from '@/types/food';
import { Shuffle, Droplets } from 'lucide-react';
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
    
    const updatedMealPlan = {
      ...mealPlan,
      meals: updatedMeals,
      totalCalories: updatedMeals.reduce((sum, meal) => sum + meal.totalCalories, 0)
    };
    
    onUpdateMealPlan(updatedMealPlan);
    
    toast({
      title: `${meal.name} Updated`,
      description: "New meal options generated.",
    });
  };

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
          Based on your {mealPlan.goal} goal - {mealPlan.targetProtein}g protein,{' '}
          {mealPlan.targetCarbs}g carbs, {mealPlan.targetFat}g fat
        </CardDescription>
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

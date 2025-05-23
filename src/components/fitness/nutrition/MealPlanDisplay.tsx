
import React from 'react';
import { MealPlan } from '@/types/food';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight } from 'lucide-react';

interface MealPlanDisplayProps {
  mealPlan: MealPlan;
  className?: string;
}

// Extended types to match actual data structure
interface ExtendedMealPlan extends MealPlan {
  name?: string;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
}

interface ExtendedMealFood {
  name: string;
  serving_size: string;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion?: number;
  portionSize?: number;
}

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ mealPlan, className }) => {
  const extendedMealPlan = mealPlan as ExtendedMealPlan;
  
  if (!extendedMealPlan || !extendedMealPlan.meals) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>No meal plan available</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please generate a meal plan to view details.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate the total calories based on macros for verification
  const totalProtein = extendedMealPlan.total_protein || extendedMealPlan.actualProtein || 0;
  const totalCarbs = extendedMealPlan.total_carbs || extendedMealPlan.actualCarbs || 0;
  const totalFat = extendedMealPlan.total_fat || extendedMealPlan.actualFat || 0;
  
  // Use the standard conversion factors: 4 cal/g for protein and carbs, 9 cal/g for fat
  const calculatedCalories = Math.round((totalProtein * 4) + (totalCarbs * 4) + (totalFat * 9));
  
  // Use calculated calories if available, otherwise fall back to the stored value
  const displayCalories = calculatedCalories || extendedMealPlan.total_calories || extendedMealPlan.totalCalories || 0;

  return (
    <Card className={`bg-quantum-darkBlue/30 border-quantum-cyan/20 ${className}`}>
      <CardHeader>
        <CardTitle className="text-quantum-cyan">{extendedMealPlan.name || 'Daily Meal Plan'}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {extendedMealPlan.meals.map((meal, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <ChevronRight className="h-5 w-5 mr-1 text-quantum-purple" />
                  {meal.name}
                </h3>
                <div className="pl-4 space-y-2">
                  {meal.foods.map((food, foodIndex) => {
                    const extendedFood = food as unknown as ExtendedMealFood;
                    
                    // Calculate actual calories based on portion size
                    const basePortionSize = extendedFood.portion || 100; // Default to 100g if no portion specified
                    const actualPortionSize = extendedFood.portionSize || parseFloat(extendedFood.serving_size) || 100;
                    const portionRatio = actualPortionSize / basePortionSize;
                    
                    // Calculate actual nutrition values based on portion ratio
                    const actualCalories = Math.round(extendedFood.calories * portionRatio);
                    const actualProtein = Math.round(extendedFood.protein * portionRatio);
                    const actualCarbs = Math.round(extendedFood.carbs * portionRatio);
                    const actualFat = Math.round(extendedFood.fat * portionRatio);
                    
                    return (
                      <div 
                        key={foodIndex} 
                        className="bg-quantum-black/30 p-3 rounded-lg border border-quantum-cyan/10 flex justify-between"
                      >
                        <div>
                          <p className="font-medium">{extendedFood.name}</p>
                          <p className="text-sm text-gray-400">{extendedFood.serving_size} {extendedFood.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{actualCalories} cal</p>
                          <p className="text-xs text-gray-400">
                            P: {actualProtein}g | C: {actualCarbs}g | F: {actualFat}g
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-quantum-cyan/20">
          <div>
            <p className="text-sm text-gray-400">Daily Totals</p>
            <p className="font-bold text-lg">{displayCalories} calories</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">Protein</p>
              <p className="font-medium">{totalProtein}g</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Carbs</p>
              <p className="font-medium">{totalCarbs}g</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fat</p>
              <p className="font-medium">{totalFat}g</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealPlanDisplay;

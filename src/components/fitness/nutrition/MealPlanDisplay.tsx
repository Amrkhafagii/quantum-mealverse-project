
import React from 'react';
import { MealPlan } from '@/types/food';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight } from 'lucide-react';

interface MealPlanDisplayProps {
  mealPlan: MealPlan;
  className?: string;
}

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ mealPlan, className }) => {
  if (!mealPlan || !mealPlan.meals) {
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

  return (
    <Card className={`bg-quantum-darkBlue/30 border-quantum-cyan/20 ${className}`}>
      <CardHeader>
        <CardTitle className="text-quantum-cyan">{mealPlan.name || 'Daily Meal Plan'}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {mealPlan.meals.map((meal, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <ChevronRight className="h-5 w-5 mr-1 text-quantum-purple" />
                  {meal.name}
                </h3>
                <div className="pl-4 space-y-2">
                  {meal.foods.map((food, foodIndex) => (
                    <div 
                      key={foodIndex} 
                      className="bg-quantum-black/30 p-3 rounded-lg border border-quantum-cyan/10 flex justify-between"
                    >
                      <div>
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-gray-400">{food.serving_size} {food.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{food.calories} cal</p>
                        <p className="text-xs text-gray-400">
                          P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-quantum-cyan/20">
          <div>
            <p className="text-sm text-gray-400">Daily Totals</p>
            <p className="font-bold text-lg">{mealPlan.total_calories} calories</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">Protein</p>
              <p className="font-medium">{mealPlan.total_protein}g</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Carbs</p>
              <p className="font-medium">{mealPlan.total_carbs}g</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fat</p>
              <p className="font-medium">{mealPlan.total_fat}g</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealPlanDisplay;

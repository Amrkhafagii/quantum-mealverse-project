
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCw, ShoppingCart } from 'lucide-react';
import { Meal } from '@/types/food';
import { toast } from 'sonner';

interface MealCardGridProps {
  meals: Meal[];
  onShuffleMeal: (index: number) => void;
  mealDistribution: Array<{ name: string, protein: number, carbs: number, fat: number }>;
  targetProtein: number;
}

const MealCardGrid: React.FC<MealCardGridProps> = ({
  meals,
  onShuffleMeal,
  mealDistribution,
  targetProtein
}) => {
  // Check if protein is sufficient for individual meals
  const isMealProteinSufficient = (meal: Meal, index: number) => {
    const distribution = mealDistribution[index];
    const targetProteinForMeal = targetProtein * distribution.protein;
    return meal.totalProtein >= targetProteinForMeal * 0.9; // 90% of target
  };

  // Handle ordering meals
  const handleOrderMeals = () => {
    // Use the sonner toast API correctly
    toast("Your meal plan has been sent to our partnered restaurants for preparation.");
  };

  // Inside the component, change the shuffleToast line to use the correct toast format
  const shuffleToast = () => {
    // Use the sonner toast API correctly with the success variant
    toast.success("Shuffling Meal", {
      description: "Regenerating meal options with similar macro targets"
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meals.map((meal, index) => (
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
                  onClick={() => {
                    onShuffleMeal(index);
                    shuffleToast();
                  }}
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
                {meal.foods.map((mealFood, foodIndex) => {
                  // Calculate actual calories and macros based on portion size
                  const basePortionSize = mealFood.food.portion || 100; // Default to 100g if no portion specified
                  const actualPortionSize = mealFood.portionSize || 100;
                  const portionRatio = actualPortionSize / basePortionSize;
                  
                  // Calculate actual nutrition values based on portion ratio
                  const actualCalories = Math.round(mealFood.food.calories * portionRatio);
                  const actualProtein = Math.round(mealFood.food.protein * portionRatio);
                  const actualCarbs = Math.round(mealFood.food.carbs * portionRatio);
                  const actualFat = Math.round(mealFood.food.fat * portionRatio);
                  
                  return (
                    <div key={foodIndex} className="bg-quantum-black/30 p-2 rounded-md flex justify-between text-sm">
                      <div className="flex gap-1 items-center">
                        <span className="text-white">{mealFood.food.name}</span>
                        <span className="text-gray-400 text-xs">({mealFood.portionSize}g)</span>
                        {mealFood.food.cookingState && (
                          <span className="text-gray-400 text-xs italic">
                            {mealFood.food.cookingState === 'cooked' ? '(cooked)' : '(raw)'}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400">{actualCalories} kcal</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Order button at the end of the grid */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="bg-quantum-purple hover:bg-quantum-purple/90 text-white px-8 py-3 text-lg"
          onClick={handleOrderMeals}
        >
          <ShoppingCart className="h-5 w-5 mr-3" />
          Order This Meal Plan
        </Button>
      </div>
    </motion.div>
  );
};

export default MealCardGrid;

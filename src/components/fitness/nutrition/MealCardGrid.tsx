
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCw, ShoppingCart, Loader2 } from 'lucide-react';
import { Meal } from '@/types/food';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { convertMealToCartItem, validateMealForCart } from '@/services/mealPlan/mealToCartService';
import { useState } from 'react';

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
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});

  // Check if protein is sufficient for individual meals
  const isMealProteinSufficient = (meal: Meal, index: number) => {
    const distribution = mealDistribution[index];
    const targetProteinForMeal = targetProtein * distribution.protein;
    return meal.totalProtein >= targetProteinForMeal * 0.9; // 90% of target
  };

  // Handle adding meal to cart
  const handleAddMealToCart = async (meal: Meal, index: number) => {
    if (!user) {
      toast.error("Please log in to add meals to cart");
      return;
    }

    // Validate meal before processing
    const validation = validateMealForCart(meal);
    if (!validation.isValid) {
      toast.error(`Cannot add meal to cart: ${validation.errors.join(', ')}`);
      return;
    }

    setAddingToCart(prev => ({ ...prev, [meal.id]: true }));

    try {
      console.log('Adding meal to cart:', meal.name);
      
      // Convert meal to cart item
      const cartItem = await convertMealToCartItem(meal, user.id);
      
      // Add to cart
      addToCart(cartItem);
      
      toast.success(`${meal.name} added to cart!`, {
        description: `$${cartItem.price.toFixed(2)} • ${meal.foods.length} ingredients`
      });

    } catch (error) {
      console.error('Error adding meal to cart:', error);
      toast.error("Failed to add meal to cart. Please try again.");
    } finally {
      setAddingToCart(prev => ({ ...prev, [meal.id]: false }));
    }
  };

  // Handle shuffling meals
  const shuffleToast = () => {
    toast.success("Shuffling Meal", {
      description: "Regenerating meal options with similar macro targets"
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
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
              
              {/* Order button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 border-quantum-purple/30 hover:bg-quantum-purple/10 text-quantum-purple disabled:opacity-50"
                onClick={() => handleAddMealToCart(meal, index)}
                disabled={addingToCart[meal.id]}
              >
                {addingToCart[meal.id] ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default MealCardGrid;

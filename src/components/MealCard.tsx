
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { HapticButton } from "@/components/ui/haptic-button";
import { ShoppingCart, MapPin } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { convertMealToCartItemWithAssignment } from '@/services/mealPlan/mealToCartServiceWithAssignment';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Meal, MealFood } from '@/types/food';

interface MealCardProps {
  name: string;
  description: string;
  price: number;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const MealCard: React.FC<MealCardProps> = ({
  name,
  description,
  price,
  calories,
  macros
}) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Convert MealCard props to Meal format for restaurant assignment
  const convertToMealFormat = (): Meal => {
    const mealId = Math.random().toString(36).substring(2, 9); // Generate temporary ID
    
    const mealFoods: MealFood[] = [
      {
        food: {
          id: mealId,
          name: name,
          calories: calories,
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat,
          category: 'protein', // Use valid FoodCategory
          cookingState: 'cooked',
          portion: 100 // Add required portion property
        },
        portionSize: 100 // Base portion for prepared meals
      }
    ];

    return {
      id: mealId,
      name: name,
      foods: mealFoods,
      totalCalories: calories,
      totalProtein: macros.protein,
      totalCarbs: macros.carbs,
      totalFat: macros.fat
    };
  };

  const handleAddToCart = async () => {
    if (!user?.id) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to cart",
        variant: "destructive"
      });
      return;
    }

    setIsAddingToCart(true);
    
    try {
      console.log("Adding meal to cart with restaurant assignment:", name);
      
      // Convert meal to proper format
      const mealForAssignment = convertToMealFormat();
      
      // Use restaurant assignment service
      const cartItems = await convertMealToCartItemWithAssignment(
        mealForAssignment,
        user.id,
        {
          strategy: 'cheapest',
          prefer_single_restaurant: true
        }
      );

      // Add each cart item (there may be multiple if split across restaurants)
      for (const cartItem of cartItems) {
        await addItem(cartItem);
      }

      toast({
        title: "Item Added",
        description: `${name} added to cart with restaurant assignment`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error adding meal to cart:', error);
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : "No restaurants available for this item",
        variant: "destructive"
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Card className="holographic-card p-6 transition-all duration-300 hover:scale-105">
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-quantum-cyan neon-text">{name}</h3>
        <p className="text-sm text-gray-300">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-quantum-cyan">${price.toFixed(2)}</span>
          <span className="text-sm text-galaxy-purple">{calories} kcal</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm text-center">
          <div className="p-2 rounded-md bg-quantum-black/50">
            <p className="text-quantum-cyan">Protein</p>
            <p>{macros.protein}g</p>
          </div>
          <div className="p-2 rounded-md bg-quantum-black/50">
            <p className="text-quantum-cyan">Carbs</p>
            <p>{macros.carbs}g</p>
          </div>
          <div className="p-2 rounded-md bg-quantum-black/50">
            <p className="text-quantum-cyan">Fat</p>
            <p>{macros.fat}g</p>
          </div>
        </div>
        <HapticButton 
          onClick={handleAddToCart}
          hapticEffect="success"
          className="w-full cyber-button flex items-center justify-center gap-2"
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <MapPin className="w-4 h-4 animate-pulse" />
              Assigning to Restaurants...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </HapticButton>
      </div>
    </Card>
  );
};

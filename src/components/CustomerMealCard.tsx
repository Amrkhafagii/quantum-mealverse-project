
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { HapticButton } from "@/components/ui/haptic-button";
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { convertMealToSimpleCartItem, validateMealForSimpleCart } from '@/services/cart/simpleCartService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Meal, MealFood } from '@/types/food';
import { MealType } from '@/types/meal';

interface CustomerMealCardProps {
  meal: MealType;
}

export const CustomerMealCard: React.FC<CustomerMealCardProps> = ({
  meal
}) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Convert CustomerMealCard props to Meal format
  const convertToMealFormat = (): Meal => {
    const mealFoods: MealFood[] = [
      {
        food: {
          id: meal.id,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          category: 'protein',
          cookingState: 'cooked',
          portion: 100
        },
        portionSize: 100
      }
    ];

    return {
      id: meal.id,
      name: meal.name,
      foods: mealFoods,
      totalCalories: meal.calories,
      totalProtein: meal.protein,
      totalCarbs: meal.carbs,
      totalFat: meal.fat
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
      console.log("Adding meal to cart (simple):", meal.name);
      
      // Convert meal to proper format
      const mealForCart = convertToMealFormat();
      
      // Validate meal
      const validation = validateMealForSimpleCart(mealForCart);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Convert to simple cart item (no restaurant assignment)
      const cartItem = convertMealToSimpleCartItem(mealForCart);
      
      // Add to cart
      const success = await addItem(cartItem);
      
      if (success) {
        toast({
          title: "Item Added",
          description: `${meal.name} added to cart`,
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error('Error adding meal to cart:', error);
      toast({
        title: "Error Adding Item",
        description: error instanceof Error ? error.message : "Unable to add item to cart",
        variant: "destructive"
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Check if meal has is_popular property (optional on MealType)
  const isPopular = 'is_popular' in meal ? meal.is_popular : false;

  return (
    <Card className="holographic-card p-4 transition-all duration-300 hover:scale-105">
      <div className="space-y-4">
        {meal.image_url && (
          <img 
            src={meal.image_url} 
            alt={meal.name}
            className="w-full h-32 object-cover rounded-md"
          />
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-quantum-cyan neon-text">{meal.name}</h3>
            {isPopular && (
              <span className="text-xs bg-quantum-cyan text-quantum-black px-2 py-1 rounded">
                Popular
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-300 line-clamp-2">{meal.description}</p>
          
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-quantum-cyan">${meal.price.toFixed(2)}</span>
            <span className="text-sm text-galaxy-purple">{meal.calories} kcal</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="p-1 rounded bg-quantum-black/50">
              <p className="text-quantum-cyan">Protein</p>
              <p>{meal.protein}g</p>
            </div>
            <div className="p-1 rounded bg-quantum-black/50">
              <p className="text-quantum-cyan">Carbs</p>
              <p>{meal.carbs}g</p>
            </div>
            <div className="p-1 rounded bg-quantum-black/50">
              <p className="text-quantum-cyan">Fat</p>
              <p>{meal.fat}g</p>
            </div>
          </div>
          
          {meal.dietary_tags && meal.dietary_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {meal.dietary_tags.map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs bg-galaxy-purple/20 text-galaxy-purple px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <HapticButton 
          onClick={handleAddToCart}
          hapticEffect="success"
          className="w-full cyber-button flex items-center justify-center gap-2"
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <ShoppingCart className="w-4 h-4 animate-pulse" />
              Adding to Cart...
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


import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { HapticButton } from "@/components/ui/haptic-button";
import { ShoppingCart, MapPin } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { convertMealToCartItemWithAssignment } from '@/services/mealPlan/mealToCartServiceWithAssignment';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Meal, MealFood } from '@/types/food';

interface CustomerMealCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url?: string;
  is_popular?: boolean;
  dietary_tags?: string[];
}

export const CustomerMealCard: React.FC<CustomerMealCardProps> = ({
  id,
  name,
  description,
  price,
  calories,
  protein,
  carbs,
  fat,
  image_url,
  is_popular,
  dietary_tags = []
}) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Convert CustomerMealCard props to Meal format for restaurant assignment
  const convertToMealFormat = (): Meal => {
    const mealFoods: MealFood[] = [
      {
        food: {
          id: id,
          name: name,
          calories: calories,
          protein: protein,
          carbs: carbs,
          fat: fat,
          category: 'meat', // Use valid FoodCategory
          cookingState: 'cooked'
        },
        portionSize: 100 // Base portion for prepared meals
      }
    ];

    return {
      id: id,
      name: name,
      foods: mealFoods,
      totalCalories: calories,
      totalProtein: protein,
      totalCarbs: carbs,
      totalFat: fat
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
    <Card className="holographic-card p-4 transition-all duration-300 hover:scale-105">
      <div className="space-y-4">
        {image_url && (
          <img 
            src={image_url} 
            alt={name}
            className="w-full h-32 object-cover rounded-md"
          />
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-quantum-cyan neon-text">{name}</h3>
            {is_popular && (
              <span className="text-xs bg-quantum-cyan text-quantum-black px-2 py-1 rounded">
                Popular
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-300 line-clamp-2">{description}</p>
          
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-quantum-cyan">${price.toFixed(2)}</span>
            <span className="text-sm text-galaxy-purple">{calories} kcal</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="p-1 rounded bg-quantum-black/50">
              <p className="text-quantum-cyan">Protein</p>
              <p>{protein}g</p>
            </div>
            <div className="p-1 rounded bg-quantum-black/50">
              <p className="text-quantum-cyan">Carbs</p>
              <p>{carbs}g</p>
            </div>
            <div className="p-1 rounded bg-quantum-black/50">
              <p className="text-quantum-cyan">Fat</p>
              <p>{fat}g</p>
            </div>
          </div>
          
          {dietary_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dietary_tags.map((tag, index) => (
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

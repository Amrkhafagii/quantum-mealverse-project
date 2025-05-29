
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { HapticButton } from "@/components/ui/haptic-button";
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { convertMealCardPropsToMeal, convertMealToSimpleCartItem, validateMealForSimpleCart } from '@/services/cart/simpleCartService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

  const handleAddToCart = async () => {
    console.log("MealCard: Add to cart clicked for:", name);
    console.log("User:", user);
    
    if (!user?.id) {
      console.log("MealCard: No user ID, showing login toast");
      toast({
        title: "Login Required",
        description: "Please log in to add items to cart",
        variant: "destructive"
      });
      return;
    }

    setIsAddingToCart(true);
    
    try {
      console.log("MealCard: Adding meal to cart (simple):", name);
      
      // Convert meal card props to meal format
      const meal = convertMealCardPropsToMeal({ name, calories, macros });
      console.log("MealCard: Converted meal:", meal);
      
      // Validate meal
      const validation = validateMealForSimpleCart(meal);
      if (!validation.isValid) {
        console.error("MealCard: Validation failed:", validation.errors);
        throw new Error(validation.errors.join(', '));
      }
      
      // Convert to simple cart item (no restaurant assignment)
      const cartItem = convertMealToSimpleCartItem(meal);
      console.log("MealCard: Created cart item:", cartItem);
      
      // Add to cart
      const success = await addItem(cartItem);
      console.log("MealCard: Add to cart result:", success);
      
      if (success) {
        toast({
          title: "Item Added",
          description: `${name} added to cart`,
          variant: "default"
        });
        console.log("MealCard: Success toast shown");
      } else {
        throw new Error("Failed to add item to cart");
      }
      
    } catch (error) {
      console.error('MealCard: Error adding meal to cart:', error);
      toast({
        title: "Error Adding Item",
        description: error instanceof Error ? error.message : "Unable to add item to cart",
        variant: "destructive"
      });
    } finally {
      setIsAddingToCart(false);
      console.log("MealCard: Finished adding to cart, isAddingToCart:", false);
    }
  };

  console.log("MealCard: Rendering meal card for:", name, "isAddingToCart:", isAddingToCart);

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

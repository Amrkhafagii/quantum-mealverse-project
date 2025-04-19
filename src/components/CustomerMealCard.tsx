
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useCart } from '@/contexts/CartContext';
import { MealType } from '@/types/meal';

interface CustomerMealCardProps {
  meal: MealType;
}

export const CustomerMealCard: React.FC<CustomerMealCardProps> = ({ meal }) => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(meal, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} × ${meal.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  return (
    <Card className="holographic-card p-6 transition-all duration-300 hover:scale-105">
      <div className="space-y-4">
        {meal.image_url && (
          <div className="aspect-video overflow-hidden rounded-lg">
            <img 
              src={meal.image_url} 
              alt={meal.name} 
              className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
            />
          </div>
        )}
        <h3 className="text-2xl font-bold text-quantum-cyan neon-text">{meal.name}</h3>
        <p className="text-sm text-gray-300 line-clamp-2">{meal.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-quantum-cyan">{(meal.price * 50).toFixed(2)} EGP</span>
          <span className="text-sm text-galaxy-purple">{meal.calories} kcal</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-quantum-black/50 p-2 rounded-lg">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-quantum-cyan" 
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-6 text-center">{quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-quantum-cyan" 
              onClick={incrementQuantity}
              disabled={quantity >= 10}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={handleAddToCart}
            className="cyber-button flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
};

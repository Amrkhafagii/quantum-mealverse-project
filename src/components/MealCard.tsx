
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

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

  const handleAddToCart = () => {
    addItem({
      id: Math.random().toString(36).substring(2, 9), // Temporary ID for demo
      name,
      description,
      price,
      calories,
      macros,
      quantity: 1
    });
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
        <Button 
          onClick={handleAddToCart}
          className="w-full cyber-button flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
};

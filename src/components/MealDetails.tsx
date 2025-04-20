
import React, { useState } from 'react';
import { MealType } from '@/types/meal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { MealReviews } from './MealReviews';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

interface MealDetailsProps {
  meal: MealType;
  onAddToCart: (meal: MealType, quantity: number) => void;
  quantity?: number;
  setQuantity?: (quantity: number) => void;
  inCart?: boolean;
  restaurantId?: string;
}

const MealDetails: React.FC<MealDetailsProps> = ({ 
  meal, 
  onAddToCart, 
  quantity = 1, 
  setQuantity, 
  inCart = false,
  restaurantId
}) => {
  const [mealQuantity, setMealQuantity] = useState(quantity);
  const { displayPrice } = useCurrencyConverter();
  
  const handleAddToCart = () => {
    if (meal) {
      onAddToCart(meal, mealQuantity);
    }
  };
  
  return (
    <div className="bg-quantum-black text-white">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="relative group">
          <div className="relative overflow-hidden rounded-2xl border-2 border-quantum-cyan/20 aspect-video">
            <img
              src={meal.image_url || `https://picsum.photos/seed/${meal.id}/600/400`}
              alt={meal.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://picsum.photos/seed/${meal.id}/600/400`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-quantum-black/80 to-transparent" />
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold neon-text mb-2">{meal.name}</h1>
            <p className="text-gray-400 text-lg">{meal.description}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-quantum-darkBlue p-4 rounded-xl border border-quantum-cyan/20">
                <p className="text-quantum-cyan text-sm">Calories</p>
                <p className="text-2xl font-bold">{meal.calories}</p>
              </div>
              <div className="bg-quantum-darkBlue p-4 rounded-xl border border-quantum-cyan/20">
                <p className="text-quantum-cyan text-sm">Protein</p>
                <p className="text-2xl font-bold">{meal.protein}g</p>
              </div>
              <div className="bg-quantum-darkBlue p-4 rounded-xl border border-quantum-cyan/20">
                <p className="text-quantum-cyan text-sm">Carbs</p>
                <p className="text-2xl font-bold">{meal.carbs}g</p>
              </div>
              <div className="bg-quantum-darkBlue p-4 rounded-xl border border-quantum-cyan/20">
                <p className="text-quantum-cyan text-sm">Fat</p>
                <p className="text-2xl font-bold">{meal.fat}g</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-quantum-cyan">
                {displayPrice(meal.price)}
              </span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-quantum-darkBlue rounded-lg p-1 border border-quantum-cyan/20">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-quantum-cyan hover:text-white hover:bg-quantum-cyan/20"
                    onClick={() => setMealQuantity(Math.max(1, mealQuantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={mealQuantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setMealQuantity(isNaN(value) ? 1 : value);
                    }}
                    className="w-16 text-center bg-transparent border-none text-white"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-quantum-cyan hover:text-white hover:bg-quantum-cyan/20"
                    onClick={() => setMealQuantity(mealQuantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black font-bold px-8"
                  onClick={handleAddToCart}
                  disabled={inCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {inCart ? 'In Cart' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <MealReviews 
          mealId={meal.id || ''} 
          restaurantId={restaurantId || ''}
        />
      </div>
    </div>
  );
};

export default MealDetails;

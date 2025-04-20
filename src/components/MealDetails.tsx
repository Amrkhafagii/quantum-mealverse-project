
import React, { useState } from 'react';
import { MealType } from '@/types/meal';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const { addItem } = useCart();
  const [mealQuantity, setMealQuantity] = useState(quantity);
  const { displayPrice } = useCurrencyConverter();
  
  const handleAddToCart = () => {
    if (meal) {
      addItem({
        ...meal,
        quantity: mealQuantity
      });
      toast.success(`${meal.name} added to cart!`);
    }
  };
  
  return (
    <div className="bg-quantum-black text-white relative p-6 rounded-2xl border border-quantum-cyan/30 backdrop-blur-sm">
      <div className="mb-4">
        <h2 className="text-3xl font-bold neon-text">{meal.name}</h2>
        <p className="text-gray-400">{meal.description}</p>
      </div>
      
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={meal.image_url || `https://picsum.photos/seed/${meal.id}/600/400`}
          alt={meal.name}
          className="w-full h-64 object-cover rounded-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://picsum.photos/seed/${meal.id}/600/400`;
          }}
        />
      </div>
      
      <div className="mt-6">
        <h3 className="text-xl font-semibold neon-text">Nutritional Information</h3>
        <ul className="list-disc pl-5 text-gray-300">
          <li>Calories: {meal.calories}</li>
          <li>Protein: {meal.protein}g</li>
          <li>Fat: {meal.fat}g</li>
          <li>Carbohydrates: {meal.carbs}g</li>
        </ul>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold neon-text">Price</h3>
          <p className="text-2xl">{displayPrice(meal.price)}</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMealQuantity(Math.max(1, mealQuantity - 1))}
              >
                -
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={mealQuantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setMealQuantity(isNaN(value) ? 1 : value);
                }}
                className="w-16 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMealQuantity(mealQuantity + 1)}
              >
                +
              </Button>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={inCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {inCart ? 'In Cart' : 'Add to Cart'}
          </Button>
        </div>
      </div>
      
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

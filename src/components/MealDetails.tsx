import React, { useState } from 'react';
import { MealType } from '@/types/meal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus, UtensilsCrossed, ScrollText } from 'lucide-react';
import { MealReviews } from './MealReviews';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { ARMealPreview } from '@/components/ui/ARMealPreview';

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
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const { displayPrice } = useCurrencyConverter();
  const { toast } = useToast();
  
  const handleQuantityChange = (newQuantity: number) => {
    const updatedQuantity = Math.max(1, newQuantity);
    setLocalQuantity(updatedQuantity);
    if (setQuantity) {
      setQuantity(updatedQuantity);
    }
  };
  
  const handleAddToCart = () => {
    if (meal) {
      onAddToCart(meal, localQuantity);
      toast({
        title: "Added to cart",
        description: `${localQuantity} × ${meal.name} added to your cart`,
      });
    }
  };

  // Helper function to get nutritional values regardless of where they're stored
  const getNutritionalValue = (key: 'calories' | 'protein' | 'carbs' | 'fat') => {
    if (meal.nutritional_info && meal.nutritional_info[key] !== undefined) {
      return meal.nutritional_info[key];
    }
    return meal[key];
  };
  
  return (
    <div className="bg-quantum-black text-white">
      <div className="grid md:grid-cols-2 gap-8">
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

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold neon-text mb-2">{meal.name}</h1>
            <p className="text-gray-400 text-lg">{meal.description}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-quantum-darkBlue p-4 rounded-xl border border-quantum-cyan/20">
                <p className="text-quantum-cyan text-sm">Calories</p>
                <p className="text-2xl font-bold">{getNutritionalValue('calories')}</p>
              </div>
              <div className="bg-quantum-darkBlue p-4 rounded-xl border border-quantum-cyan/20">
                <p className="text-quantum-cyan text-sm">Protein</p>
                <p className="text-2xl font-bold">{getNutritionalValue('protein')}g</p>
              </div>
              <div className="bg-quantum-darkBlue p-4 rounded-xl border border-quantum-cyan/20">
                <p className="text-quantum-cyan text-sm">Carbs</p>
                <p className="text-2xl font-bold">{getNutritionalValue('carbs')}g</p>
              </div>
              <div className="bg-quantum-darkBlue p-4 rounded-xl border border-quantum-cyan/20">
                <p className="text-quantum-cyan text-sm">Fat</p>
                <p className="text-2xl font-bold">{getNutritionalValue('fat')}g</p>
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
                    onClick={() => handleQuantityChange(Math.max(1, localQuantity - 1))}
                    type="button"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={localQuantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      handleQuantityChange(isNaN(value) ? 1 : value);
                    }}
                    className="w-16 text-center bg-transparent border-none text-white"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-quantum-cyan hover:text-white hover:bg-quantum-cyan/20"
                    onClick={() => handleQuantityChange(localQuantity + 1)}
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black font-bold px-8"
                  onClick={handleAddToCart}
                  disabled={inCart}
                  type="button"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {inCart ? 'In Cart' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="ingredients" className="border-quantum-cyan/20">
            <AccordionTrigger className="text-xl font-bold text-quantum-cyan hover:text-quantum-cyan/80">
              <UtensilsCrossed className="mr-2 h-5 w-5" />
              Ingredients
            </AccordionTrigger>
            <AccordionContent>
              <Card className="bg-quantum-darkBlue border-quantum-cyan/20">
                <CardContent className="pt-6">
                  {meal.ingredients && meal.ingredients.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {meal.ingredients.map((ingredient, index) => (
                        <li key={index} className="text-gray-300">{ingredient}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 italic">No ingredients listed for this meal.</p>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="steps" className="border-quantum-cyan/20">
            <AccordionTrigger className="text-xl font-bold text-quantum-cyan hover:text-quantum-cyan/80">
              <ScrollText className="mr-2 h-5 w-5" />
              Cooking Steps
            </AccordionTrigger>
            <AccordionContent>
              <Card className="bg-quantum-darkBlue border-quantum-cyan/20">
                <CardContent className="pt-6">
                  {meal.steps && meal.steps.length > 0 ? (
                    <ol className="list-decimal pl-5 space-y-4">
                      {meal.steps.map((step, index) => (
                        <li key={index} className="text-gray-300">
                          <p>{step}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-400 italic">No cooking steps available for this meal.</p>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-12">
        <ARMealPreview
          mealId={meal.id}
          mealName={meal.name}
          className="w-full mt-8"
        />
        <MealReviews 
          mealId={meal.id || ''} 
          restaurantId={restaurantId || ''}
        />
      </div>
    </div>
  );
};

export default MealDetails;

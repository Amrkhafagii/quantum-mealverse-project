
import React, { useState } from 'react';
import { Food } from '@/types/food';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info, Check, Utensils, Plus, Minus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InteractiveMealCardProps {
  food: Food;
  defaultServings?: number;
  onAdd?: (food: Food, servings: number) => void;
  showAddButton?: boolean;
  showNutrients?: boolean;
}

const InteractiveMealCard: React.FC<InteractiveMealCardProps> = ({
  food,
  defaultServings = 1,
  onAdd,
  showAddButton = true,
  showNutrients = true,
}) => {
  const [servings, setServings] = useState(defaultServings);
  const [isAdded, setIsAdded] = useState(false);

  const handleServingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value > 0) {
      setServings(value);
    }
  };

  const handleAddFood = () => {
    if (onAdd) {
      onAdd(food, servings);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const increaseServings = () => {
    setServings(prev => parseFloat((prev + 0.5).toFixed(1)));
  };

  const decreaseServings = () => {
    if (servings > 0.5) {
      setServings(prev => parseFloat((prev - 0.5).toFixed(1)));
    }
  };

  const totalCalories = Math.round(food.calories * servings);
  const totalProtein = Math.round(food.protein * servings);
  const totalCarbs = Math.round(food.carbs * servings);
  const totalFat = Math.round(food.fat * servings);

  return (
    <Card className="overflow-hidden bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium flex items-center">
              <Utensils className="h-4 w-4 mr-1 text-quantum-purple" />
              {food.name}
            </h4>
            <p className="text-sm text-gray-400">
              {food.serving_size} {food.unit} per serving
            </p>
          </div>
          {food.allergies && food.allergies.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-orange-500">
                    <Info className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Contains: {food.allergies.join(', ')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 my-3 text-center">
          <div>
            <div className="text-xs text-gray-400">Calories</div>
            <div className="font-bold">{totalCalories}</div>
          </div>
          {showNutrients && (
            <>
              <div>
                <div className="text-xs text-gray-400">Protein</div>
                <div>{totalProtein}g</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Carbs</div>
                <div>{totalCarbs}g</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Fat</div>
                <div>{totalFat}g</div>
              </div>
            </>
          )}
        </div>

        {showAddButton && (
          <div className="mt-2">
            <div className="flex items-center space-x-2 mb-2">
              <Label htmlFor="servings" className="shrink-0 text-sm">
                Servings:
              </Label>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={decreaseServings}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  id="servings"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={servings}
                  onChange={handleServingChange}
                  className="h-8 w-16 mx-2 text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={increaseServings}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {showAddButton && (
        <CardFooter className="pt-0">
          <Button
            onClick={handleAddFood}
            disabled={isAdded}
            className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
            size="sm"
          >
            {isAdded ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add to Meal
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default InteractiveMealCard;

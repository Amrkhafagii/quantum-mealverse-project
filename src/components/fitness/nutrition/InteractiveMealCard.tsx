
import React from 'react';
import { Meal, Food } from '@/types/food'; 
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Info, ShoppingCart } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InteractiveMealCardProps {
  meal: Meal;
  onShuffle: () => void;
  isProteinSufficient: boolean;
}

const InteractiveMealCard: React.FC<InteractiveMealCardProps> = ({
  meal,
  onShuffle,
  isProteinSufficient,
}) => {
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20 overflow-hidden h-full">
      <CardContent className="p-3">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-quantum-cyan font-medium">{meal.name}</h3>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>{meal.totalCalories} kcal</span>
              <span className="text-blue-400">P: {meal.totalProtein}g</span>
              <span className="text-green-400">C: {meal.totalCarbs}g</span>
              <span className="text-yellow-400">F: {meal.totalFat}g</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isProteinSufficient && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-amber-900/30 border-amber-600">
                      <Info className="h-3 w-3 mr-1" />
                      Low P
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">This meal is low in protein. Consider reshuffling.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <Button
              onClick={onShuffle}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-quantum-purple/20 scrollbar-track-transparent pr-2">
          <div className="space-y-1">
            {meal.foods.map((mealFood, index) => (
              <div key={index} className="bg-quantum-black/30 p-2 rounded text-sm flex justify-between items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center gap-1 text-white">
                        {mealFood.food.name} 
                        <span className="text-gray-400 text-xs">({mealFood.portionSize}g)</span>
                        {mealFood.food.cookingState && (
                          <Info className="h-3 w-3 text-gray-500" />
                        )}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">{mealFood.food.cookingState === 'cooked' ? 'Cooked weight' : 'Raw weight'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-gray-400 text-xs">{mealFood.food.calories} kcal</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <div className="text-xs text-gray-400">
            {meal.foods.length} items
          </div>
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto text-quantum-purple flex items-center"
            onClick={() => {
              // Handle order functionality
              console.log(`Ordering meal: ${meal.name}`);
            }}
          >
            Order <ShoppingCart className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMealCard;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, ChevronDown, ChevronUp, Shuffle, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Meal, MealFood } from '@/types/food';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import RestaurantMealMatcher from './RestaurantMealMatcher';

interface InteractiveMealCardProps {
  meal: Meal;
  onShuffle: () => void;
  isProteinSufficient: boolean;
}

const InteractiveMealCard: React.FC<InteractiveMealCardProps> = ({ 
  meal, 
  onShuffle,
  isProteinSufficient
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getMealCategoryColor = (category: string) => {
    switch (category) {
      case 'protein': return 'bg-blue-500/30 border-blue-500/50 text-blue-300';
      case 'carbs': return 'bg-green-500/30 border-green-500/50 text-green-300';
      case 'fats': return 'bg-yellow-500/30 border-yellow-500/50 text-yellow-300';
      case 'vegetables': return 'bg-purple-500/30 border-purple-500/50 text-purple-300';
      default: return 'bg-gray-500/30 border-gray-500/50 text-gray-300';
    }
  };

  // Function to render an appropriate meal icon based on meal name
  const renderMealIcon = () => {
    if (meal.name.toLowerCase().includes('breakfast')) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
    } else if (meal.name.toLowerCase().includes('lunch')) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2"/><path d="M18 15V2"/><path d="M21 15a3 3 0 1 1-6 0"/></svg>;
    } else if (meal.name.toLowerCase().includes('dinner')) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M8.21 13.89 7 23l-3-3-2-4-1-7 9.21 4.89Z"/><path d="M14 13.5V22l4 1 3-3 1-6-8-1Z"/><path d="M10.53 9.33 8.57 7.37A1.45 1.45 0 0 1 9.17 4.5a5.07 5.07 0 0 1 5.66 5.66 1.45 1.45 0 0 1-2.87.6l-1.96-1.96Z"/><path d="M14 6.5v.5"/></svg>;
    } else {
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>;
    }
  };

  return (
    <div className="animate-fade-in">
      <Card className={cn(
        "transition-all duration-300 overflow-hidden border",
        !isProteinSufficient ? "border-red-500/50" : "border-quantum-purple/20"
      )}>
        <CardHeader className="pb-2 relative">
          <div className="absolute -right-1 -top-1">
            {!isProteinSufficient && (
              <Badge className="bg-red-500 hover:bg-red-600">
                Low Protein
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-quantum-cyan">
            {renderMealIcon()}
            {meal.name}
          </CardTitle>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {meal.totalCalories} kcal
            </div>
            
            <div className="flex gap-2 text-sm">
              <span className="text-blue-300">{meal.totalProtein}g P</span>
              <span className="text-green-300">{meal.totalCarbs}g C</span>
              <span className="text-yellow-300">{meal.totalFat}g F</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-2">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex justify-between items-center p-2 hover:bg-quantum-darkBlue/30 rounded-md transition-colors cursor-pointer">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-300 flex items-center">
                  <Utensils className="h-4 w-4 mr-2 text-quantum-cyan/70" />
                  {isOpen ? "Hide details" : "View meal details"}
                </span>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="p-2 bg-quantum-black/30 rounded-md mt-2">
              <div className="grid gap-2">
                {meal.foods.map((mealFood) => (
                  <div 
                    key={`${meal.id}-${mealFood.food.id}`} 
                    className={cn("flex justify-between items-center p-2 border rounded-md", 
                      getMealCategoryColor(mealFood.food.category))}
                  >
                    <div>
                      <div className="font-medium flex items-center">
                        {mealFood.food.name}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="ml-1 inline-flex">
                                <Info className="h-3.5 w-3.5 text-gray-400" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs mb-1">
                                {mealFood.food.cookingState === "cooked" 
                                  ? "Values based on cooked weight" 
                                  : "Values based on raw/uncooked weight"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="text-xs text-gray-300">{mealFood.portionSize}g</div>
                    </div>
                    <div className="text-right text-xs">
                      <div>{Math.round(mealFood.food.calories * mealFood.portionSize / 100)} kcal</div>
                      <div className="text-gray-400">
                        P: {Math.round(mealFood.food.protein * mealFood.portionSize / 100)}g · 
                        C: {Math.round(mealFood.food.carbs * mealFood.portionSize / 100)}g · 
                        F: {Math.round(mealFood.food.fat * mealFood.portionSize / 100)}g
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <Button 
            variant="outline"
            size="sm" 
            className="w-full mt-3 border-quantum-cyan/30 hover:bg-quantum-cyan/10 text-quantum-cyan"
            onClick={onShuffle}
          >
            <Shuffle className="h-3.5 w-3.5 mr-2" />
            Shuffle Meal Options
          </Button>
          
          <RestaurantMealMatcher
            mealFoods={meal.foods}
            mealName={meal.name}
            mealCalories={meal.totalCalories}
            mealProtein={meal.totalProtein}
            mealCarbs={meal.totalCarbs}
            mealFat={meal.totalFat}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveMealCard;

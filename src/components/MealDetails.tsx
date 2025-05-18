
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StarRating } from './reviews/StarRating';
import { PlusCircle, ChevronDown, Clock, Utensils, Info, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ARMealPreview } from './ARMealPreview'; // Fixed import path

const MacroNutrient = ({ name, value, percentage, color }: { name: string, value: string, percentage: number, color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-gray-300">{name}</span>
      <span className="font-medium">{value}</span>
    </div>
    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

export interface MealDetailsProps {
  name: string;
  description: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  onAddToCart?: () => void;
  showAR?: boolean;
}

export const MealDetails: React.FC<MealDetailsProps> = ({
  name,
  description,
  price,
  rating = 0,
  reviewCount = 0,
  calories,
  macros,
  onAddToCart,
  showAR = false,
}) => {
  const totalMacros = macros.protein + macros.carbs + macros.fat;

  return (
    <Card className="holographic-card border-0 overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold text-quantum-cyan">{name}</CardTitle>
            <div className="flex items-center mt-1.5 space-x-2">
              {rating > 0 && (
                <>
                  <StarRating value={rating} readOnly />
                  <span className="text-sm text-gray-400">({reviewCount})</span>
                </>
              )}
              <Badge variant="outline" className="ml-2 border-quantum-cyan text-quantum-cyan">
                <Clock className="w-3 h-3 mr-1" />
                30 min
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-quantum-cyan">${price.toFixed(2)}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="text-gray-300 leading-relaxed">{description}</CardDescription>
        
        {showAR && (
          <div className="my-4">
            <ARMealPreview modelName={name.toLowerCase().replace(/\s+/g, '-')} />
          </div>
        )}
        
        <div className="space-y-4 mt-6">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-quantum-cyan" />
            <h3 className="text-lg font-semibold">Nutrition Information</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-amber-400" />
                  <span className="text-gray-300">Calories</span>
                </div>
                <span className="font-bold text-lg">{calories}</span>
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Utensils className="h-4 w-4 mr-2 text-green-400" />
                  <span className="text-gray-300">Portion</span>
                </div>
                <span className="font-bold">1 serving</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 bg-gray-800/50 p-4 rounded-lg">
            <MacroNutrient 
              name="Protein" 
              value={`${macros.protein}g`} 
              percentage={(macros.protein / totalMacros) * 100} 
              color="bg-blue-500" 
            />
            <MacroNutrient 
              name="Carbs" 
              value={`${macros.carbs}g`} 
              percentage={(macros.carbs / totalMacros) * 100} 
              color="bg-amber-500" 
            />
            <MacroNutrient 
              name="Fat" 
              value={`${macros.fat}g`} 
              percentage={(macros.fat / totalMacros) * 100} 
              color="bg-red-500" 
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={onAddToCart} 
          className="w-full bg-quantum-cyan hover:bg-quantum-cyan/80 text-black"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

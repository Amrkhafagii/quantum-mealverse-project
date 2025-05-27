
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Meal } from '@/types/food';
import { MealCustomizationSummary } from '@/types/mealCustomization';

interface CustomizationSummaryProps {
  meal: Meal;
  summary: MealCustomizationSummary | null;
  loading: boolean;
}

export const CustomizationSummary: React.FC<CustomizationSummaryProps> = ({
  meal,
  summary,
  loading
}) => {
  if (loading) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatNutrition = (value: number) => Math.round(value);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meal Info */}
        <div>
          <h4 className="font-medium text-base">{meal.name}</h4>
          <p className="text-sm text-gray-600">{meal.description}</p>
        </div>

        <Separator />

        {/* Price Breakdown */}
        {summary && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Base Price:</span>
              <span>{formatPrice(summary.base_price)}</span>
            </div>
            
            {summary.portion_adjustment !== 0 && (
              <div className="flex justify-between text-sm">
                <span>Portion Adjustment:</span>
                <span className={summary.portion_adjustment > 0 ? 'text-orange-600' : 'text-green-600'}>
                  {summary.portion_adjustment > 0 ? '+' : ''}{formatPrice(summary.portion_adjustment)}
                </span>
              </div>
            )}
            
            {summary.substitution_cost !== 0 && (
              <div className="flex justify-between text-sm">
                <span>Substitutions:</span>
                <span className={summary.substitution_cost > 0 ? 'text-orange-600' : 'text-green-600'}>
                  {summary.substitution_cost > 0 ? '+' : ''}{formatPrice(summary.substitution_cost)}
                </span>
              </div>
            )}
            
            {summary.option_cost !== 0 && (
              <div className="flex justify-between text-sm">
                <span>Additional Options:</span>
                <span className={summary.option_cost > 0 ? 'text-orange-600' : 'text-green-600'}>
                  {summary.option_cost > 0 ? '+' : ''}{formatPrice(summary.option_cost)}
                </span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span className="text-lg">{formatPrice(summary.total_cost)}</span>
            </div>
          </div>
        )}

        <Separator />

        {/* Nutritional Changes */}
        {summary && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Nutritional Information</h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Calories:</span>
                <div className="flex items-center gap-1">
                  <span>{meal.totalCalories}</span>
                  {summary.nutritional_changes.calories !== 0 && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-1 py-0 ${
                        summary.nutritional_changes.calories > 0 ? 'text-orange-600' : 'text-green-600'
                      }`}
                    >
                      {summary.nutritional_changes.calories > 0 ? '+' : ''}{formatNutrition(summary.nutritional_changes.calories)}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between">
                <span>Protein:</span>
                <div className="flex items-center gap-1">
                  <span>{meal.totalProtein}g</span>
                  {summary.nutritional_changes.protein !== 0 && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-1 py-0 ${
                        summary.nutritional_changes.protein > 0 ? 'text-green-600' : 'text-orange-600'
                      }`}
                    >
                      {summary.nutritional_changes.protein > 0 ? '+' : ''}{formatNutrition(summary.nutritional_changes.protein)}g
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between">
                <span>Carbs:</span>
                <div className="flex items-center gap-1">
                  <span>{meal.totalCarbs}g</span>
                  {summary.nutritional_changes.carbs !== 0 && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-1 py-0 ${
                        summary.nutritional_changes.carbs > 0 ? 'text-blue-600' : 'text-green-600'
                      }`}
                    >
                      {summary.nutritional_changes.carbs > 0 ? '+' : ''}{formatNutrition(summary.nutritional_changes.carbs)}g
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between">
                <span>Fat:</span>
                <div className="flex items-center gap-1">
                  <span>{meal.totalFat}g</span>
                  {summary.nutritional_changes.fat !== 0 && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-1 py-0 ${
                        summary.nutritional_changes.fat > 0 ? 'text-yellow-600' : 'text-green-600'
                      }`}
                    >
                      {summary.nutritional_changes.fat > 0 ? '+' : ''}{formatNutrition(summary.nutritional_changes.fat)}g
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {summary.nutritional_changes.fiber !== 0 && (
              <div className="flex justify-between text-xs">
                <span>Fiber:</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    summary.nutritional_changes.fiber > 0 ? 'text-green-600' : 'text-orange-600'
                  }`}
                >
                  {summary.nutritional_changes.fiber > 0 ? '+' : ''}{formatNutrition(summary.nutritional_changes.fiber)}g
                </Badge>
              </div>
            )}

            {summary.nutritional_changes.sodium !== 0 && (
              <div className="flex justify-between text-xs">
                <span>Sodium:</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    summary.nutritional_changes.sodium > 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {summary.nutritional_changes.sodium > 0 ? '+' : ''}{formatNutrition(summary.nutritional_changes.sodium)}mg
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

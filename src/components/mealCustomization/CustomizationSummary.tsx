
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Meal } from '@/types/food';
import { MealCustomizationSummary } from '@/types/mealCustomization';
import { Clock, DollarSign } from 'lucide-react';

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
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meal Info */}
        <div>
          <h3 className="font-medium">{meal.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{meal.totalTime || 30} mins</span>
          </div>
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        {summary ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Base price:</span>
              <span>${summary.base_price.toFixed(2)}</span>
            </div>
            
            {summary.portion_adjustment !== 0 && (
              <div className="flex justify-between text-sm">
                <span>Portion adjustment:</span>
                <span className={summary.portion_adjustment > 0 ? 'text-red-600' : 'text-green-600'}>
                  {summary.portion_adjustment > 0 ? '+' : ''}${summary.portion_adjustment.toFixed(2)}
                </span>
              </div>
            )}
            
            {summary.substitution_cost !== 0 && (
              <div className="flex justify-between text-sm">
                <span>Substitutions:</span>
                <span className={summary.substitution_cost > 0 ? 'text-red-600' : 'text-green-600'}>
                  {summary.substitution_cost > 0 ? '+' : ''}${summary.substitution_cost.toFixed(2)}
                </span>
              </div>
            )}
            
            {summary.option_cost !== 0 && (
              <div className="flex justify-between text-sm">
                <span>Options:</span>
                <span className={summary.option_cost > 0 ? 'text-red-600' : 'text-green-600'}>
                  {summary.option_cost > 0 ? '+' : ''}${summary.option_cost.toFixed(2)}
                </span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>${summary.total_cost.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Customize your meal to see pricing</p>
          </div>
        )}

        {/* Nutritional Changes */}
        {summary && Object.values(summary.nutritional_changes).some(val => val !== 0) && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-sm mb-2">Nutritional Changes:</h4>
              <div className="space-y-1">
                {Object.entries(summary.nutritional_changes).map(([key, value]) => {
                  if (value === 0) return null;
                  return (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="capitalize">{key}:</span>
                      <Badge variant={value > 0 ? "default" : "secondary"} className="text-xs">
                        {value > 0 ? '+' : ''}{value.toFixed(1)}
                        {key === 'calories' ? ' cal' : key === 'sodium' ? ' mg' : ' g'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

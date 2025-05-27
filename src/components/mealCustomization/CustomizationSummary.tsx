
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign } from 'lucide-react';
import { Meal } from '@/types/meal';

interface CustomizationSummaryProps {
  meal: Meal;
  customizations?: any[];
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const CustomizationSummary: React.FC<CustomizationSummaryProps> = ({
  meal,
  customizations = [],
  onConfirm,
  onCancel
}) => {
  const calculateTotalPrice = () => {
    const customizationPrice = customizations.reduce((total, custom) => {
      return total + (custom.priceImpact || 0);
    }, 0);
    return meal.price + customizationPrice;
  };

  const calculateTotalTime = () => {
    const customizationTime = customizations.reduce((total, custom) => {
      return total + (custom.timeImpact || 0);
    }, 0);
    return (meal.preparation_time || 30) + customizationTime;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order Summary</span>
          <Badge variant="outline">
            ${calculateTotalPrice().toFixed(2)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium">{meal.name}</h3>
          {meal.description && (
            <p className="text-sm text-gray-600 mt-1">
              {meal.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Prep time: {calculateTotalTime()} min</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>Base price: ${meal.price.toFixed(2)}</span>
          </div>
        </div>
        
        {customizations.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Customizations:</h4>
            <div className="space-y-2">
              {customizations.map((custom, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{custom.name}</span>
                  <span>
                    {custom.priceImpact > 0 ? '+' : ''}
                    ${custom.priceImpact?.toFixed(2) || '0.00'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="border-t pt-4">
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>${calculateTotalPrice().toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1"
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

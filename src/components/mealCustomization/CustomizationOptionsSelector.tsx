
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MealCustomizationOption } from '@/types/mealCustomization';
import { Plus, X } from 'lucide-react';

interface CustomizationOptionsSelectorProps {
  availableOptions: MealCustomizationOption[];
  selectedOptions: MealCustomizationOption[];
  onAddOption: (option: MealCustomizationOption) => void;
  onRemoveOption: (optionId: string) => void;
}

export const CustomizationOptionsSelector: React.FC<CustomizationOptionsSelectorProps> = ({
  availableOptions,
  selectedOptions,
  onAddOption,
  onRemoveOption
}) => {
  const groupedOptions = availableOptions.reduce((acc, option) => {
    if (!acc[option.customization_type]) {
      acc[option.customization_type] = [];
    }
    acc[option.customization_type].push(option);
    return acc;
  }, {} as Record<string, MealCustomizationOption[]>);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ingredient_substitution': return 'Ingredient Substitutions';
      case 'dietary_modification': return 'Dietary Modifications';
      case 'portion_adjustment': return 'Portion Adjustments';
      case 'preparation_method': return 'Preparation Methods';
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Additional Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected options */}
        {selectedOptions.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Selected Options:</h4>
            <div className="space-y-2">
              {selectedOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{option.option_name}</p>
                    {option.option_description && (
                      <p className="text-xs text-gray-600">{option.option_description}</p>
                    )}
                    {option.price_adjustment !== 0 && (
                      <p className="text-xs text-blue-600">
                        {option.price_adjustment > 0 ? '+' : ''}${option.price_adjustment.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveOption(option.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available options by category */}
        {Object.entries(groupedOptions).map(([type, options]) => {
          const unselectedOptions = options.filter(
            option => !selectedOptions.find(selected => selected.id === option.id)
          );

          if (unselectedOptions.length === 0) return null;

          return (
            <div key={type}>
              <h4 className="font-medium mb-2">{getTypeLabel(type)}:</h4>
              <div className="space-y-2">
                {unselectedOptions.map((option) => (
                  <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{option.option_name}</p>
                      {option.option_description && (
                        <p className="text-xs text-gray-600">{option.option_description}</p>
                      )}
                      {option.price_adjustment !== 0 && (
                        <Badge variant={option.price_adjustment > 0 ? "destructive" : "secondary"} className="mt-1">
                          {option.price_adjustment > 0 ? '+' : ''}${option.price_adjustment.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddOption(option)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {Object.keys(groupedOptions).length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No additional customization options available for this meal.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

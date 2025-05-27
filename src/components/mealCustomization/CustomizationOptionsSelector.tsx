
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MealCustomizationOption } from '@/types/mealCustomization';

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
  const formatPrice = (price: number) => {
    return price >= 0 ? `+$${price.toFixed(2)}` : `-$${Math.abs(price).toFixed(2)}`;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ingredient_substitution':
        return 'Ingredient';
      case 'dietary_modification':
        return 'Dietary';
      case 'portion_adjustment':
        return 'Portion';
      case 'preparation_method':
        return 'Preparation';
      default:
        return 'Other';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ingredient_substitution':
        return 'bg-blue-100 text-blue-800';
      case 'dietary_modification':
        return 'bg-green-100 text-green-800';
      case 'portion_adjustment':
        return 'bg-orange-100 text-orange-800';
      case 'preparation_method':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOptionToggle = (option: MealCustomizationOption, isChecked: boolean) => {
    if (isChecked) {
      onAddOption(option);
    } else {
      onRemoveOption(option.id);
    }
  };

  // Group options by type
  const groupedOptions = availableOptions.reduce((groups, option) => {
    const type = option.customization_type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(option);
    return groups;
  }, {} as Record<string, MealCustomizationOption[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Additional Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedOptions).map(([type, options]) => (
          <div key={type} className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Badge className={`text-xs ${getTypeColor(type)}`}>
                {getTypeLabel(type)}
              </Badge>
              Options
            </h4>
            
            <div className="space-y-2">
              {options.map((option) => {
                const isSelected = selectedOptions.some(selected => selected.id === option.id);
                
                return (
                  <div
                    key={option.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`option-${option.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleOptionToggle(option, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={`option-${option.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {option.option_name}
                      </Label>
                      {option.option_description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {option.option_description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatPrice(option.price_adjustment)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(groupedOptions).length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No additional options available for this meal.
          </p>
        )}

        {selectedOptions.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">
              Selected options: {selectedOptions.length}
            </p>
            <p className="text-sm text-blue-600">
              Total additional cost: ${selectedOptions.reduce((sum, option) => sum + option.price_adjustment, 0).toFixed(2)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

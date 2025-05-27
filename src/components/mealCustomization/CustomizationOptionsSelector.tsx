
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
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
  const isSelected = (id: string) => selectedOptions.some(opt => opt.id === id);

  const groupedOptions = availableOptions.reduce((acc, option) => {
    const type = option.customization_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(option);
    return acc;
  }, {} as Record<string, MealCustomizationOption[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Additional Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedOptions.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Selected Options:</h4>
            <div className="space-y-2">
              {selectedOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{option.option_name}</span>
                    {option.option_description && (
                      <p className="text-xs text-gray-600">{option.option_description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {option.price_adjustment !== 0 && (
                      <Badge variant="outline">
                        {option.price_adjustment > 0 ? '+' : ''}${option.price_adjustment.toFixed(2)}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveOption(option.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.entries(groupedOptions).map(([type, options]) => (
          <div key={type}>
            <h4 className="font-medium mb-2 capitalize">
              {type.replace('_', ' ')} Options:
            </h4>
            <div className="space-y-2">
              {options.map((option) => (
                <div key={option.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{option.option_name}</span>
                    {option.option_description && (
                      <p className="text-xs text-gray-600">{option.option_description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {option.price_adjustment !== 0 && (
                      <Badge variant="outline">
                        {option.price_adjustment > 0 ? '+' : ''}${option.price_adjustment.toFixed(2)}
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddOption(option)}
                      disabled={isSelected(option.id)}
                      className="h-8"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

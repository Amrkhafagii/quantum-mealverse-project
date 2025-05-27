
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { IngredientSubstitution } from '@/types/mealCustomization';

interface IngredientSubstitutionSelectorProps {
  availableSubstitutions: IngredientSubstitution[];
  selectedSubstitutions: IngredientSubstitution[];
  onAddSubstitution: (substitution: IngredientSubstitution) => void;
  onRemoveSubstitution: (substitutionId: string) => void;
}

export const IngredientSubstitutionSelector: React.FC<IngredientSubstitutionSelectorProps> = ({
  availableSubstitutions,
  selectedSubstitutions,
  onAddSubstitution,
  onRemoveSubstitution
}) => {
  const formatPrice = (price: number) => {
    return price >= 0 ? `+$${price.toFixed(2)}` : `-$${Math.abs(price).toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ingredient Substitutions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Substitutions */}
        {selectedSubstitutions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Selected Substitutions:</h4>
            {selectedSubstitutions.map((substitution) => (
              <div
                key={substitution.id}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {substitution.original_ingredient} → {substitution.substitute_ingredient}
                  </p>
                  {substitution.substitution_reason && (
                    <p className="text-xs text-gray-600">{substitution.substitution_reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {formatPrice(substitution.price_adjustment)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveSubstitution(substitution.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Available Substitutions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Available Substitutions:</h4>
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {availableSubstitutions
              .filter(sub => !selectedSubstitutions.find(selected => selected.id === sub.id))
              .map((substitution) => (
                <div
                  key={substitution.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {substitution.original_ingredient} → {substitution.substitute_ingredient}
                    </p>
                    {substitution.substitution_reason && (
                      <p className="text-xs text-gray-600">{substitution.substitution_reason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {formatPrice(substitution.price_adjustment)}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddSubstitution(substitution)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {availableSubstitutions.filter(sub => !selectedSubstitutions.find(selected => selected.id === sub.id)).length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No more substitutions available or all have been selected.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

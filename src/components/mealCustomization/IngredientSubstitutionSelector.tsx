
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
  const isSelected = (id: string) => selectedSubstitutions.some(sub => sub.id === id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ingredient Substitutions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedSubstitutions.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Selected Substitutions:</h4>
            <div className="space-y-2">
              {selectedSubstitutions.map((substitution) => (
                <div key={substitution.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm font-medium">
                      {substitution.original_ingredient} → {substitution.substitute_ingredient}
                    </span>
                    {substitution.substitution_reason && (
                      <p className="text-xs text-gray-600">{substitution.substitution_reason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {substitution.price_adjustment !== 0 && (
                      <Badge variant="outline">
                        {substitution.price_adjustment > 0 ? '+' : ''}${substitution.price_adjustment.toFixed(2)}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveSubstitution(substitution.id)}
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

        <div>
          <h4 className="font-medium mb-2">Available Substitutions:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableSubstitutions.map((substitution) => (
              <div key={substitution.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex-1">
                  <span className="text-sm font-medium">
                    {substitution.original_ingredient} → {substitution.substitute_ingredient}
                  </span>
                  {substitution.substitution_reason && (
                    <p className="text-xs text-gray-600">{substitution.substitution_reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {substitution.price_adjustment !== 0 && (
                    <Badge variant="outline">
                      {substitution.price_adjustment > 0 ? '+' : ''}${substitution.price_adjustment.toFixed(2)}
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddSubstitution(substitution)}
                    disabled={isSelected(substitution.id)}
                    className="h-8"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IngredientSubstitution } from '@/types/mealCustomization';
import { Search, Plus, X } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubstitutions = availableSubstitutions.filter(sub =>
    sub.original_ingredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.substitute_ingredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.substitution_reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unselectedSubstitutions = filteredSubstitutions.filter(
    sub => !selectedSubstitutions.find(selected => selected.id === sub.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ingredient Substitutions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected substitutions */}
        {selectedSubstitutions.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Selected Substitutions:</h4>
            <div className="space-y-2">
              {selectedSubstitutions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {sub.original_ingredient} → {sub.substitute_ingredient}
                    </p>
                    <p className="text-xs text-gray-600">{sub.substitution_reason}</p>
                    {sub.price_adjustment !== 0 && (
                      <p className="text-xs text-green-600">
                        {sub.price_adjustment > 0 ? '+' : ''}${sub.price_adjustment.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveSubstitution(sub.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and available substitutions */}
        <div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search ingredient substitutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {unselectedSubstitutions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {sub.original_ingredient} → {sub.substitute_ingredient}
                  </p>
                  <p className="text-xs text-gray-600">{sub.substitution_reason}</p>
                  {sub.price_adjustment !== 0 && (
                    <Badge variant={sub.price_adjustment > 0 ? "destructive" : "secondary"} className="mt-1">
                      {sub.price_adjustment > 0 ? '+' : ''}${sub.price_adjustment.toFixed(2)}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddSubstitution(sub)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {unselectedSubstitutions.length === 0 && searchTerm && (
            <p className="text-center text-gray-500 py-4">
              No substitutions found matching "{searchTerm}"
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

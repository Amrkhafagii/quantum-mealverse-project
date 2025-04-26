
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';

interface IngredientsTabProps {
  ingredients: string[];
  setIngredients: (ingredients: string[]) => void;
}

export const IngredientsTab: React.FC<IngredientsTabProps> = ({
  ingredients,
  setIngredients
}) => {
  const [newIngredient, setNewIngredient] = useState('');

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Ingredients</Label>
        <ul className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-center justify-between p-2 border rounded-md">
              <span>{ingredient}</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => removeIngredient(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
        
        <div className="flex items-center space-x-2">
          <Input
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            placeholder="Add an ingredient"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addIngredient();
              }
            }}
          />
          <Button 
            type="button" 
            onClick={addIngredient}
            disabled={!newIngredient.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealType } from '@/types/meal';

interface MealListProps {
  meals: MealType[];
  onEdit: (meal: MealType) => void;
  onDelete: (id: string) => void;
}

const MealList: React.FC<MealListProps> = ({ meals, onEdit, onDelete }) => {
  return (
    <Card className="p-6 holographic-card">
      <h2 className="text-2xl font-bold text-quantum-cyan mb-4">Meals</h2>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {meals.length === 0 ? (
          <p className="text-center text-galaxy-purple">No meals found. Create your first meal!</p>
        ) : (
          meals.map(meal => (
            <Card key={meal.id} className="p-4 border border-quantum-cyan/30">
              <div className="flex gap-4">
                {meal.image_url && (
                  <img 
                    src={meal.image_url} 
                    alt={meal.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-quantum-cyan">{meal.name}</h3>
                      <p className="text-sm text-gray-300 line-clamp-2">{meal.description}</p>
                      <p className="text-galaxy-purple">${meal.price.toFixed(2)} | {meal.calories} kcal</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="outline" 
                        onClick={() => onEdit(meal)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm"
                        variant="destructive" 
                        onClick={() => onDelete(meal.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
};

export default MealList;

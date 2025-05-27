
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, ChefHat } from 'lucide-react';
import { Meal } from '@/types/food';
import { MealCustomizationModal } from '@/components/mealCustomization/MealCustomizationModal';
import { useAuth } from '@/hooks/useAuth';

interface CustomizableMealCardProps {
  meal: Meal;
  mealPlanId: string;
  onMealCustomized?: (customizedMeal: any) => void;
}

export const CustomizableMealCard: React.FC<CustomizableMealCardProps> = ({
  meal,
  mealPlanId,
  onMealCustomized
}) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const { user } = useAuth();

  const handleCustomize = () => {
    setShowCustomization(true);
  };

  const handleSaveCustomization = (customizedMeal: any) => {
    onMealCustomized?.(customizedMeal);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{meal.name}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCustomize}
              className="flex items-center gap-1"
            >
              <Settings className="h-4 w-4" />
              Customize
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {meal.image_url && (
            <img 
              src={meal.image_url} 
              alt={meal.name}
              className="w-full h-32 object-cover rounded-md"
            />
          )}
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {meal.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              1 serving
            </Badge>
            <Badge variant="secondary">
              {meal.totalCalories} cal
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <ChefHat className="h-3 w-3" />
              {meal.totalTime || 30} min
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <p className="font-medium text-green-600">{meal.totalProtein}g</p>
              <p className="text-gray-500">Protein</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-blue-600">{meal.totalCarbs}g</p>
              <p className="text-gray-500">Carbs</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-yellow-600">{meal.totalFat}g</p>
              <p className="text-gray-500">Fat</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {user && (
        <MealCustomizationModal
          meal={meal}
          userId={user.id}
          mealPlanId={mealPlanId}
          isOpen={showCustomization}
          onClose={() => setShowCustomization(false)}
          onSave={handleSaveCustomization}
        />
      )}
    </>
  );
};

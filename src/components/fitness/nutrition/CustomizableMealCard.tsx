
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star } from 'lucide-react';
import { Meal } from '@/types/meal';

interface CustomizableMealCardProps {
  meal: Meal;
  onCustomize?: (meal: Meal) => void;
  onAddToCart?: (meal: Meal) => void;
}

export const CustomizableMealCard: React.FC<CustomizableMealCardProps> = ({
  meal,
  onCustomize,
  onAddToCart
}) => {
  const defaultImageUrl = 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={meal.image_url || defaultImageUrl}
          alt={meal.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImageUrl;
          }}
        />
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{meal.name}</CardTitle>
        {meal.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {meal.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{meal.totalTime || meal.preparation_time || 30} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-current text-yellow-400" />
            <span>4.5</span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold">{meal.calories}</div>
            <div className="text-gray-500">cal</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{meal.protein}g</div>
            <div className="text-gray-500">protein</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{meal.carbs}g</div>
            <div className="text-gray-500">carbs</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{meal.fat}g</div>
            <div className="text-gray-500">fat</div>
          </div>
        </div>
        
        {meal.dietary_tags && meal.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {meal.dietary_tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCustomize?.(meal)}
            className="flex-1"
          >
            Customize
          </Button>
          <Button
            size="sm"
            onClick={() => onAddToCart?.(meal)}
            className="flex-1"
          >
            Add ${meal.price.toFixed(2)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

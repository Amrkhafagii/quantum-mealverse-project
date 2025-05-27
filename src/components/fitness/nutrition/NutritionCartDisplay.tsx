
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNutritionCart } from '@/contexts/NutritionCartContext';
import { Plus, Minus, Trash2, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { shuffleSingleItem } from '@/services/mealPlan/nutritionShuffleService';

const NutritionCartDisplay: React.FC = () => {
  const { 
    items, 
    removeItem, 
    updateQuantity,
    addItem,
    clearCart 
  } = useNutritionCart();
  const { toast } = useToast();
  const [shufflingItems, setShufflingItems] = useState<Set<string>>(new Set());

  const handleShuffleItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setShufflingItems(prev => new Set(prev).add(itemId));
    
    try {
      // Generate a shuffled alternative
      const shuffledItem = shuffleSingleItem(item, 'maintain');
      
      // Remove the old item and add the new one
      await removeItem(itemId);
      await addItem(shuffledItem);
      
      toast({
        title: "Item shuffled!",
        description: `Replaced "${item.name}" with "${shuffledItem.name}"`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error shuffling item:', error);
      toast({
        title: "Error shuffling item",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setShufflingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  if (items.length === 0) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-8 text-center">
          <p className="text-gray-400 mb-4">Your nutrition plan is empty</p>
          <p className="text-sm text-gray-500">Generate a meal plan to get started</p>
        </CardContent>
      </Card>
    );
  }

  // Group items by meal type
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.meal_type]) {
      acc[item.meal_type] = [];
    }
    acc[item.meal_type].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const mealTypeOrder: Array<keyof typeof groupedItems> = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="space-y-6">
      {/* Clear Cart Button */}
      {items.length > 0 && (
        <div className="flex justify-end">
          <Button 
            onClick={clearCart}
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}

      {/* Grouped Items by Meal Type */}
      {mealTypeOrder.map(mealType => {
        const mealItems = groupedItems[mealType];
        if (!mealItems || mealItems.length === 0) return null;

        return (
          <Card key={mealType} className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-quantum-cyan capitalize flex items-center justify-between">
                {mealType}
                <Badge variant="outline" className="bg-quantum-cyan/10 text-quantum-cyan border-quantum-cyan/30">
                  {mealItems.length} item{mealItems.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mealItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 bg-quantum-black/30 rounded-lg border border-gray-700/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">{item.name}</h4>
                      {item.food_category && (
                        <Badge variant="secondary" className="text-xs">
                          {item.food_category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{Math.round(item.calories * item.quantity)} cal</span>
                      <span>{Math.round(item.protein * item.quantity)}g protein</span>
                      <span>{Math.round(item.carbs * item.quantity)}g carbs</span>
                      <span>{Math.round(item.fat * item.quantity)}g fat</span>
                      <span>{item.portion_size}g portion</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-quantum-darkBlue/50 rounded-lg p-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className="h-8 w-8 p-0 hover:bg-quantum-cyan/20"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0 hover:bg-quantum-cyan/20"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Shuffle Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShuffleItem(item.id)}
                      disabled={shufflingItems.has(item.id)}
                      className="border-quantum-purple/30 text-quantum-purple hover:bg-quantum-purple/10"
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>

                    {/* Remove Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeItem(item.id)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default NutritionCartDisplay;

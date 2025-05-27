
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Minus } from 'lucide-react';
import { useNutritionCart } from '@/contexts/NutritionCartContext';

const NutritionCartDisplay: React.FC = () => {
  const { 
    items, 
    totalCalories, 
    totalProtein, 
    totalCarbs, 
    totalFat,
    removeItem,
    updateQuantity,
    clearCart,
    isLoading
  } = useNutritionCart();

  if (isLoading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-6 text-center">
          <p>Loading nutrition plan...</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-quantum-cyan mb-2">No items in your nutrition plan</h3>
          <p className="text-gray-400">Generate a meal plan to get started with your nutrition journey.</p>
        </CardContent>
      </Card>
    );
  }

  // Group items by meal type
  const itemsByMeal = items.reduce((acc, item) => {
    if (!acc[item.meal_type]) {
      acc[item.meal_type] = [];
    }
    acc[item.meal_type].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <div className="space-y-6">
      {/* Nutrition Summary */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-quantum-cyan">Nutrition Summary</CardTitle>
          <Button 
            onClick={clearCart}
            variant="destructive"
            size="sm"
          >
            Clear All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-quantum-cyan">{Math.round(totalCalories)}</p>
              <p className="text-sm text-gray-400">Calories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{Math.round(totalProtein)}g</p>
              <p className="text-sm text-gray-400">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{Math.round(totalCarbs)}g</p>
              <p className="text-sm text-gray-400">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{Math.round(totalFat)}g</p>
              <p className="text-sm text-gray-400">Fats</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items by Meal */}
      {Object.entries(itemsByMeal).map(([mealType, mealItems]) => (
        <Card key={mealType} className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle className="text-quantum-cyan capitalize flex items-center gap-2">
              {mealType}
              <Badge variant="outline" className="bg-quantum-cyan/10 text-quantum-cyan border-quantum-cyan/30">
                {mealItems.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mealItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-quantum-cyan/20 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{item.name}</h4>
                    <p className="text-sm text-gray-400">
                      {item.portion_size}g portion • {item.food_category}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span>{Math.round(item.calories * item.quantity)} cal</span>
                      <span className="text-green-400">{Math.round(item.protein * item.quantity)}g protein</span>
                      <span className="text-blue-400">{Math.round(item.carbs * item.quantity)}g carbs</span>
                      <span className="text-yellow-400">{Math.round(item.fat * item.quantity)}g fat</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full" 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full" 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NutritionCartDisplay;

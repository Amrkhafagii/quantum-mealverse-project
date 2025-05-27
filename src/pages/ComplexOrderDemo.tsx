
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useComplexMealOrders } from '@/hooks/useComplexMealOrders';
import { OrderProcessingDashboard } from '@/components/restaurant/OrderProcessingDashboard';
import { KitchenInventoryManager } from '@/components/restaurant/KitchenInventoryManager';
import { ChefHat, Package, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function ComplexOrderDemo() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [orderId] = useState('demo-order-' + Date.now());
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);

  const { data, processOrder } = useComplexMealOrders(
    orderId,
    selectedRestaurant,
    selectedMeals
  );

  React.useEffect(() => {
    const fetchData = async () => {
      // Fetch restaurants
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('is_active', true)
        .limit(5);
      
      if (restaurantData) setRestaurants(restaurantData);

      // Fetch meals
      const { data: mealData } = await supabase
        .from('meals')
        .select('id, name, complexity_level')
        .eq('is_active', true)
        .limit(10);
      
      if (mealData) setMeals(mealData);
    };

    fetchData();
  }, []);

  const handleProcessOrder = () => {
    if (selectedRestaurant && selectedMeals.length > 0) {
      processOrder(orderId, selectedRestaurant, selectedMeals);
    }
  };

  const toggleMealSelection = (mealId: string) => {
    setSelectedMeals(prev => 
      prev.includes(mealId) 
        ? prev.filter(id => id !== mealId)
        : [...prev, mealId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-6 w-6" />
              Complex Meal Order Processing Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Restaurant</label>
                <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map(restaurant => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select Meals</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {meals.map(meal => (
                    <Button
                      key={meal.id}
                      variant={selectedMeals.includes(meal.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleMealSelection(meal.id)}
                      className="justify-start"
                    >
                      <span className="truncate">{meal.name}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {meal.complexity_level}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleProcessOrder}
                disabled={!selectedRestaurant || selectedMeals.length === 0 || data.loading}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                {data.loading ? 'Processing...' : 'Process Order'}
              </Button>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Order ID: {orderId}</span>
                <Badge variant="outline">{selectedMeals.length} meals selected</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedRestaurant && selectedMeals.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <OrderProcessingDashboard
                orderId={orderId}
                restaurantId={selectedRestaurant}
                mealIds={selectedMeals}
              />
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Kitchen Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <KitchenInventoryManager restaurantId={selectedRestaurant} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

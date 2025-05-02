
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNearestRestaurant } from '@/hooks/useNearestRestaurant';
import { getMenuItems } from '@/services/restaurant/menuService';
import { MealFood, Food } from '@/types/food';
import { MenuItem } from '@/types/menu';
import { Utensils, ShoppingBag, MapPin, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { calculateMatchPercentage } from '@/utils/menuUtils';
import { formatPrice } from '@/utils/menuUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RestaurantMealMatcherProps {
  mealFoods: MealFood[];
  mealName: string;
  mealCalories: number;
  mealProtein: number;
  mealCarbs: number;
  mealFat: number;
}

export default function RestaurantMealMatcher({
  mealFoods,
  mealName,
  mealCalories,
  mealProtein,
  mealCarbs,
  mealFat
}: RestaurantMealMatcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [matchingItems, setMatchingItems] = useState<Array<{
    item: MenuItem,
    matchPercentage: number,
    restaurant: { name: string, distance: number }
  }>>([]);
  const { nearbyRestaurants, loading } = useNearestRestaurant();

  const handleOpenDialog = async () => {
    setIsOpen(true);
    setIsLoading(true);
    
    try {
      const restaurantIds = nearbyRestaurants.map(r => r.restaurant_id);
      if (restaurantIds.length === 0) {
        toast.error("No nearby restaurants found. Please enable location services.");
        setIsLoading(false);
        return;
      }
      
      // Get all menu items from nearby restaurants
      const menuItems = await getMenuItems(restaurantIds);
      
      // Only consider items with nutritional info
      const itemsWithNutrition = menuItems.filter(item => 
        item.nutritional_info && 
        item.nutritional_info.protein && 
        item.nutritional_info.carbs && 
        item.nutritional_info.fat);
      
      // Calculate match percentage for each item
      const matches = itemsWithNutrition.map(item => {
        const matchPercentage = calculateMatchPercentage(
          {
            calories: mealCalories,
            protein: mealProtein,
            carbs: mealCarbs,
            fat: mealFat
          },
          {
            calories: item.nutritional_info?.calories || 0, 
            protein: item.nutritional_info?.protein || 0,
            carbs: item.nutritional_info?.carbs || 0,
            fat: item.nutritional_info?.fat || 0
          }
        );
        
        const restaurant = nearbyRestaurants.find(r => r.restaurant_id === item.restaurant_id);
        
        return {
          item,
          matchPercentage,
          restaurant: {
            name: restaurant?.restaurant_name || "Unknown restaurant",
            distance: restaurant?.distance_km || 0
          }
        };
      });
      
      // Only show matches with at least 75% match, sorted by highest match first
      const goodMatches = matches
        .filter(match => match.matchPercentage >= 75)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);
      
      setMatchingItems(goodMatches);
    } catch (error) {
      console.error("Error fetching restaurant meals:", error);
      toast.error("Error loading restaurant meals. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  function getMatchColor(percentage: number): string {
    if (percentage >= 95) return "bg-green-500 hover:bg-green-600";
    if (percentage >= 85) return "bg-amber-500 hover:bg-amber-600";
    return "bg-blue-500 hover:bg-blue-600";
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full mt-2 border-quantum-purple/30 hover:bg-quantum-purple/10 text-quantum-purple"
        onClick={handleOpenDialog}
      >
        <Utensils className="h-3.5 w-3.5 mr-2" />
        Find Restaurant Meals
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-quantum-darkBlue/95 border-quantum-purple/20 backdrop-blur-md text-white max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-quantum-cyan text-center">Restaurant Meals Similar to {mealName}</DialogTitle>
            <DialogDescription className="text-gray-300 text-center">
              Comparing with nearby restaurant options that match your meal plan macros
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-2">
            <div className="bg-quantum-darkBlue/50 p-3 rounded-md mb-4">
              <h3 className="font-medium text-quantum-cyan mb-2">Your Meal Plan Macros</h3>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div className="p-2 rounded-md bg-quantum-black/30">
                  <div className="text-gray-400">Calories</div>
                  <div className="font-medium">{mealCalories}kcal</div>
                </div>
                <div className="p-2 rounded-md bg-quantum-black/30">
                  <div className="text-blue-400">Protein</div>
                  <div className="font-medium">{mealProtein}g</div>
                </div>
                <div className="p-2 rounded-md bg-quantum-black/30">
                  <div className="text-green-400">Carbs</div>
                  <div className="font-medium">{mealCarbs}g</div>
                </div>
                <div className="p-2 rounded-md bg-quantum-black/30">
                  <div className="text-yellow-400">Fat</div>
                  <div className="font-medium">{mealFat}g</div>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-quantum-cyan border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-quantum-cyan">Finding matching restaurant meals nearby...</p>
              </div>
            ) : matchingItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Utensils className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No matching restaurant meals found nearby.</p>
                <p className="text-sm mt-2">Try updating your location or adjusting your meal plan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {matchingItems.map((match, index) => (
                  <Card 
                    key={index} 
                    className={`bg-quantum-black/70 border-l-4 transition-all hover:bg-quantum-black/90 ${match.matchPercentage >= 95 ? 'border-l-green-500' : 'border-l-amber-500'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-white">{match.item.name}</h3>
                          <div className="flex items-center text-sm text-gray-400 mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {match.restaurant.name} ({match.restaurant.distance.toFixed(1)}km)
                          </div>
                        </div>
                        <Badge className={`${getMatchColor(match.matchPercentage)}`}>
                          <Percent className="h-3 w-3 mr-1" />
                          {Math.round(match.matchPercentage)}% Match
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 text-center text-sm mt-3">
                        <div className="p-2 rounded-md bg-quantum-darkBlue/30">
                          <div className="text-gray-400">Calories</div>
                          <div className="font-medium">{match.item.nutritional_info?.calories || 0}kcal</div>
                        </div>
                        <div className="p-2 rounded-md bg-quantum-darkBlue/30">
                          <div className="text-blue-400">Protein</div>
                          <div className="font-medium">{match.item.nutritional_info?.protein || 0}g</div>
                        </div>
                        <div className="p-2 rounded-md bg-quantum-darkBlue/30">
                          <div className="text-green-400">Carbs</div>
                          <div className="font-medium">{match.item.nutritional_info?.carbs || 0}g</div>
                        </div>
                        <div className="p-2 rounded-md bg-quantum-darkBlue/30">
                          <div className="text-yellow-400">Fat</div>
                          <div className="font-medium">{match.item.nutritional_info?.fat || 0}g</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-white font-medium">{formatPrice(match.item.price)}</div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={match.matchPercentage < 95}
                                onClick={() => {
                                  toast.success(`Added ${match.item.name} to cart!`);
                                  // Here you would integrate with your cart system
                                }}
                                className={match.matchPercentage >= 95 ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-700 text-gray-400 cursor-not-allowed"}
                              >
                                <ShoppingBag className="h-3.5 w-3.5 mr-2" />
                                {match.matchPercentage >= 95 ? "Order Now" : "Not Close Enough"}
                              </Button>
                            </TooltipTrigger>
                            {match.matchPercentage < 95 && (
                              <TooltipContent>
                                <p>Meals must match at least 95% of your macros</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

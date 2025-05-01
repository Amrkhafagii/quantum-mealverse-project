
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Search, Filter, Utensils } from 'lucide-react';
import { MealPlan } from '@/types/food';

interface RestaurantMealFinderProps {
  mealPlan?: MealPlan;
  userLocation?: { lat: number; lng: number };
}

const RestaurantMealFinder = ({ mealPlan, userLocation }: RestaurantMealFinderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [distance, setDistance] = useState([5]); // km
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');
  const [loading, setLoading] = useState(false);
  
  // Mock data - in real implementation, this would come from an API call
  const mockRestaurants = [
    {
      id: '1',
      name: 'HealthyBites',
      distance: 1.2,
      rating: 4.7,
      image: 'https://picsum.photos/seed/rest1/300/200',
      address: '123 Fitness St, Healthytown',
      matchingMeals: [
        { 
          name: 'Protein Power Bowl', 
          calories: 550, 
          protein: 35, 
          carbs: 65,
          fat: 15,
          price: 12.99,
          match: 92
        },
        { 
          name: 'Grilled Chicken Salad', 
          calories: 420, 
          protein: 30, 
          carbs: 25,
          fat: 18,
          price: 10.99,
          match: 85
        }
      ]
    },
    {
      id: '2',
      name: 'Macro Kitchen',
      distance: 2.5,
      rating: 4.5,
      image: 'https://picsum.photos/seed/rest2/300/200',
      address: '456 Nutrition Ave, Fitville',
      matchingMeals: [
        { 
          name: 'Lean Beef Bowl', 
          calories: 580, 
          protein: 40, 
          carbs: 50,
          fat: 20,
          price: 14.99,
          match: 88
        }
      ]
    },
    {
      id: '3',
      name: 'Clean Eats',
      distance: 3.8,
      rating: 4.2,
      image: 'https://picsum.photos/seed/rest3/300/200',
      address: '789 Wellness Blvd, Healthburg',
      matchingMeals: [
        { 
          name: 'Mediterranean Plate', 
          calories: 620, 
          protein: 25, 
          carbs: 70,
          fat: 22,
          price: 13.50,
          match: 79
        }
      ]
    }
  ];
  
  const handleSearch = () => {
    setLoading(true);
    // In a real implementation, this would call an API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  const getMealPlanTargets = () => {
    if (!mealPlan) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    // Divide daily targets by 3 for each meal
    return {
      calories: Math.round(mealPlan.totalCalories / 3),
      protein: Math.round(mealPlan.targetProtein / 3),
      carbs: Math.round(mealPlan.targetCarbs / 3),
      fat: Math.round(mealPlan.targetFat / 3),
    };
  };
  
  const targets = getMealPlanTargets();
  
  return (
    <div className="space-y-6">
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-quantum-cyan flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Restaurant Meal Finder
          </CardTitle>
          <CardDescription>
            Find restaurant meals that match your nutritional targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-quantum-black/50 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Target Calories</div>
                <div className="text-2xl font-bold text-quantum-cyan">{targets.calories} kcal</div>
              </div>
              <div className="bg-quantum-black/50 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Target Protein</div>
                <div className="text-2xl font-bold text-purple-400">{targets.protein}g</div>
              </div>
              <div className="bg-quantum-black/50 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Target Carbs/Fat</div>
                <div className="text-2xl font-bold text-green-400">{targets.carbs}g / {targets.fat}g</div>
              </div>
            </div>
            
            <Tabs defaultValue="nearby" className="mt-6">
              <TabsList className="grid grid-cols-2 bg-quantum-black/50">
                <TabsTrigger value="nearby">Nearby Restaurants</TabsTrigger>
                <TabsTrigger value="meal">Meal Search</TabsTrigger>
              </TabsList>
              
              <TabsContent value="nearby" className="space-y-4 mt-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="location" className="text-sm">Your Location</Label>
                    <div className="flex mt-1">
                      <Input 
                        id="location"
                        className="bg-quantum-black/50 border-quantum-cyan/20"
                        placeholder="Current location"
                        value={userLocation ? "Using your current location" : ""}
                        readOnly
                      />
                      <Button variant="outline" className="ml-2 border-quantum-cyan/20">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="w-[150px]">
                    <Label className="text-sm">Distance (km)</Label>
                    <Slider
                      className="mt-3"
                      value={distance}
                      onValueChange={setDistance}
                      max={20}
                      step={1}
                    />
                    <div className="text-center mt-1 text-sm">{distance[0]} km</div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Meal Type</Label>
                  <Select value={selectedMeal} onValueChange={(value: 'breakfast' | 'lunch' | 'dinner') => setSelectedMeal(value)}>
                    <SelectTrigger className="mt-1 bg-quantum-black/50 border-quantum-cyan/20">
                      <SelectValue placeholder="Select meal" />
                    </SelectTrigger>
                    <SelectContent className="bg-quantum-black border-quantum-cyan/20">
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleSearch} 
                  className="w-full bg-quantum-purple hover:bg-quantum-purple/90"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Find Matching Restaurants'}
                </Button>
              </TabsContent>
              
              <TabsContent value="meal" className="space-y-4 mt-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="mealSearch" className="text-sm">Search for a Meal</Label>
                    <div className="flex mt-1">
                      <Input 
                        id="mealSearch"
                        className="bg-quantum-black/50 border-quantum-cyan/20"
                        placeholder="e.g., chicken, salad, burger"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button variant="outline" className="ml-2 border-quantum-cyan/20">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSearch} 
                  className="w-full bg-quantum-purple hover:bg-quantum-purple/90"
                  disabled={loading || !searchQuery}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? 'Searching...' : 'Search Meals'}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-quantum-cyan">Matching Restaurants</h3>
        
        {mockRestaurants.map(restaurant => (
          <Card key={restaurant.id} className="holographic-card overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 h-48 md:h-auto relative">
                <img 
                  src={restaurant.image} 
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                  {restaurant.distance} km away
                </div>
              </div>
              <div className="md:w-2/3 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-bold">{restaurant.name}</h4>
                    <p className="text-sm text-gray-400">{restaurant.address}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= Math.floor(restaurant.rating) ? "text-yellow-400" : "text-gray-600"}>★</span>
                        ))}
                      </div>
                      <span className="ml-1 text-sm">{restaurant.rating}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-quantum-cyan hover:bg-quantum-cyan/90"
                  >
                    View Menu
                  </Button>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Matching Meals:</div>
                  <div className="space-y-2">
                    {restaurant.matchingMeals.map((meal, idx) => (
                      <div key={idx} className="bg-quantum-black/40 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{meal.name}</div>
                          <div className="text-sm text-gray-400">
                            {meal.calories} kcal • {meal.protein}g protein • ${meal.price}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className={`text-lg font-bold ${meal.match >= 90 ? 'text-green-400' : meal.match >= 80 ? 'text-yellow-400' : 'text-orange-400'}`}>
                            {meal.match}% match
                          </div>
                          <Button size="sm" variant="outline" className="mt-1 h-7 border-quantum-cyan/20">
                            Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-quantum-cyan mb-2">Coming Soon: Direct Ordering</h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            We're working with restaurant partners to enable direct ordering of meals that match your nutrition plan.
            You'll soon be able to order meals and have them delivered or ready for pickup.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RestaurantMealFinder;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, MapPin, Utensils } from 'lucide-react';
import { useRestaurantAssignment } from '@/hooks/useRestaurantAssignment';
import { Restaurant } from '@/hooks/useRestaurantsData';

interface RestaurantAssignmentDebugProps {
  restaurants: Restaurant[];
  location: { latitude: number; longitude: number } | null;
}

export const RestaurantAssignmentDebug: React.FC<RestaurantAssignmentDebugProps> = ({
  restaurants,
  location
}) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const { loading, error } = useRestaurantAssignment();

  const runDiagnostics = async () => {
    setIsDebugging(true);
    setDebugInfo(null);

    try {
      // Create a sample meal for testing
      const testMeal = {
        id: 'test-meal-1',
        name: 'Test Burger',
        foods: [
          { food: { id: '1', name: 'Beef Patty' }, portionSize: 200 },
          { food: { id: '2', name: 'Lettuce' }, portionSize: 50 },
          { food: { id: '3', name: 'Tomato' }, portionSize: 30 }
        ],
        totalCalories: 500,
        totalProtein: 25,
        totalCarbs: 30,
        totalFat: 15
      };

      const info = {
        location: location,
        restaurantsCount: restaurants.length,
        restaurants: restaurants.map(r => ({
          id: r.restaurant_id,
          name: r.name,
          distance: r.distance_km,
          status: 'available' // This would come from actual capability check
        })),
        timestamp: new Date().toISOString()
      };

      setDebugInfo(info);
    } catch (err) {
      console.error('Debug error:', err);
      setDebugInfo({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Utensils className="h-5 w-5" />
          Restaurant Assignment Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={isDebugging || !location}
            size="sm"
            variant="outline"
          >
            {isDebugging ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Run Assignment Test
              </>
            )}
          </Button>
          
          {!location && (
            <Badge variant="destructive">Location Required</Badge>
          )}
        </div>

        {debugInfo && (
          <div className="space-y-3">
            {debugInfo.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-600 text-sm mt-1">{debugInfo.error}</p>
              </div>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Location Status</span>
                  </div>
                  <p className="text-green-600 text-sm mt-1">
                    {debugInfo.location ? 
                      `Available: ${debugInfo.location.latitude.toFixed(4)}, ${debugInfo.location.longitude.toFixed(4)}` :
                      'Not available'
                    }
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-700">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Restaurants Found</span>
                  </div>
                  <p className="text-blue-600 text-sm mt-1">
                    {debugInfo.restaurantsCount} restaurants available
                  </p>
                  
                  {debugInfo.restaurants && debugInfo.restaurants.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {debugInfo.restaurants.slice(0, 3).map((restaurant: any) => (
                        <div key={restaurant.id} className="text-xs text-blue-600 bg-blue-100 rounded px-2 py-1">
                          {restaurant.name} - {restaurant.distance?.toFixed(1)}km
                        </div>
                      ))}
                      {debugInfo.restaurants.length > 3 && (
                        <div className="text-xs text-blue-500">
                          +{debugInfo.restaurants.length - 3} more...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Assignment Error</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

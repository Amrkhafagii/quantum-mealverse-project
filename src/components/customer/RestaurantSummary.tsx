
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Star, Navigation } from 'lucide-react';
import { Restaurant } from '@/hooks/useRestaurantsData';

interface RestaurantSummaryProps {
  restaurants: Restaurant[];
}

export const RestaurantSummary: React.FC<RestaurantSummaryProps> = ({ restaurants }) => {
  console.log('RestaurantSummary rendering with restaurants:', restaurants?.length || 0);

  if (!restaurants || restaurants.length === 0) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 mb-8">
        <CardContent className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No restaurants found</h3>
          <p className="text-gray-400">
            We're working to expand our service in your area. Please check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 mb-8">
      <CardHeader>
        <CardTitle className="text-quantum-cyan flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Available Restaurants ({restaurants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant, index) => (
            <div 
              key={restaurant.restaurant_id || index}
              className="border border-gray-600/30 rounded-lg p-4 bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
            >
              <h4 className="font-semibold text-white mb-2">{restaurant.restaurant_name}</h4>
              
              <div className="space-y-2 text-sm">
                {/* Distance Information */}
                {restaurant.distance_km !== undefined ? (
                  <div className="flex items-center gap-2 text-quantum-cyan">
                    <Navigation className="w-4 h-4" />
                    <span className="font-medium">
                      {restaurant.distance_km.toFixed(1)} km away
                    </span>
                  </div>
                ) : null}
                
                {/* Address Information */}
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs">
                    {restaurant.restaurant_address}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span>15-30 min delivery</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-gray-300">4.5 (120+ reviews)</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">
                  Fast Delivery
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Healthy Options
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

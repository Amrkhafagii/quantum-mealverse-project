
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RestaurantAssignmentDebugProps {
  restaurants: any[];
  location: any;
}

export const RestaurantAssignmentDebug = ({ restaurants, location }: RestaurantAssignmentDebugProps) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Debug: Restaurant Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-xs">
          <div>
            <strong>Location:</strong> {location ? `${location.latitude}, ${location.longitude}` : 'Not available'}
          </div>
          <div>
            <strong>Restaurants Found:</strong> {restaurants?.length || 0}
          </div>
          {restaurants?.map((restaurant, index) => (
            <div key={restaurant.id || index} className="flex items-center gap-2 p-2 border rounded">
              <span>{restaurant.restaurant_name || restaurant.name || 'Unknown Restaurant'}</span>
              <Badge variant={restaurant.is_active ? 'default' : 'secondary'}>
                {restaurant.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {restaurant.delivery_radius && (
                <Badge variant="outline">
                  Radius: {restaurant.delivery_radius}km
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

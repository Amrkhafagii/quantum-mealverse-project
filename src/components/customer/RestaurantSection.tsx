
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RestaurantSummary } from '@/components/customer/RestaurantSummary';
import EmptyState from '@/components/EmptyState';
import { Restaurant } from '@/types/restaurant';
import { NearbyRestaurant } from '@/hooks/useNearestRestaurant';

interface RestaurantSectionProps {
  restaurants?: Restaurant[];
  nearbyRestaurants: NearbyRestaurant[];
  isLoading: boolean;
  error?: Error | null;
}

export const RestaurantSection: React.FC<RestaurantSectionProps> = ({
  restaurants,
  nearbyRestaurants,
  isLoading,
  error
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Restaurants</CardTitle>
        <CardDescription>Select a restaurant to view its menu.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading restaurants...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error.message}</p>
        ) : restaurants && restaurants.length > 0 ? (
          <RestaurantSummary 
            restaurants={nearbyRestaurants}
          />
        ) : (
          <EmptyState message="No restaurants found." />
        )}
      </CardContent>
    </Card>
  );
};

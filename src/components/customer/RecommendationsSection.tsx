
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RecommendedMeals from '@/components/recommendations/RecommendedMeals';
import { DeliveryLocation } from '@/types/location';

interface RecommendationsSectionProps {
  currentLocation: DeliveryLocation | null;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  currentLocation
}) => {
  if (!currentLocation) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Meals</CardTitle>
        <CardDescription>Personalized recommendations based on your location.</CardDescription>
      </CardHeader>
      <CardContent>
        <RecommendedMeals />
      </CardContent>
    </Card>
  );
};

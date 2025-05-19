import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Star, StarHalf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ARMealPreview, { ARMealPreviewProps } from '@/components/ARMealPreview';

interface Meal {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  review_count: number;
}

const MealDetails = () => {
  const { id } = useParams();

  const { data: meal, isLoading, isError, error } = useQuery<Meal, Error>({
    queryKey: ['meal', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Meal;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-4" />
        <Skeleton className="h-64 w-full rounded-md mb-4" />
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>
    );
  }

  if (isError) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error.message}</div>;
  }

  if (!meal) {
    return <div className="container mx-auto p-4">Meal not found</div>;
  }

  const renderRating = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(meal.rating)) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === Math.ceil(meal.rating) && !Number.isInteger(meal.rating)) {
        stars.push(<StarHalf key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-400" />);
      }
    }
    return stars;
  };
  
  // Fix the AR preview prop issue by ensuring mealName is passed
  const renderARPreview = () => {
    return (
      <div className="mt-4">
        <ARMealPreview 
          mealName={meal?.name || 'Unknown Meal'} 
          modelName="Standard3D" 
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-2">{meal.name}</h1>
      <div className="flex items-center mb-4">
        {renderRating()}
        <Badge className="ml-2">{meal.rating.toFixed(1)}</Badge>
        <span className="text-gray-500 ml-1">({meal.review_count} reviews)</span>
      </div>
      <img src={meal.image_url} alt={meal.name} className="w-full h-64 object-cover rounded-md mb-4" />
      <p className="text-gray-700">{meal.description}</p>
      <div className="mt-4">
        <span className="text-xl font-semibold">Price:</span>
        <span className="ml-2">${meal.price.toFixed(2)}</span>
      </div>
      {renderARPreview()}
    </div>
  );
};

export default MealDetails;

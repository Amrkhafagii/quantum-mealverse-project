
import React from 'react';
import { MealCard } from './MealCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export const FeaturedMeals = () => {
  const { data: meals, isLoading } = useQuery({
    queryKey: ['featuredMeals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-12">
      <h2 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Featured Meals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {meals?.map((meal) => (
          <MealCard
            key={meal.id}
            name={meal.name}
            description={meal.description}
            price={meal.price}
            calories={meal.calories}
            macros={{
              protein: meal.protein,
              carbs: meal.carbs,
              fat: meal.fat
            }}
          />
        ))}
      </div>
    </div>
  );
};

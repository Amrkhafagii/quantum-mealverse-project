
import React from 'react';
import { MealCard } from './MealCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { MenuItem, parseNutritionalInfo } from '@/types/menu';

export const FeaturedMeals = () => {
  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['featuredMenuItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
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
        {menuItems?.map((item) => {
          const nutritionalInfo = parseNutritionalInfo(item.nutritional_info);
          
          return (
            <MealCard
              key={item.id}
              name={item.name}
              description={item.description || ''}
              price={item.price}
              calories={nutritionalInfo.calories}
              macros={{
                protein: nutritionalInfo.protein,
                carbs: nutritionalInfo.carbs,
                fat: nutritionalInfo.fat
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

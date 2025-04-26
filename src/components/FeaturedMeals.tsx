
import React from 'react';
import { MealCard } from './MealCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { MealType } from '@/types/meal';
import { MenuItem, NutritionalInfo } from '@/types/menu';

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
          // Parse nutritional info from JSON
          const nutritionalInfo = item.nutritional_info as NutritionalInfo || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          };
          
          return (
            <MealCard
              key={item.id}
              name={item.name}
              description={item.description || ''}
              price={item.price}
              calories={nutritionalInfo.calories || 0}
              macros={{
                protein: nutritionalInfo.protein || 0,
                carbs: nutritionalInfo.carbs || 0,
                fat: nutritionalInfo.fat || 0
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

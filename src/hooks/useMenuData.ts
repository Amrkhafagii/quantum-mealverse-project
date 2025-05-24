
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MealType } from '@/types/meal';
import { Restaurant } from './useRestaurantsData';

export const useMenuData = (restaurants: Restaurant[]) => {
  return useQuery({
    queryKey: ['menuData', restaurants.map(r => r.restaurant_id)],
    queryFn: async () => {
      if (!restaurants.length) {
        return [];
      }
      
      const restaurantIds = restaurants.map(restaurant => restaurant.restaurant_id);
      
      const { data: menuItems, error } = await supabase
        .from('menu_items')
        .select('*')
        .in('restaurant_id', restaurantIds)
        .eq('is_available', true)
        .limit(50);

      if (error) {
        console.error('Error fetching menu items:', error);
        throw error;
      }

      const transformedItems: MealType[] = menuItems?.map(item => {
        let nutritionalInfo = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        };
        
        try {
          if (item.nutritional_info && 
              typeof item.nutritional_info === 'object' && 
              !Array.isArray(item.nutritional_info)) {
            nutritionalInfo = {
              calories: Number(item.nutritional_info.calories) || 0,
              protein: Number(item.nutritional_info.protein) || 0,
              carbs: Number(item.nutritional_info.carbs) || 0,
              fat: Number(item.nutritional_info.fat) || 0
            };
          }
        } catch (e) {
          console.error("Error parsing nutritional info:", e);
        }

        const mockDietaryTags = [];
        if (item.name.toLowerCase().includes('vegetarian') || item.description?.toLowerCase().includes('vegetarian')) {
          mockDietaryTags.push('vegetarian');
        }
        if (item.name.toLowerCase().includes('gluten') || item.description?.toLowerCase().includes('gluten')) {
          mockDietaryTags.push('gluten-free');
        }

        return {
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          calories: nutritionalInfo.calories,
          protein: nutritionalInfo.protein,
          carbs: nutritionalInfo.carbs,
          fat: nutritionalInfo.fat,
          image_url: item.image_url || `https://picsum.photos/seed/${item.id}/300/200`,
          is_active: item.is_available,
          restaurant_id: item.restaurant_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          dietary_tags: mockDietaryTags
        } as MealType;
      }) || [];

      return transformedItems;
    },
    enabled: restaurants.length > 0
  });
};

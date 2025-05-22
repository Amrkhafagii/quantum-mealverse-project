
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MealType } from '@/types/meal';
import { getMenuItems } from '@/services/restaurant/menuService';
import { NearbyRestaurant } from '@/hooks/useNearestRestaurant';

export const useMenuItems = (nearbyRestaurants: NearbyRestaurant[]) => {
  return useQuery({
    queryKey: ['menuItems', nearbyRestaurants],
    queryFn: async () => {
      if (!nearbyRestaurants.length) return [];
      
      console.log('Finding menu items for restaurants:', nearbyRestaurants);
      
      const restaurantIds = nearbyRestaurants.map(restaurant => restaurant.restaurant_id);
      console.log('Restaurant IDs:', restaurantIds);
      
      const items = await getMenuItems(restaurantIds as unknown as string, undefined, true);
      console.log('Menu items fetched using service:', items?.length, items);
      
      // Transform menu items to MealType
      let transformedItems = items?.map(item => {
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

        // Generate mock dietary tags for demonstration (would come from database in real app)
        const mockDietaryTags = [];
        if (item.id.charCodeAt(0) % 2 === 0) mockDietaryTags.push('vegetarian');
        if (item.id.charCodeAt(1) % 3 === 0) mockDietaryTags.push('gluten-free');
        if (item.id.charCodeAt(2) % 4 === 0) mockDietaryTags.push('dairy-free');
        if (item.id.charCodeAt(3) % 5 === 0) mockDietaryTags.push('vegan');
        if (item.id.charCodeAt(4) % 6 === 0) mockDietaryTags.push('keto');
        if (item.id.charCodeAt(5) % 7 === 0) mockDietaryTags.push('high-protein');

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

      // Apply random sort to simulate rating-based sorting
      transformedItems.sort(() => Math.random() - 0.5);
      
      return transformedItems;
    },
    enabled: nearbyRestaurants.length > 0
  });
};


import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MealType } from '@/types/meal';
import { Restaurant } from './useRestaurantsData';

export const useMenuData = (restaurants: Restaurant[]) => {
  // Filter restaurants with valid restaurant_id (string, not empty, not null)
  const validRestaurants = (restaurants || []).filter(r => typeof r.restaurant_id === "string" && r.restaurant_id);
  const restaurantIds = validRestaurants.map(r => r.restaurant_id);

  // Extra log for debugging
  console.log('[useMenuData] Received restaurants:', restaurants);
  console.log('[useMenuData] Filtered valid restaurantIds:', restaurantIds);

  const queryClient = useQueryClient();

  // Removed React Query DevTools dynamic import (not needed in hook)

  const queryResult = useQuery({
    queryKey: ['menuData', restaurantIds],
    queryFn: async () => {
      if (!restaurantIds.length) {
        console.warn('[useMenuData] No valid restaurant IDs to query, returning empty result');
        return [];
      }
      
      // Debug before query
      console.log('[useMenuData] Querying menu_items for restaurantIds:', restaurantIds);
      
      const { data: menuItems, error } = await supabase
        .from('menu_items')
        .select('*')
        .in('restaurant_id', restaurantIds)
        .eq('is_available', true)
        .limit(50);

      if (error) {
        console.error('[useMenuData] Error fetching menu items:', error);
        throw error;
      }

      console.log('[useMenuData] Raw menu items result:', menuItems);

      // Defensive: if menuItems is not array, treat as empty
      if (!Array.isArray(menuItems)) {
        console.warn('[useMenuData] menuItems not an array:', menuItems);
        return [];
      }

      const transformedItems: MealType[] = menuItems.map(item => {
        let nutritionalInfo = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        };
        
        try {
          if (
            item.nutritional_info &&
            typeof item.nutritional_info === 'object' &&
            !Array.isArray(item.nutritional_info)
          ) {
            nutritionalInfo = {
              calories: Number(item.nutritional_info.calories) || 0,
              protein: Number(item.nutritional_info.protein) || 0,
              carbs: Number(item.nutritional_info.carbs) || 0,
              fat: Number(item.nutritional_info.fat) || 0
            };
          }
        } catch (e) {
          console.error("[useMenuData] Error parsing nutritional info:", e);
        }

        // Simulate dietary tags if available
        const mockDietaryTags = [];
        if (item.name?.toLowerCase().includes('vegetarian') || item.description?.toLowerCase().includes('vegetarian')) {
          mockDietaryTags.push('vegetarian');
        }
        if (item.name?.toLowerCase().includes('gluten') || item.description?.toLowerCase().includes('gluten')) {
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
      });

      // Log the transformed output
      console.log('[useMenuData] Final transformed menu items:', transformedItems);
      return transformedItems;
    },
    enabled: restaurantIds.length > 0,
    staleTime: 1000 * 10, // 10s
    retry: 2, // Try twice before error
    refetchOnWindowFocus: true,
    onSuccess: (data) => {
      console.log('[useMenuData] Query success. Data:', data);
    },
    onError: (err) => {
      console.error('[useMenuData] Query error:', err);
    }
  });

  // Invalidate query if restaurantIds change (force refresh menu data)
  useEffect(() => {
    if (restaurantIds.length > 0) {
      queryClient.invalidateQueries({
        queryKey: ['menuData', restaurantIds],
      });
      console.log('[useMenuData] Invalidated queries for new restaurantIds', restaurantIds);
    }
  }, [restaurantIds.join(','), queryClient]);

  // Expose manual refetch for debugging purpose
  (window as any).refetchMenuData = () => {
    queryClient.invalidateQueries({ queryKey: ['menuData', restaurantIds] });
    queryResult.refetch && queryResult.refetch();
    console.log('[useMenuData] Manual refetch triggered');
  };

  return queryResult;
};


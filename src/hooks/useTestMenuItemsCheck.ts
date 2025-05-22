
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createTestMenuItems } from '@/utils/createTestMenuItems';
import { NearbyRestaurant } from './useNearestRestaurant';

export const useTestMenuItemsCheck = (nearbyRestaurants: NearbyRestaurant[]) => {
  useEffect(() => {
    const checkForMenuItems = async () => {
      try {
        if (nearbyRestaurants.length === 0) {
          console.log('No nearby restaurants found yet');
          return;
        }
        
        console.log('Checking menu items for restaurants:', nearbyRestaurants);
        
        const restaurantIds = nearbyRestaurants.map(r => r.restaurant_id);
        
        for (const restaurantId of restaurantIds) {
          const { data, error } = await supabase
            .from('menu_items')
            .select('count')
            .eq('restaurant_id', restaurantId);
          
          if (error) {
            console.error(`Error checking menu items for restaurant ${restaurantId}:`, error);
            continue;
          }
          
          const count = data && data[0]?.count ? parseInt(data[0].count as unknown as string) : 0;
          console.log(`Restaurant ${restaurantId} has ${count} menu items`);
          
          if (count === 0) {
            console.log(`Creating test menu items for restaurant ${restaurantId}`);
            await createTestMenuItems(restaurantId);
          }
        }
      } catch (err) {
        console.error('Unexpected error checking menu items:', err);
      }
    };
    
    if (nearbyRestaurants.length > 0) {
      checkForMenuItems();
    }
  }, [nearbyRestaurants]);
};

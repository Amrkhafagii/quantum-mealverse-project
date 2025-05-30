
import { useRestaurantData } from './useRestaurantData';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
  image_url?: string;
  preparation_time: number;
  created_at: string;
  updated_at: string;
}

export const useRestaurantMenuItems = (restaurantId: string, category?: string) => {
  const filters: Record<string, any> = { is_available: true };
  
  if (category) {
    filters.category = category;
  }

  return useRestaurantData<MenuItem>({
    queryKey: `restaurant-menu-items${category ? `-${category}` : ''}`,
    tableName: 'menu_items',
    restaurantId,
    selectFields: '*',
    filters,
    orderBy: { column: 'name', ascending: true },
  });
};

export const usePopularMenuItems = (restaurantId: string, limit: number = 10) => {
  return useRestaurantData<MenuItem>({
    queryKey: 'popular-menu-items',
    tableName: 'menu_items',
    restaurantId,
    selectFields: '*',
    filters: { is_available: true },
    orderBy: { column: 'order_count', ascending: false }, // Assuming you have an order_count field
    limit,
  });
};


import { useRestaurantData } from './useRestaurantData';

interface InventoryItem {
  id: string;
  name: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  last_updated: string;
  is_active: boolean;
}

export const useRestaurantInventory = (restaurantId: string) => {
  return useRestaurantData<InventoryItem>({
    queryKey: 'restaurant-inventory',
    tableName: 'restaurant_inventory',
    restaurantId,
    selectFields: '*',
    filters: { is_active: true },
    orderBy: { column: 'name', ascending: true },
  });
};

export const useLowStockItems = (restaurantId: string) => {
  return useRestaurantData<InventoryItem>({
    queryKey: 'low-stock-items',
    tableName: 'restaurant_inventory',
    restaurantId,
    selectFields: '*',
    filters: { is_active: true },
    orderBy: { column: 'current_stock', ascending: true },
    onSuccess: (data) => {
      // Filter low stock items in memory since Supabase comparison might be complex
      return data.filter(item => item.current_stock <= item.minimum_stock);
    }
  });
};

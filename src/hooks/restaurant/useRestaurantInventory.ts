
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
  const result = useRestaurantData({
    queryKey: 'restaurant-inventory',
    tableName: 'restaurant_inventory',
    restaurantId,
    selectFields: '*',
    filters: { is_active: true },
    orderBy: { column: 'name', ascending: true },
  });

  return {
    ...result,
    data: result.data as InventoryItem[]
  };
};

export const useLowStockItems = (restaurantId: string) => {
  const result = useRestaurantData({
    queryKey: 'low-stock-items',
    tableName: 'restaurant_inventory',
    restaurantId,
    selectFields: '*',
    filters: { is_active: true },
    orderBy: { column: 'current_stock', ascending: true },
    onSuccess: (data) => {
      // Filter low stock items in memory since Supabase comparison might be complex
      return data.filter((item: any) => item.current_stock <= item.minimum_stock);
    }
  });

  return {
    ...result,
    data: result.data.filter((item: any) => item.current_stock <= item.minimum_stock) as InventoryItem[]
  };
};

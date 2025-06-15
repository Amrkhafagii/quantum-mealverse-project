
import { useState, useEffect, useCallback } from 'react';
import { inventoryService, InventoryItem } from '@/services/restaurant/inventoryService';

export function useKitchenInventory(restaurantId: string) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getInventory(restaurantId);
      setItems(data);
    } catch (err) {
      setError((err as any)?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return { items, loading, error, refetch: fetchInventory };
}


import { useState } from 'react';
import { inventoryService, InventoryItem } from '@/services/restaurant/inventoryService';

export function useInventoryOperations(onChange?: (updated: InventoryItem) => void) {
  const [updating, setUpdating] = useState<string | null>(null); // itemId during update
  const [error, setError] = useState<string | null>(null);

  async function adjustStock(item: InventoryItem, delta: number) {
    setUpdating(item.id);
    setError(null);
    try {
      // Perform update using latest value (could use mutex/optimistic)
      const updated = await inventoryService.setStock(item.id, item.current_stock + delta);
      onChange?.(updated);
    } catch (err) {
      setError((err as any)?.message || 'Failed to update stock');
    } finally {
      setUpdating(null);
    }
  }

  async function setStock(item: InventoryItem, newValue: number) {
    setUpdating(item.id);
    setError(null);
    try {
      const updated = await inventoryService.setStock(item.id, newValue);
      onChange?.(updated);
    } catch (err) {
      setError((err as any)?.message || 'Failed to update stock');
    } finally {
      setUpdating(null);
    }
  }

  return {
    updating,
    error,
    adjustStock,
    setStock,
  };
}


import React from 'react';
import { InventoryItem } from '@/services/restaurant/inventoryService';

export const LowStockAlert: React.FC<{ items: InventoryItem[] }> = ({ items }) => {
  const lowStock = items.filter(i => i.current_stock <= i.minimum_stock);
  if (lowStock.length === 0) return null;
  return (
    <div className="p-2 mb-3 rounded bg-yellow-100 text-yellow-900 border border-yellow-300">
      <b>Low Stock Alert:</b> {lowStock.map(i => i.name).join(', ')}
    </div>
  );
};

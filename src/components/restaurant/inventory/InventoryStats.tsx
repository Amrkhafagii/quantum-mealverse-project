
import React from 'react';
import { InventoryItem } from '@/services/restaurant/inventoryService';

export const InventoryStats: React.FC<{ items: InventoryItem[] }> = ({ items }) => {
  const total = items.reduce((sum, i) => sum + i.current_stock, 0);
  const minWarning = items.filter(i => i.current_stock <= i.minimum_stock).length;
  return (
    <div className="mb-4 text-sm text-gray-500">
      <span>Total items: <b>{items.length}</b>, </span>
      <span>Total stock: <b>{total}</b> units</span>
      {minWarning > 0 && (
        <span className="ml-3 text-red-500">({minWarning} at/below minimum)</span>
      )}
    </div>
  );
};

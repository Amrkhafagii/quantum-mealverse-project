
import React, { useState } from 'react';
import { InventoryItem } from '@/services/restaurant/inventoryService';

interface Props {
  item: InventoryItem;
  onStockChange: (updated: InventoryItem) => void;
  disabled?: boolean;
}

export const StockAdjustmentControls: React.FC<Props> = ({ item, onStockChange, disabled }) => {
  const [localDelta, setLocalDelta] = useState(0);

  return (
    <div className="flex gap-2 mt-2">
      <button
        className="px-2 py-1 border rounded min-w-[32px] bg-gray-100 dark:bg-slate-800"
        disabled={disabled || item.current_stock <= 0}
        onClick={() => onStockChange({ ...item, current_stock: item.current_stock - 1 })}
        aria-label="Decrease stock"
      >-</button>
      <span className="px-2">{item.current_stock}</span>
      <button
        className="px-2 py-1 border rounded min-w-[32px] bg-gray-100 dark:bg-slate-800"
        disabled={disabled}
        onClick={() => onStockChange({ ...item, current_stock: item.current_stock + 1 })}
        aria-label="Increase stock"
      >+</button>
    </div>
  );
};

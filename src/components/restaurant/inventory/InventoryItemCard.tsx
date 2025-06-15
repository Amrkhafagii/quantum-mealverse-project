
import React from 'react';
import { InventoryItem } from '@/services/restaurant/inventoryService';
import { StockAdjustmentControls } from './StockAdjustmentControls';

export interface InventoryItemCardProps {
  item: InventoryItem;
  onStockChange: (newItem: InventoryItem) => void;
  adjusting: boolean;
}

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({
  item,
  onStockChange,
  adjusting
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded shadow mb-2 flex flex-col px-4 py-2 items-start">
      <div className="font-semibold text-lg">{item.name}</div>
      <div className="flex items-center gap-4 mt-1">
        <span>Stock: <b>{item.current_stock} {item.unit}</b></span>
        <span className={`text-xs ml-2 ${item.current_stock <= item.minimum_stock ? 'text-red-500' : 'text-gray-500'}`}>
          Min: {item.minimum_stock}
        </span>
      </div>
      <StockAdjustmentControls
        item={item}
        onStockChange={onStockChange}
        disabled={adjusting}
      />
    </div>
  );
};

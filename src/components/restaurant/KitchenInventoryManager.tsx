
import React, { useState } from 'react';
import { useKitchenInventory } from '@/hooks/restaurant/useKitchenInventory';
import { useInventoryOperations } from '@/hooks/restaurant/useInventoryOperations';
import { InventoryItemCard } from './inventory/InventoryItemCard';
import { LowStockAlert } from './inventory/LowStockAlert';
import { InventoryStats } from './inventory/InventoryStats';

interface Props {
  restaurantId: string;
}

export const KitchenInventoryManager: React.FC<Props> = ({ restaurantId }) => {
  const { items, loading, error, refetch } = useKitchenInventory(restaurantId);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { adjustStock, setStock, updating } = useInventoryOperations(async (updated) => {
    await refetch(); // Always reflect latest
    setEditingId(null);
  });

  if (loading) return <div>Loading inventory…</div>;
  if (error) return <div className="text-red-500">Inventory error: {error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Kitchen Inventory</h2>
      <LowStockAlert items={items} />
      <InventoryStats items={items} />
      <div>
        {items.map(item => (
          <InventoryItemCard
            key={item.id}
            item={item}
            onStockChange={async (newItem) => {
              setEditingId(item.id);
              await setStock(item, newItem.current_stock);
            }}
            adjusting={editingId === item.id || updating === item.id}
          />
        ))}
      </div>
    </div>
  );
};


import { supabase } from '@/integrations/supabase/client';

export interface InventoryItem {
  id: string;
  restaurant_id: string;
  name: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  last_updated: string;
  is_active: boolean;
}

export const inventoryService = {
  async getInventory(restaurantId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('restaurant_inventory')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async updateStock(itemId: string, delta: number): Promise<InventoryItem> {
    // Use RPC or manual select+update to avoid race condition if needed
    const { data, error } = await supabase
      .from('restaurant_inventory')
      .update({ current_stock: supabase.rpc('increment_stock', { item_id: itemId, amount: delta }) })
      .eq('id', itemId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async setStock(itemId: string, newCount: number): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('restaurant_inventory')
      .update({ current_stock: newCount })
      .eq('id', itemId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggleActive(itemId: string, isActive: boolean): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('restaurant_inventory')
      .update({ is_active: isActive })
      .eq('id', itemId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

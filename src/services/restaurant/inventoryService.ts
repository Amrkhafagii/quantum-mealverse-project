
import { supabase } from "@/integrations/supabase/client";

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

// NOTE: Due to missing "restaurant_inventory" from the generated supabase types,
//       we use 'as any' or casting to avoid TS errors. Adjust if types are regenerated.

export const inventoryService = {
  async getInventory(restaurantId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      // @ts-ignore: workaround for missing type in codegen
      .from("restaurant_inventory" as any)
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .order("name", { ascending: true });
    if (error) throw error;
    // @ts-expect-error: data is unknown[] from generic query
    return (data ?? []) as InventoryItem[];
  },

  async updateStock(itemId: string, delta: number): Promise<InventoryItem> {
    // @ts-ignore: workaround for missing type in codegen
    const { data: itemData, error: getError } = await supabase
      .from("restaurant_inventory" as any)
      .select("*")
      .eq("id", itemId)
      .maybeSingle();
    if (getError || !itemData) throw getError || new Error("Item not found");

    const newStock = (itemData as any).current_stock + delta;
    // @ts-ignore: workaround for missing type in codegen
    const { data, error } = await supabase
      .from("restaurant_inventory" as any)
      .update({ current_stock: newStock })
      .eq("id", itemId)
      .select()
      .single();
    if (error) throw error;
    // @ts-expect-error: data type def workaround
    return data as InventoryItem;
  },

  async setStock(itemId: string, newCount: number): Promise<InventoryItem> {
    // @ts-ignore: workaround for missing type in codegen
    const { data, error } = await supabase
      .from("restaurant_inventory" as any)
      .update({ current_stock: newCount })
      .eq("id", itemId)
      .select()
      .single();
    if (error) throw error;
    // @ts-expect-error: data type def workaround
    return data as InventoryItem;
  },

  async toggleActive(itemId: string, isActive: boolean): Promise<InventoryItem> {
    // @ts-ignore: workaround for missing type in codegen
    const { data, error } = await supabase
      .from("restaurant_inventory" as any)
      .update({ is_active: isActive })
      .eq("id", itemId)
      .select()
      .single();
    if (error) throw error;
    // @ts-expect-error: data type def workaround
    return data as InventoryItem;
  },
};

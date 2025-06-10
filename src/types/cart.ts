
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  is_active?: boolean;
  restaurant_id?: string;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
  dietary_tags?: string[];
  customizations?: Record<string, any>;
  assignment_source?: 'nutrition_generation' | 'traditional_ordering' | 'manual';
  // Add missing properties for order creation
  source_type?: 'nutrition_generation' | 'traditional_ordering' | 'manual';
  meal_id?: string | null;
  menu_item_id?: string | null;
}

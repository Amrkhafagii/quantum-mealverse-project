
export interface CartItem {
  meal_id: string;
  restaurant_id: string;
  quantity: number;
  price: number;
  customizations?: Record<string, any>;
  name: string;
}

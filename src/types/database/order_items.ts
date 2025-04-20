
import { Json } from './helpers';

export type OrderItemsRow = {
  id: string;
  order_id: string;
  meal_id: string;
  quantity: number;
  price: number;
  name: string;
  created_at: string;
  user_id: string | null;
};

export type OrderItemsInsert = {
  order_id: string;
  meal_id: string;
  quantity: number;
  price: number;
  name: string;
  user_id?: string | null;
};

export type OrderItemsUpdate = {
  order_id?: string;
  meal_id?: string;
  quantity?: number;
  price?: number;
  name?: string;
  user_id?: string | null;
};

export type OrderItemsSelect = OrderItemsRow;

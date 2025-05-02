
import { Json } from './database';

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  category: string;
  preparation_time: number;
  ingredients?: string[];
  steps?: string[];
  nutritional_info?: NutritionalInfo;
  created_at?: string;
  updated_at?: string;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  allergens?: string[];
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  order?: number;
}

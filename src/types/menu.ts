
export interface Menu {
  id: string;
  name: string;
  description?: string;
  price: number;
  restaurant_id: string;
  category?: string;
  image_url?: string;
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  is_available?: boolean;
  preparation_time?: number;
  ingredients?: string[];
  steps?: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  restaurant_id: string;
  order?: number;
}

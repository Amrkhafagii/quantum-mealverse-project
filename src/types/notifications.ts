
export interface OrderNotification {
  id: string;
  order_id: string;
  restaurant_id?: string;
  user_id: string;
  notification_type: 'new_order' | 'order_accepted' | 'order_rejected' | 'order_preparing' | 
                   'order_ready' | 'order_delivered' | 'order_cancelled' | 'assignment_received';
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface RestaurantAssignment {
  id: string;
  order_id: string;
  restaurant_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  assigned_at: string;
  expires_at: string;
  responded_at?: string;
  response_notes?: string;
  distance_km?: number;
  estimated_prep_time?: number;
  created_at: string;
  updated_at: string;
  details: Record<string, any>;
}

export interface RestaurantReview {
  id: string;
  user_id: string;
  order_id?: string;
  restaurant_id: string;
  meal_id?: string;
  rating: number;
  comment?: string;
  images?: string[];
  is_verified_purchase: boolean;
  is_flagged: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface MealRating {
  meal_id: string;
  restaurant_id: string;
  avg_rating: number;
  review_count: number;
  rating_distribution: Record<string, number>;
  last_updated: string;
}

export interface RestaurantPromotion {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  promotion_type: 'percentage_discount' | 'fixed_discount' | 'buy_one_get_one' | 'free_delivery' | 'combo_deal';
  discount_value?: number;
  minimum_order_amount: number;
  maximum_discount_amount?: number;
  applicable_items: string[];
  start_date: string;
  end_date: string;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  terms_conditions?: string;
  promo_code?: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantPerformanceMetrics {
  id: string;
  restaurant_id: string;
  metric_date: string;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_order_value: number;
  average_preparation_time: number;
  average_rating: number;
  customer_satisfaction_score: number;
  on_time_delivery_rate: number;
  order_accuracy_rate: number;
  peak_hours: any[];
  created_at: string;
  updated_at: string;
}

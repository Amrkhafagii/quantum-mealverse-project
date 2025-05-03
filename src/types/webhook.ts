
export interface AssignmentStatus {
  assigned_restaurant_id?: string;
  restaurant_name?: string;
  attempt_count?: number;
  status?: string;
  expires_at?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  AWAITING_RESTAURANT = 'awaiting_restaurant',
  RESTAURANT_ASSIGNED = 'restaurant_assigned',
  RESTAURANT_ACCEPTED = 'accepted',
  RESTAURANT_REJECTED = 'restaurant_rejected',
  PROCESSING = 'processing',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  ON_THE_WAY = 'on_the_way',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  NO_RESTAURANT_ACCEPTED = 'no_restaurant_accepted',
  NO_RESTAURANT_AVAILABLE = 'no_restaurant_available',
  REFUNDED = 'refunded'
}

export interface WebhookResponse {
  success: boolean;
  message?: string;
  error?: string;
  order_id?: string;
  status?: string;
}

export interface OrderAssignmentRequest {
  order_id: string;
  latitude: number;
  longitude: number;
}

export interface RestaurantResponseRequest {
  order_id: string;
  restaurant_id: string;
  assignment_id: string;
  action: 'accept' | 'reject';
}

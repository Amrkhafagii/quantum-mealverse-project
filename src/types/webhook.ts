
export interface OrderAssignmentRequest {
  order_id: string;
  latitude?: number | null;
  longitude?: number | null;
  action: 'assign';
}

export interface RestaurantResponseRequest {
  order_id: string;
  restaurant_id: string;
  assignment_id: string;
  latitude?: number | null;
  longitude?: number | null;
  action: 'accept' | 'reject';
}

export interface AssignmentStatus {
  status: string;
  assigned_restaurant_id?: string;
  restaurant_name?: string;
  assignment_id?: string;
  expires_at?: string;
  attempt_count: number;
}

export interface WebhookResponse {
  success: boolean;
  result?: any;
  error?: string;
}

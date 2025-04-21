
export interface OrderAssignmentRequest {
  order_id: string;
  latitude: number;
  longitude: number;
  action: 'assign';
  expired_reassignment?: boolean;
}

export interface RestaurantResponseRequest {
  order_id: string;
  restaurant_id: string;
  assignment_id: string;
  latitude: number;
  longitude: number;
  action: 'accept' | 'reject';
}

export interface AssignmentStatus {
  status: string;
  assigned_restaurant_id?: string;
  restaurant_name?: string;
  assignment_id?: string;
  expires_at?: string;
  attempt_count: number;
  pending_count?: number;
  accepted_count?: number;
  rejected_count?: number;
  expired_count?: number;
}

export interface WebhookResponse {
  success: boolean;
  result?: any;
  error?: string;
}

import { z } from 'zod';

export enum OrderStatus {
  PENDING = 'pending',
  AWAITING_RESTAURANT = 'awaiting_restaurant',
  RESTAURANT_ASSIGNED = 'restaurant_assigned', 
  RESTAURANT_ACCEPTED = 'accepted',
  RESTAURANT_REJECTED = 'rejected',
  EXPIRED_ASSIGNMENT = 'expired_assignment',
  NO_RESTAURANT_AVAILABLE = 'no_restaurant_available',
  NO_RESTAURANT_ACCEPTED = 'no_restaurant_accepted',
  PROCESSING = 'processing',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  ON_THE_WAY = 'on_the_way',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

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
  message?: string; // Added message property to fix type errors
}

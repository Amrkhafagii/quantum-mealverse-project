
import { OrderStatus } from './webhook';

export interface DeliveryUser {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: 'active' | 'inactive' | 'on_break';
  average_rating: number;
  total_deliveries: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryVehicle {
  id: string;
  delivery_user_id: string;
  type: 'bicycle' | 'car' | 'motorcycle' | 'scooter' | 'on_foot';
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  license_plate?: string;
  insurance_number?: string;
  insurance_expiry?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryDocument {
  id: string;
  delivery_user_id: string;
  document_type: 'drivers_license' | 'vehicle_registration' | 'insurance' | 'identity' | 'background_check' | 'profile_photo' | 'other';
  file_path: string;
  verified: boolean;
  expiry_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAvailability {
  id: string;
  delivery_user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryPaymentDetails {
  id: string;
  delivery_user_id: string;
  account_name: string;
  account_number: string;
  routing_number: string;
  bank_name: string;
  has_accepted_terms: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryEarning {
  id: string;
  delivery_user_id: string;
  order_id?: string;
  base_amount: number;
  tip_amount: number;
  bonus_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  payout_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryMetrics {
  id: string;
  delivery_user_id: string;
  date: string;
  avg_pickup_time: number;
  avg_delivery_time: number;
  on_time_percentage: number;
  acceptance_rate: number;
  completion_rate: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAssignment {
  id: string;
  delivery_user_id?: string;
  order_id: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  pickup_time?: string;
  delivery_time?: string;
  estimated_delivery_time?: string;
  restaurant_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  component: React.ComponentType<any>;
}

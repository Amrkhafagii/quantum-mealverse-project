
export interface DeliveryLocationTracking {
  id: string;
  delivery_assignment_id: string;
  delivery_user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
  battery_level?: number;
  network_type?: string;
  created_at: string;
}

export interface DeliveryETAUpdate {
  id: string;
  delivery_assignment_id: string;
  order_id: string;
  estimated_arrival: string;
  calculated_distance_km?: number;
  calculated_duration_minutes?: number;
  traffic_factor?: number;
  driver_location_lat?: number;
  driver_location_lng?: number;
  destination_lat?: number;
  destination_lng?: number;
  created_at: string;
}

export interface LocationSharingPermission {
  id: string;
  delivery_assignment_id: string;
  customer_user_id: string;
  delivery_user_id: string;
  is_location_sharing_enabled: boolean;
  sharing_expires_at?: string;
  privacy_level: 'precise' | 'approximate' | 'disabled';
  created_at: string;
  updated_at: string;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  battery_level?: number;
  network_type?: string;
}

export interface ETACalculation {
  eta_minutes: number;
  distance_km: number;
  estimated_arrival: string;
}

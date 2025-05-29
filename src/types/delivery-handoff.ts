
export interface DeliveryAssignmentCriteria {
  id: string;
  restaurant_id: string;
  max_distance_km: number;
  max_assignment_time_minutes: number;
  preferred_driver_rating: number;
  priority_factors: {
    distance: number;
    rating: number;
    availability: number;
  };
  created_at: string;
  updated_at: string;
}

export interface DeliveryAssignmentHistory {
  id: string;
  delivery_assignment_id: string;
  delivery_user_id?: string;
  action: 'assigned' | 'accepted' | 'rejected' | 'expired' | 'reassigned';
  reason?: string;
  priority_score?: number;
  distance_km?: number;
  driver_rating?: number;
  assignment_duration_seconds?: number;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface DeliveryDriverAvailability {
  id: string;
  delivery_user_id: string;
  is_available: boolean;
  current_latitude?: number;
  current_longitude?: number;
  max_concurrent_deliveries: number;
  current_delivery_count: number;
  last_location_update: string;
  availability_radius_km: number;
  created_at: string;
  updated_at: string;
}

export interface AvailableDriver {
  delivery_user_id: string;
  driver_name: string;
  priority_score: number;
  distance_km?: number;
  current_deliveries: number;
  average_rating: number;
}

export interface AssignmentResult {
  success: boolean;
  assignment_id?: string;
  driver_name?: string;
  priority_score?: number;
  distance_km?: number;
  expires_at?: string;
  reason?: string;
}

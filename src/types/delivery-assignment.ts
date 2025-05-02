
export interface DeliveryAssignmentRejection {
  id: string;
  assignment_id: string;
  order_id: string;
  reason: string;
  created_at: string;
}

export interface DeliveryLocation {
  id: string;
  assignment_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface DeliveryAssignment {
  id: string;
  order_id: string;
  restaurant_id: string;
  delivery_user_id?: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
  pickup_time?: string;
  delivery_time?: string;
  estimated_delivery_time?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  estimate_minutes?: number;
  restaurant?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  customer?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}

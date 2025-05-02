
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

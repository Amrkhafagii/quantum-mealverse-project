
export interface DeliveryZone {
  id: string;
  name: string;
  polygon: any; // GeoJSON polygon
  is_active: boolean;
  max_delivery_distance: number;
  base_delivery_fee: number;
  per_km_fee: number;
  priority_level: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface DriverApprovalWorkflow {
  id: string;
  delivery_user_id: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'suspended';
  stage: 'documents' | 'background_check' | 'vehicle_inspection' | 'final_approval';
  reviewer_id?: string;
  review_notes?: string;
  rejection_reason?: string;
  approval_date?: string;
  rejection_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryPerformanceAlert {
  id: string;
  delivery_user_id: string;
  alert_type: 'low_rating' | 'high_cancellation' | 'late_delivery' | 'customer_complaint' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  threshold_value?: number;
  actual_value?: number;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryManagementLog {
  id: string;
  admin_user_id: string;
  action_type: 'driver_approved' | 'driver_rejected' | 'driver_suspended' | 'zone_created' | 'zone_updated' | 'alert_resolved' | 'performance_review';
  target_type: 'driver' | 'zone' | 'alert' | 'system';
  target_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AdminDashboardStats {
  totalDrivers: number;
  pendingApprovals: number;
  activeAlerts: number;
  totalZones: number;
  todayDeliveries: number;
  avgRating: number;
}

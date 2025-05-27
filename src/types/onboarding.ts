
export interface RestaurantDocument {
  id: string;
  restaurant_id: string;
  document_type: 'business_license' | 'food_safety_certificate' | 'insurance_certificate' | 'tax_registration' | 'bank_statement' | 'identity_proof';
  document_name: string;
  document_url: string;
  file_size?: number;
  file_type?: string;
  verification_status: 'pending' | 'approved' | 'rejected' | 'under_review';
  verification_notes?: string;
  verified_by?: string;
  verified_at?: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface OperationalHours {
  id: string;
  restaurant_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  is_open: boolean;
  open_time?: string;
  close_time?: string;
  break_start_time?: string;
  break_end_time?: string;
  is_24_hours: boolean;
  special_hours_note?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryArea {
  id: string;
  restaurant_id: string;
  area_name: string;
  area_type: 'radius' | 'polygon' | 'postal_codes';
  radius_km?: number;
  center_latitude?: number;
  center_longitude?: number;
  polygon_coordinates?: Array<{ lat: number; lng: number }>;
  postal_codes?: string[];
  delivery_fee: number;
  minimum_order_amount: number;
  estimated_delivery_time: number;
  is_active: boolean;
  priority_order: number;
  created_at: string;
  updated_at: string;
}

export interface OnboardingProgress {
  id: string;
  restaurant_id: string;
  step_name: string;
  step_number: number;
  is_completed: boolean;
  completed_at?: string;
  data?: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep {
  id: string;
  name: string;
  title: string;
  description: string;
  isRequired: boolean;
  order: number;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'basic_info',
    name: 'basic_info',
    title: 'Basic Information',
    description: 'Restaurant details and contact information',
    isRequired: true,
    order: 1
  },
  {
    id: 'documents',
    name: 'documents',
    title: 'Document Verification',
    description: 'Upload required business documents',
    isRequired: true,
    order: 2
  },
  {
    id: 'operational_hours',
    name: 'operational_hours',
    title: 'Operating Hours',
    description: 'Set your restaurant operating schedule',
    isRequired: true,
    order: 3
  },
  {
    id: 'delivery_areas',
    name: 'delivery_areas',
    title: 'Delivery Areas',
    description: 'Configure delivery zones and fees',
    isRequired: true,
    order: 4
  },
  {
    id: 'review',
    name: 'review',
    title: 'Review & Submit',
    description: 'Review all information and submit for approval',
    isRequired: true,
    order: 5
  }
];


// Authentication-related types with updated user ID naming

export interface UserType {
  id: string;
  user_types_user_id: string; // Updated to match new naming convention
  type: 'customer' | 'restaurant' | 'delivery' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface DeliveryInfo {
  id: string;
  delivery_info_user_id: string; // Updated to match new naming convention
  full_name: string;
  phone: string;
  address: string;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAddress {
  id: string;
  delivery_addresses_user_id: string; // Updated to match new naming convention
  full_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserLocation {
  id: string;
  user_locations_user_id: string; // Updated to match new naming convention
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  created_at: string;
}

export interface AdminUser {
  admin_users_user_id: string; // Updated to match new naming convention
  created_at: string;
}

export interface AuthContextType {
  user: any | null;
  userType: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: string, additionalData?: any) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface LoginFormData {
  email: string;
  password: string;
  userType?: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'customer' | 'restaurant' | 'delivery';
  fullName: string;
  phone: string;
  // Restaurant-specific fields
  restaurantName?: string;
  address?: string;
  city?: string;
  description?: string;
  // Delivery-specific fields
  vehicleType?: string;
  licensePlate?: string;
  driverLicenseNumber?: string;
}

export interface ValidationResult {
  success: boolean;
  message?: string;
  user?: any;
}

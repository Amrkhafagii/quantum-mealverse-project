
// Core user types with updated naming convention

export interface BaseUser {
  id: string; // UUID from auth.users
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile extends BaseUser {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

// User type mapping interfaces
export interface UserType {
  id: string;
  user_types_user_id: string; // Updated to match new naming convention
  type: 'customer' | 'restaurant' | 'delivery' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface DeliveryUser extends BaseUser {
  delivery_users_user_id: string; // Updated to match new naming convention
  full_name: string;
  phone: string;
  vehicle_type: string;
  license_plate: string;
  driver_license_number: string;
  status: 'active' | 'inactive' | 'suspended';
  rating: number;
  total_deliveries: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  background_check_status: 'pending' | 'approved' | 'rejected';
  is_available: boolean;
  last_active: string;
}

export interface RestaurantUser extends BaseUser {
  restaurants_user_id: string; // Updated to match new naming convention
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  cuisine_type?: string;
  is_active: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  latitude?: number;
  longitude?: number;
}

export interface CustomerProfile extends BaseUser {
  customer_profiles_user_id: string; // Updated to match new naming convention
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  dietary_preferences?: string[];
  allergies?: string[];
  default_delivery_address?: string;
  loyalty_points?: number;
}

// Authentication context types
export interface AuthUser extends BaseUser {
  user_metadata?: {
    user_type?: string;
    full_name?: string;
    phone?: string;
  };
}

export interface AuthContextValue {
  user: AuthUser | null;
  userType: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: string, additionalData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

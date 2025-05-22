
import { Database as GeneratedDatabase } from '@/integrations/supabase/types';

export type Database = GeneratedDatabase & {
  public: {
    Tables: {
      unified_locations: {
        Row: {
          id: string;
          location_type: string;
          user_id?: string;
          order_id?: string;
          delivery_assignment_id?: string;
          restaurant_id?: string;
          latitude: number;
          longitude: number;
          altitude?: number;
          accuracy?: number;
          altitude_accuracy?: number;
          heading?: number;
          speed?: number;
          timestamp: string;
          device_info?: any;
          source: string;
          is_moving?: boolean;
          battery_level?: number;
          network_type?: string;
          retention_expires_at?: string;
          is_anonymized?: boolean;
          user_consent?: boolean;
          geom?: any;
        };
        Insert: {
          id: string;
          location_type: string;
          user_id?: string;
          order_id?: string;
          delivery_assignment_id?: string;
          restaurant_id?: string;
          latitude: number;
          longitude: number;
          altitude?: number;
          accuracy?: number;
          altitude_accuracy?: number;
          heading?: number;
          speed?: number;
          timestamp: string;
          device_info?: any;
          source: string;
          is_moving?: boolean;
          battery_level?: number;
          network_type?: string;
          retention_expires_at?: string;
          is_anonymized?: boolean;
          user_consent?: boolean;
        };
        Update: {
          id?: string;
          location_type?: string;
          user_id?: string;
          order_id?: string;
          delivery_assignment_id?: string;
          restaurant_id?: string;
          latitude?: number;
          longitude?: number;
          altitude?: number;
          accuracy?: number;
          altitude_accuracy?: number;
          heading?: number;
          speed?: number;
          timestamp?: string;
          device_info?: any;
          source?: string;
          is_moving?: boolean;
          battery_level?: number;
          network_type?: string;
          retention_expires_at?: string;
          is_anonymized?: boolean;
          user_consent?: boolean;
        };
      },
    };
  };
};

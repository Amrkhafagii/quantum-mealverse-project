
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser extends User {
  user_metadata: {
    user_type?: string;
    [key: string]: any;
  };
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  session?: Session;
  error?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  userType?: string;
  metadata?: Record<string, any>;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(data: SignInData): Promise<AuthResult> {
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: signInData.user as AuthUser,
        session: signInData.session
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      };
    }
  }

  /**
   * Sign up with email and password
   */
  static async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      const redirectUrl = window.location.origin + "/";
      
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            user_type: data.userType,
            ...data.metadata,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: signUpData.user as AuthUser,
        session: signUpData.session
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign up failed'
      };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      };
    }
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<AuthResult> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: session?.user as AuthUser,
        session
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session'
      };
    }
  }

  /**
   * Get user delivery information
   */
  static async getUserDeliveryInfo(userId: string) {
    try {
      const { data: deliveryInfo } = await supabase
        .from('delivery_info')
        .select('*')
        .eq('delivery_info_user_id', userId)
        .maybeSingle();

      const { data: locationData } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_locations_user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      return { deliveryInfo, locationData };
    } catch (error) {
      console.error('Error fetching user delivery info:', error);
      return { deliveryInfo: null, locationData: null };
    }
  }

  /**
   * Get user previous orders for default values
   */
  static async getUserPreviousOrders(userId: string) {
    try {
      const { data: previousOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return previousOrders;
    } catch (error) {
      console.error('Error fetching previous orders:', error);
      return null;
    }
  }
}

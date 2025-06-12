
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface ValidationResult {
  success: boolean;
  message?: string;
  user?: User;
}

/**
 * Get authenticated user from current session
 */
export const getCurrentUser = async (): Promise<ValidationResult> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { 
        success: false, 
        message: 'Unauthorized: No valid user session found' 
      };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { 
      success: false, 
      message: 'Authentication error' 
    };
  }
};

/**
 * Validate that a restaurant belongs to the authenticated user
 */
export const validateRestaurantOwnership = async (
  restaurantId: string, 
  userId: string // Now expects UUID string
): Promise<ValidationResult> => {
  try {
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('id, user_id')
      .eq('id', restaurantId)
      .eq('user_id', userId) // Now compares UUID strings
      .single();

    if (error || !restaurant) {
      return { 
        success: false, 
        message: 'Unauthorized: You do not own this restaurant' 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error validating restaurant ownership:', error);
    return { 
      success: false, 
      message: 'Error validating restaurant ownership' 
    };
  }
};

/**
 * Validate that an order belongs to the authenticated user or their restaurant
 */
export const validateOrderAccess = async (
  orderId: string, 
  userId: string // Now expects UUID string
): Promise<ValidationResult> => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id, 
        customer_id, 
        restaurant_id,
        restaurants!orders_restaurant_id_fkey (
          user_id
        )
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return { 
        success: false, 
        message: 'Order not found' 
      };
    }

    // Check if user owns the order or owns the restaurant
    const isOrderOwner = order.customer_id === userId; // UUID comparison
    const isRestaurantOwner = order.restaurants?.user_id === userId; // UUID comparison

    if (!isOrderOwner && !isRestaurantOwner) {
      return { 
        success: false, 
        message: 'Unauthorized: You do not have access to this order' 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error validating order access:', error);
    return { 
      success: false, 
      message: 'Error validating order access' 
    };
  }
};

/**
 * Validate that a delivery assignment belongs to the authenticated delivery user
 */
export const validateDeliveryAssignment = async (
  assignmentId: string,
  userId: string // Now expects UUID string
): Promise<ValidationResult> => {
  try {
    const { data: assignment, error } = await supabase
      .from('delivery_assignments')
      .select('id, delivery_user_id')
      .eq('id', assignmentId)
      .eq('delivery_user_id', userId) // UUID comparison
      .single();

    if (error || !assignment) {
      return { 
        success: false, 
        message: 'Unauthorized: You do not have access to this delivery assignment' 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error validating delivery assignment:', error);
    return { 
      success: false, 
      message: 'Error validating delivery assignment' 
    };
  }
};

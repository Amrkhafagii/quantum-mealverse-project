
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/types/database';

interface ServiceResponse {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Records an order status change in the order history
 */
export const recordOrderHistory = async (
  orderId: string,
  status: string,
  restaurantId?: string | null,
  details?: Record<string, any>,
  timestamp?: string
): Promise<ServiceResponse> => {
  try {
    // Get restaurant name if restaurantId is provided
    let restaurantName;
    if (restaurantId) {
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', restaurantId)
        .single();
      
      if (restaurantError) {
        console.error(`Failed to fetch restaurant name for ID ${restaurantId}:`, restaurantError);
      } else {
        restaurantName = restaurantData?.name;
      }
    }

    // Convert details to Json type if provided
    const jsonDetails: Json = details ? JSON.parse(JSON.stringify(details)) : {};

    const { error } = await supabase
      .from('order_history')
      .insert({
        order_id: orderId,
        status,
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        details: jsonDetails,
        created_at: timestamp || new Date().toISOString()
      });

    if (error) {
      console.error(`Error recording order history for order ${orderId}:`, error);
      return { 
        success: false, 
        message: `Failed to record order history: ${error.message}` 
      };
    }

    console.log(`Successfully recorded order history for order ${orderId} with status ${status}`);
    return { 
      success: true, 
      message: 'Order history recorded successfully' 
    };
  } catch (error) {
    console.error(`Critical error recording order history for order ${orderId}:`, error);
    return { 
      success: false, 
      message: `Critical error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

/**
 * Records restaurant-specific order history with enhanced context
 */
export const recordRestaurantOrderHistory = async (
  orderId: string,
  status: string,
  restaurantId: string,
  additionalDetails?: Record<string, any>
): Promise<ServiceResponse> => {
  try {
    const details = {
      ...additionalDetails,
      restaurant_context: true,
      timestamp: new Date().toISOString()
    };

    return await recordOrderHistory(
      orderId,
      status,
      restaurantId,
      details
    );
  } catch (error) {
    console.error(`Error recording restaurant order history for order ${orderId}:`, error);
    return { 
      success: false, 
      message: `Failed to record restaurant order history: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};


import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/types/database';

interface ServiceResponse {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Validates and normalizes changed_by_type to ensure it meets database constraints
 */
const validChangedByTypes = ['system', 'customer', 'restaurant', 'delivery'] as const;
type ValidChangedByType = typeof validChangedByTypes[number];

const validateChangedByType = (changedByType?: string, context?: string): ValidChangedByType => {
  // Log the input value for debugging
  console.log('🔍 Validating changedByType input:', { 
    input: changedByType, 
    context: context || 'unknown',
    type: typeof changedByType,
    isString: typeof changedByType === 'string',
    isIncluded: changedByType ? validChangedByTypes.includes(changedByType as any) : false
  });

  if (changedByType && validChangedByTypes.includes(changedByType as any)) {
    console.log('✅ changedByType validation passed:', changedByType);
    return changedByType as ValidChangedByType;
  }
  
  console.warn('⚠️ changedByType validation failed, defaulting to system:', {
    input: changedByType,
    validTypes: validChangedByTypes,
    defaulting: 'system'
  });
  
  return 'system';
};

/**
 * Records an order status change in the order history
 */
export const recordOrderHistory = async (
  orderId: string,
  status: string,
  restaurantId?: string | null,
  details?: Record<string, any>,
  timestamp?: string,
  changedBy?: string,
  changedByType?: string
): Promise<ServiceResponse> => {
  try {
    console.log('📝 Recording order history:', {
      orderId,
      status,
      restaurantId,
      changedBy,
      changedByType: changedByType,
      rawChangedByType: JSON.stringify(changedByType)
    });

    // Create context for better validation
    const context = `${status}_${restaurantId ? 'restaurant' : 'system'}`;
    const validatedChangedByType = validateChangedByType(changedByType, context);
    
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

    // Log the final values before insertion
    const insertData = {
      order_id: orderId,
      status,
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      details: jsonDetails,
      created_at: timestamp || new Date().toISOString(),
      changed_by: changedBy,
      changed_by_type: validatedChangedByType
    };

    console.log('🚀 Inserting order history with validated data:', {
      ...insertData,
      detailsSize: JSON.stringify(jsonDetails).length
    });

    const { error } = await supabase
      .from('order_history')
      .insert(insertData);

    if (error) {
      console.error(`❌ Error recording order history for order ${orderId}:`, {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        insertData: insertData
      });
      return { 
        success: false, 
        message: `Failed to record order history: ${error.message}` 
      };
    }

    console.log(`✅ Successfully recorded order history for order ${orderId} with status ${status}`);
    return { 
      success: true, 
      message: 'Order history recorded successfully' 
    };
  } catch (error) {
    console.error(`💥 Critical error recording order history for order ${orderId}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      orderId,
      status,
      changedByType
    });
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
  changedBy?: string,
  additionalDetails?: Record<string, any>
): Promise<ServiceResponse> => {
  try {
    console.log('🏪 Recording restaurant order history:', {
      orderId,
      status,
      restaurantId,
      changedBy
    });

    const details = {
      ...additionalDetails,
      restaurant_context: true,
      timestamp: new Date().toISOString()
    };

    return await recordOrderHistory(
      orderId,
      status,
      restaurantId,
      details,
      undefined,
      changedBy,
      'restaurant' // Always use 'restaurant' for restaurant-specific actions
    );
  } catch (error) {
    console.error(`❌ Error recording restaurant order history for order ${orderId}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      orderId,
      status,
      restaurantId
    });
    return { 
      success: false, 
      message: `Failed to record restaurant order history: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

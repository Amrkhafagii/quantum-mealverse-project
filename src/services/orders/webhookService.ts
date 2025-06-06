
import { sendOrderToWebhook } from './webhook/sendOrderWebhook';
import { getAssignmentStatus } from './webhook/assignmentStatus';
import { recordOrderHistory } from './webhook/orderHistoryService';
import { OrderStatus } from '@/types/webhook';
import { supabase } from '@/integrations/supabase/client';

interface UpdateOrderStatusParams {
  orderId: string;
  newStatus: OrderStatus;
  restaurantId?: string | null;
  details?: Record<string, unknown>;
}

interface WebhookValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validates webhook request parameters
 */
const validateUpdateOrderParams = (params: UpdateOrderStatusParams): WebhookValidationError[] => {
  const errors: WebhookValidationError[] = [];

  if (!params.orderId || typeof params.orderId !== 'string' || params.orderId.trim() === '') {
    errors.push({
      field: 'orderId',
      message: 'Order ID is required and must be a non-empty string',
      code: 'MISSING_ORDER_ID'
    });
  }

  if (!params.newStatus || typeof params.newStatus !== 'string') {
    errors.push({
      field: 'newStatus',
      message: 'New status is required and must be a valid OrderStatus',
      code: 'MISSING_STATUS'
    });
  }

  // Validate status against enum values
  if (params.newStatus && !Object.values(OrderStatus).includes(params.newStatus)) {
    errors.push({
      field: 'newStatus',
      message: `Invalid status: ${params.newStatus}. Must be one of: ${Object.values(OrderStatus).join(', ')}`,
      code: 'INVALID_STATUS'
    });
  }

  return errors;
};

/**
 * Updates an order status with comprehensive error handling and validation
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  restaurantId: string | null = null,
  details?: Record<string, unknown>
): Promise<{ success: boolean; error?: string; validationErrors?: WebhookValidationError[] }> => {
  try {
    console.log(`🔄 Starting order status update for ${orderId} to ${newStatus}`);
    
    // Validate input parameters
    const validationErrors = validateUpdateOrderParams({
      orderId,
      newStatus,
      restaurantId,
      details
    });

    if (validationErrors.length > 0) {
      console.error('❌ Validation failed for order status update:', validationErrors);
      return { 
        success: false, 
        error: 'Validation failed: ' + validationErrors.map(e => e.message).join(', '),
        validationErrors 
      };
    }

    // Check if order exists before attempting update
    const { data: existingOrder, error: orderCheckError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single();

    if (orderCheckError) {
      if (orderCheckError.code === 'PGRST116') {
        console.error(`❌ Order not found: ${orderId}`);
        return { 
          success: false, 
          error: `Order with ID ${orderId} not found` 
        };
      }
      console.error('❌ Database error checking order:', orderCheckError);
      return { 
        success: false, 
        error: 'Database error while checking order existence' 
      };
    }

    // Prepare update data with timestamp
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    // Add restaurant_id if this is a restaurant acceptance
    if (newStatus === OrderStatus.RESTAURANT_ACCEPTED && restaurantId) {
      updateData.restaurant_id = restaurantId;
    }

    // Update order status in database
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ Failed to update order status in database:', updateError);
      return { 
        success: false, 
        error: `Database update failed: ${updateError.message}` 
      };
    }

    // Record to order history with error handling
    try {
      await recordOrderHistory(
        orderId,
        newStatus,
        restaurantId,
        details
      );
      console.log('✅ Order history recorded successfully');
    } catch (historyError) {
      console.warn('⚠️ Failed to record order history (non-critical):', historyError);
      // Don't fail the entire operation if history recording fails
    }

    console.log(`✅ Successfully updated order ${orderId} status to ${newStatus}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Critical error updating order status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// For backwards compatibility - export getAssignmentStatus as checkAssignmentStatus
export const checkAssignmentStatus = getAssignmentStatus;

// Re-export the functions for external use
export {
  sendOrderToWebhook,
  getAssignmentStatus
};

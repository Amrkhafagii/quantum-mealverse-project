
import { supabase } from '@/integrations/supabase/client';

// Define allowed order statuses for refunds
const REFUND_ELIGIBLE_STATUSES = ['delivered', 'cancelled', 'no_restaurant_accepted'] as const;
type RefundEligibleStatus = typeof REFUND_ELIGIBLE_STATUSES[number];

interface Order {
  id: string;
  status: string;
  total: number;
  customer_name: string;
  created_at: string;
  user_id: string;
}

interface RefundRequest {
  order_id: string;
  user_id: string;
  reason: string;
  requested_amount: number;
  notes?: string;
}

interface RefundResult {
  success: boolean;
  message: string;
  refund_id?: string;
}

/**
 * Checks if an order is eligible for refund based on its status
 */
const isRefundEligible = (orderStatus: string): orderStatus is RefundEligibleStatus => {
  return REFUND_ELIGIBLE_STATUSES.includes(orderStatus as RefundEligibleStatus);
};

/**
 * Gets user-friendly error messages for refund eligibility
 */
const getRefundIneligibilityMessage = (orderStatus: string): string => {
  const statusMessages: Record<string, string> = {
    'pending': 'Orders that are still pending cannot be refunded. Please wait for the order to be processed or contact support to cancel.',
    'preparing': 'Orders currently being prepared cannot be refunded. Please contact the restaurant directly.',
    'on_the_way': 'Orders out for delivery cannot be refunded. Please wait for delivery or contact support.',
    'restaurant_accepted': 'Orders accepted by restaurants cannot be refunded automatically. Please contact support.',
    'processing': 'Orders currently being processed cannot be refunded. Please wait or contact support.'
  };
  
  return statusMessages[orderStatus] || `Refunds cannot be processed for orders with status: ${orderStatus}. Please contact support for assistance.`;
};

/**
 * Validates refund request parameters
 */
const validateRefundRequest = (
  orderId: string, 
  userId: string, 
  reason: string, 
  requestedAmount: number
): { isValid: boolean; error?: string } => {
  if (!orderId?.trim()) {
    return { isValid: false, error: 'Order ID is required' };
  }
  
  if (!userId?.trim()) {
    return { isValid: false, error: 'User ID is required' };
  }
  
  if (!reason?.trim()) {
    return { isValid: false, error: 'Refund reason is required' };
  }
  
  if (requestedAmount <= 0) {
    return { isValid: false, error: 'Refund amount must be greater than zero' };
  }
  
  return { isValid: true };
};

/**
 * Processes a refund request with comprehensive validation and error handling
 */
export const requestRefund = async (
  orderId: string,
  userId: string,
  reason: string,
  requestedAmount?: number,
  notes?: string
): Promise<RefundResult> => {
  try {
    console.log(`Processing refund request for order ${orderId} by user ${userId}`);
    console.log(`Refund details: reason="${reason}", amount=${requestedAmount}, notes="${notes || 'none'}"`);
    
    // Step 1: Validate input parameters
    const validation = validateRefundRequest(orderId, userId, reason, requestedAmount || 0);
    if (!validation.isValid) {
      console.error(`Refund request validation failed: ${validation.error}`);
      return {
        success: false,
        message: validation.error || 'Invalid refund request parameters'
      };
    }

    // Step 2: Fetch and validate order
    console.log(`Fetching order ${orderId} for refund eligibility check`);
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, total, customer_name, created_at, customer_id')
      .eq('id', orderId)
      .eq('customer_id', userId) // Ensure user owns the order
      .single();

    if (orderError || !order) {
      console.error('Error fetching order for refund:', orderError);
      return {
        success: false,
        message: 'Failed to find the specified order. Please check the order ID and try again.'
      };
    }

    // Step 3: Check refund eligibility
    console.log(`Checking refund eligibility for order ${orderId} with status: ${order.status}`);
    if (!isRefundEligible(order.status)) {
      const errorMessage = getRefundIneligibilityMessage(order.status);
      console.error(`Order ${orderId} is not eligible for refund: ${errorMessage}`);
      return {
        success: false,
        message: errorMessage
      };
    }

    // Step 4: Validate refund amount
    const finalRefundAmount = requestedAmount || order.total;
    if (finalRefundAmount > order.total) {
      console.error(`Requested refund amount ${finalRefundAmount} exceeds order total ${order.total}`);
      return {
        success: false,
        message: `Refund amount cannot exceed the original order total of $${order.total.toFixed(2)}`
      };
    }

    // Step 5: Check for existing refund requests
    console.log(`Checking for existing refund requests for order ${orderId}`);
    const { data: existingRefund, error: refundCheckError } = await supabase
      .from('refund_requests')
      .select('id')
      .eq('order_id', orderId)
      .single();

    if (refundCheckError && refundCheckError.code !== 'PGRST116') {
      console.error('Error checking existing refund requests:', refundCheckError);
      return {
        success: false,
        message: 'Failed to check existing refund requests. Please try again.'
      };
    }

    if (existingRefund) {
      console.error(`Refund request already exists for order ${orderId}`);
      return {
        success: false,
        message: 'A refund request has already been submitted for this order. Please check your refund status or contact support.'
      };
    }

    // Step 6: Create refund request in database
    console.log(`Creating refund request for order ${orderId} with amount ${finalRefundAmount}`);
    
    const { data: refundRequestData, error: insertError } = await supabase
      .from('refund_requests')
      .insert({
        order_id: orderId,
        user_id: userId,
        reason: reason.trim(),
        requested_amount: finalRefundAmount,
        notes: notes?.trim() || null,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError || !refundRequestData) {
      console.error('Error creating refund request:', insertError);
      return {
        success: false,
        message: 'Failed to submit refund request. Please try again or contact support.'
      };
    }

    console.log(`Successfully created refund request ${refundRequestData.id} for order ${orderId}`);
    
    return {
      success: true,
      message: `Refund request submitted successfully. Your request ID is ${refundRequestData.id}. We will process your refund within 3-5 business days.`,
      refund_id: refundRequestData.id
    };

  } catch (error) {
    console.error('Critical error processing refund request:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while processing your refund request. Please contact support for assistance.'
    };
  }
};

/**
 * Retrieves refund status for an order from the database
 */
export const getRefundStatus = async (orderId: string, userId: string) => {
  try {
    console.log(`Fetching refund status for order ${orderId}`);
    
    const { data: refundData, error } = await supabase
      .from('refund_requests')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        console.log(`No refund request found for order ${orderId}`);
        return null;
      }
      console.error('Error fetching refund status:', error);
      return null;
    }

    console.log(`Refund status retrieved for order ${orderId}:`, refundData.status);
    return refundData;
  } catch (error) {
    console.error('Error getting refund status:', error);
    return null;
  }
};

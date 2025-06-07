
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';
import { Review } from '@/types/review';

/**
 * Enhanced verification service for reviews
 * Provides detailed purchase verification with timeline data
 */
export interface VerificationResult {
  isVerified: boolean;
  orderData?: {
    orderId: string;
    orderDate: string;
    deliveryDate?: string;
    timeSinceDelivery?: number; // in hours
  };
  mealData?: {
    mealId: string;
    mealVersion?: string;
    purchaseCount: number;
  };
}

/**
 * Enhanced verification that provides detailed information about the purchase
 * including order timeline and meal version information
 */
export const verifyPurchaseWithDetails = async (
  userId: string, 
  mealId: string
): Promise<VerificationResult> => {
  try {
    // Find orders containing this meal
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        order_id,
        meal_id,
        quantity,
        orders(
          id, 
          customer_id,
          created_at, 
          status,
          delivery_method,
          updated_at
        )
      `)
      .eq('meal_id', mealId)
      .eq('orders.customer_id', userId)
      .order('orders.created_at', { ascending: false });

    if (itemsError) throw itemsError;
    
    // If no orders found, user hasn't purchased this meal
    if (!orderItems || orderItems.length === 0) {
      return { 
        isVerified: false,
        mealData: {
          mealId,
          purchaseCount: 0
        }
      };
    }

    // Get the most recent order
    const latestOrder = orderItems[0];
    const orderData = latestOrder.orders as unknown as Order;
    
    // Calculate time since delivery (if delivered)
    let timeSinceDelivery: number | undefined;
    if (orderData.status === 'delivered' && orderData.updated_at) {
      const deliveryDate = new Date(orderData.updated_at);
      const now = new Date();
      timeSinceDelivery = Math.floor((now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60));
    }

    // Count total purchases of this meal by the user
    const purchaseCount = orderItems.reduce((total, item) => {
      return total + (item.quantity || 1);
    }, 0);

    // Return detailed verification data
    return {
      isVerified: true,
      orderData: {
        orderId: orderData.id || '',
        orderDate: orderData.created_at || '',
        deliveryDate: orderData.status === 'delivered' ? orderData.updated_at : undefined,
        timeSinceDelivery
      },
      mealData: {
        mealId,
        // In a real system, we'd track meal versions - defaulting to latest for now
        mealVersion: 'latest',
        purchaseCount
      }
    };
  } catch (err) {
    console.error('Error in verifyPurchaseWithDetails:', err);
    return { 
      isVerified: false,
      mealData: {
        mealId,
        purchaseCount: 0
      }
    };
  }
};

/**
 * Check if enough time has passed since delivery to allow a review
 * (Implements the 24-hour rule)
 */
export const canReviewBasedOnTimeline = (verificationResult: VerificationResult): boolean => {
  // If not verified, can't review
  if (!verificationResult.isVerified) return false;
  
  // If no delivery date or time information, be permissive
  if (!verificationResult.orderData?.timeSinceDelivery) return true;
  
  // Require at least 24 hours since delivery before reviewing
  return verificationResult.orderData.timeSinceDelivery >= 24;
};

/**
 * Generate a verification hash that uniquely identifies this review-purchase pair
 * This helps prevent duplicate reviews and provides cryptographic proof
 */
export const generateVerificationHash = (
  userId: string,
  mealId: string, 
  orderId: string
): string => {
  // In a real app, we'd use a proper hashing function
  // For demonstration, we'll create a simple concatenation
  return `${userId}-${mealId}-${orderId}-${Date.now()}`;
};


import { recordOrderHistory } from '../webhook/orderHistoryService';
import { OrderStatus } from '@/types/webhook';
import { logOrderOperation, logOrderError } from '../logging/orderLogger';

/**
 * History recording utilities for orders
 */

export const recordStatusChange = async (
  orderId: string,
  newStatus: OrderStatus,
  restaurantId?: string,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    logOrderOperation('recordStatusChange', { orderId, newStatus, restaurantId });
    
    await recordOrderHistory(
      orderId,
      newStatus,
      restaurantId,
      metadata
    );
  } catch (error) {
    logOrderError('recordStatusChange', error, { orderId, newStatus, restaurantId });
    throw error;
  }
};

export const recordCancellation = async (
  orderId: string,
  reason?: string,
  restaurantId?: string
): Promise<void> => {
  try {
    logOrderOperation('recordCancellation', { orderId, reason, restaurantId });
    
    await recordOrderHistory(
      orderId,
      OrderStatus.CANCELLED,
      restaurantId,
      { 
        cancellation_reason: reason || 'Order cancelled',
        cancelled_at: new Date().toISOString()
      }
    );
  } catch (error) {
    logOrderError('recordCancellation', error, { orderId, reason, restaurantId });
    throw error;
  }
};

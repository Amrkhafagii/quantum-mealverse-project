
import { OrderStatus } from '@/types/webhook';

/**
 * Data transformation utilities for orders
 */

export interface OrderUpdateData {
  status: OrderStatus;
  updated_at: string;
  restaurant_id?: string;
}

export const buildOrderUpdateData = (
  newStatus: OrderStatus,
  restaurantId?: string,
  metadata?: Record<string, any>
): OrderUpdateData => {
  const updateData: OrderUpdateData = {
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  if (restaurantId) {
    updateData.restaurant_id = restaurantId;
  }

  return updateData;
};

export const buildCancellationMetadata = (reason?: string) => {
  return {
    cancellation_reason: reason || 'Order cancelled',
    cancelled_at: new Date().toISOString()
  };
};

export const formatOrderResponse = (rawData: any) => {
  // Format dates, normalize data structure if needed
  return rawData;
};

export const validateOrderUpdateParams = (
  orderId: string,
  newStatus: OrderStatus,
  restaurantId?: string
): boolean => {
  if (!orderId || typeof orderId !== 'string') return false;
  if (!newStatus || typeof newStatus !== 'string') return false;
  if (restaurantId && typeof restaurantId !== 'string') return false;
  return true;
};

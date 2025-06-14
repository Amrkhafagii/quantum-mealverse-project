
import { OrderStatus } from '@/types/webhook';

/**
 * Data transformation utilities for order operations
 */

export const buildOrderUpdateData = (
  status: OrderStatus,
  restaurantId?: string,
  metadata?: Record<string, any>
) => {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  };

  if (restaurantId) {
    updateData.restaurant_id = restaurantId;
  }

  if (metadata) {
    updateData.metadata = metadata;
  }

  return updateData;
};

export const buildCancellationMetadata = (reason?: string) => {
  return {
    cancelled_at: new Date().toISOString(),
    cancellation_reason: reason || 'No reason provided'
  };
};

export const validateOrderUpdateParams = (
  orderId: string,
  status: OrderStatus,
  restaurantId?: string
): boolean => {
  if (!orderId || !status) {
    return false;
  }

  // Validate status is a valid OrderStatus
  const validStatuses = Object.values(OrderStatus);
  if (!validStatuses.includes(status)) {
    return false;
  }

  return true;
};

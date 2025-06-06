
import { useState } from 'react';
import { restaurantOrderStatusService } from '@/services/restaurant/orderStatusService';

export const useRestaurantOrderActions = (restaurantId: string) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const acceptOrder = async (orderId: string, notes?: string) => {
    setIsUpdating(true);
    try {
      const success = await restaurantOrderStatusService.acceptOrder(
        orderId,
        restaurantId,
        notes
      );
      return success;
    } finally {
      setIsUpdating(false);
    }
  };

  const rejectOrder = async (orderId: string, reason?: string) => {
    setIsUpdating(true);
    try {
      const success = await restaurantOrderStatusService.rejectOrder(
        orderId,
        restaurantId,
        reason
      );
      return success;
    } finally {
      setIsUpdating(false);
    }
  };

  const startPreparation = async (orderId: string) => {
    setIsUpdating(true);
    try {
      const success = await restaurantOrderStatusService.startPreparation(
        orderId,
        restaurantId
      );
      return success;
    } finally {
      setIsUpdating(false);
    }
  };

  const markReady = async (orderId: string) => {
    setIsUpdating(true);
    try {
      const success = await restaurantOrderStatusService.markReady(
        orderId,
        restaurantId
      );
      return success;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    acceptOrder,
    rejectOrder,
    startPreparation,
    markReady,
    isUpdating
  };
};

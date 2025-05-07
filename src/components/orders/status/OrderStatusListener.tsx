
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';
import {
  sendOrderStatusNotification,
  sendDeliveryApproachingNotification
} from '@/services/notification/mobileNotificationService';
import { useNotificationPermissions } from '@/hooks/useNotificationPermissions';
import { Platform } from '@/utils/platform';

interface OrderStatusListenerProps {
  orderId: string;
  order?: Order;
}

/**
 * Component that listens for real-time order status changes
 * and triggers notifications on mobile devices
 */
export const OrderStatusListener: React.FC<OrderStatusListenerProps> = ({
  orderId,
  order
}) => {
  const { user } = useAuth();
  const { isPermissionGranted, isSupported } = useNotificationPermissions();
  
  // Subscribe to order status changes
  useEffect(() => {
    if (!orderId || !user || !isSupported || !isPermissionGranted) {
      return;
    }

    // Create a channel to listen for order changes
    const channel = supabase
      .channel(`order_status_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          if (payload.new && payload.old && payload.new.status !== payload.old.status) {
            handleOrderStatusChange(payload.new as Order, payload.old.status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, user, isSupported, isPermissionGranted]);
  
  // Also listen for delivery location updates for proximity alerts
  useEffect(() => {
    if (!orderId || !user || !isSupported || !isPermissionGranted || !order || 
        order.status !== 'on_the_way') {
      return;
    }
    
    let hasTriggeredProximityAlert = false;
    
    // Listen for delivery location updates
    const channel = supabase
      .channel(`delivery_location_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_locations',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          if (payload.new && !hasTriggeredProximityAlert) {
            checkDeliveryProximity(payload.new, order);
            hasTriggeredProximityAlert = true; // Only trigger once
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, user, isSupported, isPermissionGranted, order]);

  // Handle order status changes
  const handleOrderStatusChange = (updatedOrder: Order, previousStatus: string) => {
    if (!Platform.isNative() || !isPermissionGranted) return;
    
    // Send notification for the status change
    sendOrderStatusNotification(
      updatedOrder.id || '',
      updatedOrder.status,
      updatedOrder.restaurant?.name
    );
  };
  
  // Check if delivery is close and send proximity notification
  const checkDeliveryProximity = (deliveryLocation: any, customerOrder: Order) => {
    if (!customerOrder.latitude || !customerOrder.longitude || !Platform.isNative() || !isPermissionGranted) {
      return;
    }
    
    // Calculate distance between delivery and customer
    const distance = calculateDistance(
      deliveryLocation.latitude,
      deliveryLocation.longitude,
      customerOrder.latitude,
      customerOrder.longitude
    );
    
    // If driver is within 2 kilometers, send a proximity notification
    if (distance <= 2) {
      // Estimate arrival time (rough calculation: about 3 min per km at city speeds)
      const estimatedMinutes = Math.max(1, Math.round(distance * 3));
      sendDeliveryApproachingNotification(orderId, estimatedMinutes);
    }
  };
  
  // Calculate distance in kilometers between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  
  // Helper to convert degrees to radians
  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  // This component doesn't render anything visible
  return null;
};

export default OrderStatusListener;

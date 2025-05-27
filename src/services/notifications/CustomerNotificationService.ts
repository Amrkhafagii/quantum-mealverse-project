
import { supabase } from '@/integrations/supabase/client';

export interface CustomerNotification {
  id: string;
  order_id: string;
  customer_id: string;
  notification_type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  is_sent: boolean;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

export class CustomerNotificationService {
  private static instance: CustomerNotificationService;

  private constructor() {}

  static getInstance(): CustomerNotificationService {
    if (!this.instance) {
      this.instance = new CustomerNotificationService();
    }
    return this.instance;
  }

  async sendLocationUpdate(orderId: string, driverLocation: { latitude: number; longitude: number }, estimatedArrival?: number): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('send_customer_notification', {
        p_order_id: orderId,
        p_notification_type: 'location_update',
        p_title: 'Driver Location Update',
        p_message: estimatedArrival 
          ? `Your driver is ${Math.round(estimatedArrival)} minutes away`
          : 'Your driver location has been updated',
        p_data: {
          driver_location: driverLocation,
          estimated_arrival_minutes: estimatedArrival,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('Error sending location update notification:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error sending location update notification:', error);
      return false;
    }
  }

  async sendPickupNotification(orderId: string, restaurantName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('send_customer_notification', {
        p_order_id: orderId,
        p_notification_type: 'order_picked_up',
        p_title: 'Order Picked Up!',
        p_message: `Your order has been picked up from ${restaurantName} and is on the way to you.`,
        p_data: {
          restaurant_name: restaurantName,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('Error sending pickup notification:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error sending pickup notification:', error);
      return false;
    }
  }

  async sendDeliveryStartedNotification(orderId: string, estimatedArrival: number): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('send_customer_notification', {
        p_order_id: orderId,
        p_notification_type: 'delivery_started',
        p_title: 'Driver On The Way',
        p_message: `Your driver is on the way and will arrive in approximately ${estimatedArrival} minutes.`,
        p_data: {
          estimated_arrival_minutes: estimatedArrival,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('Error sending delivery started notification:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error sending delivery started notification:', error);
      return false;
    }
  }

  async sendNearbyNotification(orderId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('send_customer_notification', {
        p_order_id: orderId,
        p_notification_type: 'driver_nearby',
        p_title: 'Driver Nearby',
        p_message: 'Your driver is approaching your location. Please be ready to receive your order.',
        p_data: {
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('Error sending nearby notification:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error sending nearby notification:', error);
      return false;
    }
  }

  async sendDeliveredNotification(orderId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('send_customer_notification', {
        p_order_id: orderId,
        p_notification_type: 'order_delivered',
        p_title: 'Order Delivered!',
        p_message: 'Your order has been delivered. Enjoy your meal!',
        p_data: {
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('Error sending delivered notification:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error sending delivered notification:', error);
      return false;
    }
  }

  async getCustomerNotifications(customerId: string, limit: number = 20): Promise<CustomerNotification[]> {
    try {
      const { data, error } = await supabase
        .from('customer_notifications')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching customer notifications:', error);
        return [];
      }

      return data as CustomerNotification[];
    } catch (error) {
      console.error('Error fetching customer notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customer_notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      return !error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllNotificationsAsRead(customerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customer_notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('customer_id', customerId)
        .eq('is_read', false);

      return !error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Real-time subscription for notifications
  subscribeToNotifications(customerId: string, callback: (notification: CustomerNotification) => void) {
    const channel = supabase
      .channel('customer-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_notifications',
          filter: `customer_id=eq.${customerId}`
        },
        (payload) => {
          callback(payload.new as CustomerNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const customerNotificationService = CustomerNotificationService.getInstance();

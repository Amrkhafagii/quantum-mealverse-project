
import type { OrderEvent } from '@/types/delivery-features';

export interface NotificationMessage {
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high';
  category: 'order_update' | 'driver_update' | 'system' | 'emergency';
}

export class NotificationMessageHandler {
  private static eventMessages: Record<string, NotificationMessage> = {
    'order_confirmed': {
      title: 'Order Confirmed',
      body: 'Your order has been confirmed and is being prepared',
      priority: 'medium',
      category: 'order_update'
    },
    'driver_assigned': {
      title: 'Driver Assigned',
      body: 'A driver has been assigned to your order',
      priority: 'medium',
      category: 'driver_update'
    },
    'pickup_started': {
      title: 'Driver En Route',
      body: 'Your driver is on the way to pick up your order',
      priority: 'medium',
      category: 'driver_update'
    },
    'pickup_completed': {
      title: 'Order Picked Up',
      body: 'Your order has been picked up and is on the way',
      priority: 'high',
      category: 'order_update'
    },
    'delivery_started': {
      title: 'Out for Delivery',
      body: 'Your order is out for delivery',
      priority: 'high',
      category: 'order_update'
    },
    'delivery_completed': {
      title: 'Order Delivered',
      body: 'Your order has been delivered successfully',
      priority: 'high',
      category: 'order_update'
    },
    'order_cancelled': {
      title: 'Order Cancelled',
      body: 'Your order has been cancelled',
      priority: 'high',
      category: 'order_update'
    },
    'driver_location_update': {
      title: 'Driver Update',
      body: 'Your driver location has been updated',
      priority: 'low',
      category: 'driver_update'
    },
    'delivery_delayed': {
      title: 'Delivery Delayed',
      body: 'Your delivery has been delayed. We apologize for the inconvenience.',
      priority: 'high',
      category: 'order_update'
    },
    'driver_arrived': {
      title: 'Driver Arrived',
      body: 'Your driver has arrived at the delivery location',
      priority: 'high',
      category: 'driver_update'
    }
  };

  static getMessageForEvent(eventType: string, customData?: Record<string, any>): NotificationMessage | null {
    const baseMessage = this.eventMessages[eventType];
    if (!baseMessage) {
      console.warn(`No notification message configured for event type: ${eventType}`);
      return null;
    }

    // Customize message based on additional data
    let customizedMessage = { ...baseMessage };
    
    if (customData) {
      customizedMessage = this.customizeMessage(customizedMessage, customData, eventType);
    }

    return customizedMessage;
  }

  private static customizeMessage(
    message: NotificationMessage, 
    data: Record<string, any>, 
    eventType: string
  ): NotificationMessage {
    let customTitle = message.title;
    let customBody = message.body;

    // Customize based on event type and data
    switch (eventType) {
      case 'driver_assigned':
        if (data.driverName) {
          customBody = `${data.driverName} has been assigned to your order`;
        }
        if (data.estimatedTime) {
          customBody += ` - ETA: ${data.estimatedTime}`;
        }
        break;

      case 'pickup_completed':
        if (data.estimatedDeliveryTime) {
          customBody = `Your order has been picked up and will arrive in ${data.estimatedDeliveryTime}`;
        }
        break;

      case 'delivery_completed':
        if (data.deliveryLocation) {
          customBody = `Your order has been delivered to ${data.deliveryLocation}`;
        }
        break;

      case 'delivery_delayed':
        if (data.newEstimatedTime) {
          customBody = `Your delivery has been delayed. New ETA: ${data.newEstimatedTime}`;
        }
        if (data.reason) {
          customBody += ` Reason: ${data.reason}`;
        }
        break;

      case 'driver_arrived':
        if (data.instructions) {
          customBody += ` ${data.instructions}`;
        }
        break;
    }

    return {
      ...message,
      title: customTitle,
      body: customBody
    };
  }

  static shouldSendNotification(eventType: string, userPreferences?: Record<string, boolean>): boolean {
    if (!userPreferences) return true;

    // Check user preferences for different notification categories
    const message = this.getMessageForEvent(eventType);
    if (!message) return false;

    switch (message.category) {
      case 'order_update':
        return userPreferences.orderUpdates !== false;
      case 'driver_update':
        return userPreferences.driverUpdates !== false;
      case 'system':
        return userPreferences.systemNotifications !== false;
      case 'emergency':
        return true; // Always send emergency notifications
      default:
        return true;
    }
  }

  static getNotificationSound(eventType: string): string {
    const message = this.getMessageForEvent(eventType);
    if (!message) return 'default';

    switch (message.priority) {
      case 'high':
        return 'urgent';
      case 'medium':
        return 'default';
      case 'low':
        return 'subtle';
      default:
        return 'default';
    }
  }
}


import { supabase } from '@/integrations/supabase/client';
import { pushNotificationService } from './pushNotificationService';

interface PreparationNotification {
  userId: string;
  orderId: string;
  stageName: string;
  stageStatus: string;
  estimatedTime?: number;
}

class PreparationNotificationService {
  async sendStageUpdateNotification({
    userId,
    orderId,
    stageName,
    stageStatus,
    estimatedTime
  }: PreparationNotification): Promise<void> {
    try {
      let title = 'Order Update';
      let body = '';
      let notificationType = 'preparation_update';

      // Customize notification based on stage and status
      if (stageStatus === 'in_progress') {
        switch (stageName) {
          case 'ingredients_prep':
            title = '👨‍🍳 Preparation Started';
            body = 'Our chefs are preparing your ingredients';
            break;
          case 'cooking':
            title = '🍳 Cooking Started';
            body = 'Your meal is now being cooked!';
            break;
          case 'plating':
            title = '🎨 Final Touches';
            body = 'Adding the finishing touches to your meal';
            break;
          case 'quality_check':
            title = '✅ Quality Check';
            body = 'Ensuring your order meets our standards';
            break;
        }
      } else if (stageStatus === 'completed') {
        switch (stageName) {
          case 'cooking':
            title = '🎉 Cooking Complete';
            body = 'Your meal has been cooked to perfection!';
            notificationType = 'cooking_complete';
            break;
          case 'ready':
            title = '✅ Order Ready!';
            body = 'Your order is ready for pickup/delivery';
            notificationType = 'order_ready';
            break;
          default:
            title = '✓ Stage Complete';
            body = `${stageName.replace('_', ' ')} completed`;
        }
      }

      // Send push notification
      await pushNotificationService.sendNotification(
        userId,
        title,
        body,
        {
          orderId,
          stageName,
          stageStatus,
          estimatedTime
        },
        notificationType
      );

      // Create database notification record
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message: body,
          notification_type: notificationType,
          data: {
            orderId,
            stageName,
            stageStatus,
            estimatedTime
          },
          order_id: orderId
        });

    } catch (error) {
      console.error('Error sending preparation notification:', error);
    }
  }

  async sendEstimatedTimeUpdate(
    userId: string,
    orderId: string,
    newEstimatedTime: number
  ): Promise<void> {
    try {
      const title = '⏱️ Time Update';
      const body = `Your order will be ready in approximately ${newEstimatedTime} minutes`;

      await pushNotificationService.sendNotification(
        userId,
        title,
        body,
        {
          orderId,
          estimatedTime: newEstimatedTime
        },
        'time_update'
      );

      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message: body,
          notification_type: 'time_update',
          data: {
            orderId,
            estimatedTime: newEstimatedTime
          },
          order_id: orderId
        });

    } catch (error) {
      console.error('Error sending time update notification:', error);
    }
  }
}

export const preparationNotificationService = new PreparationNotificationService();

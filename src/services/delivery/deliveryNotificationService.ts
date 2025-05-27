
import { supabase } from '@/integrations/supabase/client';
import type { DeliveryNotificationPreferences } from '@/types/delivery-notification-preferences';

class DeliveryNotificationService {
  async getDeliveryUserNotificationPreferences(deliveryUserId: string): Promise<DeliveryNotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_notification_preferences')
        .select('*')
        .eq('delivery_user_id', deliveryUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, create default ones
          return await this.createDefaultNotificationPreferences(deliveryUserId);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching delivery notification preferences:', error);
      return null;
    }
  }

  async createDefaultNotificationPreferences(deliveryUserId: string): Promise<DeliveryNotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_notification_preferences')
        .insert({
          delivery_user_id: deliveryUserId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating default notification preferences:', error);
      return null;
    }
  }

  async updateNotificationPreferences(
    deliveryUserId: string, 
    preferences: Partial<Omit<DeliveryNotificationPreferences, 'id' | 'delivery_user_id' | 'created_at' | 'updated_at'>>
  ): Promise<DeliveryNotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_notification_preferences')
        .update(preferences)
        .eq('delivery_user_id', deliveryUserId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return null;
    }
  }
}

export const deliveryNotificationService = new DeliveryNotificationService();


import { supabase } from '@/integrations/supabase/client';
import type { DeliveryConfirmation } from '@/types/delivery-features';

class DeliveryConfirmationService {
  async uploadConfirmationPhoto(file: File, assignmentId: string, type: 'pickup' | 'delivery'): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${assignmentId}/${type}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('delivery-confirmations')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('delivery-confirmations')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading confirmation photo:', error);
      return null;
    }
  }

  async createConfirmation(
    assignmentId: string,
    type: 'pickup' | 'delivery',
    photoUrls: string[],
    confirmedBy: string,
    latitude?: number,
    longitude?: number,
    notes?: string
  ): Promise<DeliveryConfirmation | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_confirmations')
        .insert({
          delivery_assignment_id: assignmentId,
          confirmation_type: type,
          photo_urls: photoUrls,
          location_latitude: latitude,
          location_longitude: longitude,
          notes,
          confirmed_by: confirmedBy
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        confirmation_type: data.confirmation_type as 'pickup' | 'delivery'
      };
    } catch (error) {
      console.error('Error creating delivery confirmation:', error);
      return null;
    }
  }

  async getConfirmations(assignmentId: string): Promise<DeliveryConfirmation[]> {
    try {
      const { data, error } = await supabase
        .from('delivery_confirmations')
        .select('*')
        .eq('delivery_assignment_id', assignmentId)
        .order('confirmed_at', { ascending: false });

      return (data || []).map(item => ({
        ...item,
        confirmation_type: item.confirmation_type as 'pickup' | 'delivery'
      }));
    } catch (error) {
      console.error('Error fetching confirmations:', error);
      return [];
    }
  }

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }
}

export const deliveryConfirmationService = new DeliveryConfirmationService();

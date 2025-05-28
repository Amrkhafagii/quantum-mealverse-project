
import { supabase } from '@/integrations/supabase/client';
import type { 
  DeliveryAvailabilitySchedule, 
  DeliveryBreakSetting, 
  DeliveryBreakLog, 
  DeliveryEmergencyContact, 
  DeliveryAutoStatusSettings,
  BreakStatus 
} from '@/types/availability';

class DeliveryAvailabilityService {
  // Availability Schedules
  async getAvailabilitySchedules(deliveryUserId: string): Promise<DeliveryAvailabilitySchedule[]> {
    const { data, error } = await supabase
      .from('delivery_availability_schedules')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching availability schedules:', error);
      throw error;
    }

    return data || [];
  }

  async createAvailabilitySchedule(schedule: Omit<DeliveryAvailabilitySchedule, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryAvailabilitySchedule> {
    const { data, error } = await supabase
      .from('delivery_availability_schedules')
      .insert(schedule)
      .select()
      .single();

    if (error) {
      console.error('Error creating availability schedule:', error);
      throw error;
    }

    return data;
  }

  async updateAvailabilitySchedule(id: string, updates: Partial<DeliveryAvailabilitySchedule>): Promise<DeliveryAvailabilitySchedule> {
    const { data, error } = await supabase
      .from('delivery_availability_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating availability schedule:', error);
      throw error;
    }

    return data;
  }

  async deleteAvailabilitySchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('delivery_availability_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting availability schedule:', error);
      throw error;
    }
  }

  // Break Settings
  async getBreakSettings(deliveryUserId: string): Promise<DeliveryBreakSetting[]> {
    const { data, error } = await supabase
      .from('delivery_break_settings')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .eq('is_active', true)
      .order('break_type');

    if (error) {
      console.error('Error fetching break settings:', error);
      throw error;
    }

    return data || [];
  }

  async createBreakSetting(setting: Omit<DeliveryBreakSetting, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryBreakSetting> {
    const { data, error } = await supabase
      .from('delivery_break_settings')
      .insert(setting)
      .select()
      .single();

    if (error) {
      console.error('Error creating break setting:', error);
      throw error;
    }

    return data;
  }

  async updateBreakSetting(id: string, updates: Partial<DeliveryBreakSetting>): Promise<DeliveryBreakSetting> {
    const { data, error } = await supabase
      .from('delivery_break_settings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating break setting:', error);
      throw error;
    }

    return data;
  }

  async deleteBreakSetting(id: string): Promise<void> {
    const { error } = await supabase
      .from('delivery_break_settings')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting break setting:', error);
      throw error;
    }
  }

  // Break Logs
  async startBreak(deliveryUserId: string, breakType: string, breakSettingId?: string, location?: { latitude: number; longitude: number }): Promise<DeliveryBreakLog> {
    const breakLog: Omit<DeliveryBreakLog, 'id' | 'created_at'> = {
      delivery_user_id: deliveryUserId,
      break_setting_id: breakSettingId,
      start_time: new Date().toISOString(),
      break_type: breakType,
      status: 'active',
      location_latitude: location?.latitude,
      location_longitude: location?.longitude
    };

    const { data, error } = await supabase
      .from('delivery_break_logs')
      .insert(breakLog)
      .select()
      .single();

    if (error) {
      console.error('Error starting break:', error);
      throw error;
    }

    return data;
  }

  async endBreak(breakLogId: string, notes?: string): Promise<DeliveryBreakLog> {
    const endTime = new Date().toISOString();
    
    // First get the break log to calculate duration
    const { data: breakLog, error: fetchError } = await supabase
      .from('delivery_break_logs')
      .select('start_time')
      .eq('id', breakLogId)
      .single();

    if (fetchError) {
      console.error('Error fetching break log:', fetchError);
      throw fetchError;
    }

    const startTime = new Date(breakLog.start_time);
    const actualDuration = Math.round((new Date(endTime).getTime() - startTime.getTime()) / (1000 * 60));

    const { data, error } = await supabase
      .from('delivery_break_logs')
      .update({
        end_time: endTime,
        actual_duration_minutes: actualDuration,
        status: 'completed',
        notes
      })
      .eq('id', breakLogId)
      .select()
      .single();

    if (error) {
      console.error('Error ending break:', error);
      throw error;
    }

    return data;
  }

  async getCurrentBreakStatus(deliveryUserId: string): Promise<BreakStatus> {
    const { data, error } = await supabase
      .rpc('get_current_break_status', { p_delivery_user_id: deliveryUserId });

    if (error) {
      console.error('Error getting current break status:', error);
      return { is_on_break: false };
    }

    if (!data || data.length === 0) {
      return { is_on_break: false };
    }

    return data[0];
  }

  // Emergency Contacts
  async getEmergencyContacts(deliveryUserId: string): Promise<DeliveryEmergencyContact[]> {
    const { data, error } = await supabase
      .from('delivery_emergency_contacts')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .eq('is_active', true)
      .order('contact_priority')
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Error fetching emergency contacts:', error);
      throw error;
    }

    return data || [];
  }

  async createEmergencyContact(contact: Omit<DeliveryEmergencyContact, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryEmergencyContact> {
    // If setting as primary, update existing primary contacts first
    if (contact.is_primary) {
      await supabase
        .from('delivery_emergency_contacts')
        .update({ is_primary: false })
        .eq('delivery_user_id', contact.delivery_user_id)
        .eq('is_primary', true);
    }

    const { data, error } = await supabase
      .from('delivery_emergency_contacts')
      .insert(contact)
      .select()
      .single();

    if (error) {
      console.error('Error creating emergency contact:', error);
      throw error;
    }

    return data;
  }

  async updateEmergencyContact(id: string, updates: Partial<DeliveryEmergencyContact>): Promise<DeliveryEmergencyContact> {
    // If setting as primary, update existing primary contacts first
    if (updates.is_primary) {
      const { data: contact } = await supabase
        .from('delivery_emergency_contacts')
        .select('delivery_user_id')
        .eq('id', id)
        .single();

      if (contact) {
        await supabase
          .from('delivery_emergency_contacts')
          .update({ is_primary: false })
          .eq('delivery_user_id', contact.delivery_user_id)
          .eq('is_primary', true)
          .neq('id', id);
      }
    }

    const { data, error } = await supabase
      .from('delivery_emergency_contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating emergency contact:', error);
      throw error;
    }

    return data;
  }

  async deleteEmergencyContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('delivery_emergency_contacts')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting emergency contact:', error);
      throw error;
    }
  }

  // Auto Status Settings
  async getAutoStatusSettings(deliveryUserId: string): Promise<DeliveryAutoStatusSettings | null> {
    const { data, error } = await supabase
      .from('delivery_auto_status_settings')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .single();

    if (error) {
      console.error('Error fetching auto status settings:', error);
      return null;
    }

    return data;
  }

  async updateAutoStatusSettings(deliveryUserId: string, settings: Partial<DeliveryAutoStatusSettings>): Promise<DeliveryAutoStatusSettings> {
    const { data, error } = await supabase
      .from('delivery_auto_status_settings')
      .upsert({
        delivery_user_id: deliveryUserId,
        ...settings
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating auto status settings:', error);
      throw error;
    }

    return data;
  }

  // Utility Functions
  async checkAvailability(deliveryUserId: string, checkTime?: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('is_delivery_user_available', { 
        p_delivery_user_id: deliveryUserId,
        p_check_time: checkTime || new Date().toISOString()
      });

    if (error) {
      console.error('Error checking availability:', error);
      return false;
    }

    return data || false;
  }
}

export const deliveryAvailabilityService = new DeliveryAvailabilityService();


import { useState, useEffect, useCallback } from 'react';
import { deliveryAvailabilityService } from '@/services/delivery/availabilityService';
import type { 
  DeliveryAvailabilitySchedule, 
  DeliveryBreakSetting, 
  DeliveryEmergencyContact, 
  DeliveryAutoStatusSettings,
  BreakStatus 
} from '@/types/availability';
import { toast } from '@/hooks/use-toast';

export function useDeliveryAvailability(deliveryUserId?: string) {
  const [schedules, setSchedules] = useState<DeliveryAvailabilitySchedule[]>([]);
  const [breakSettings, setBreakSettings] = useState<DeliveryBreakSetting[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<DeliveryEmergencyContact[]>([]);
  const [autoStatusSettings, setAutoStatusSettings] = useState<DeliveryAutoStatusSettings | null>(null);
  const [currentBreakStatus, setCurrentBreakStatus] = useState<BreakStatus>({ is_on_break: false });
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load all availability data
  const loadAvailabilityData = useCallback(async () => {
    if (!deliveryUserId) return;

    try {
      setLoading(true);
      const [schedulesData, breakSettingsData, emergencyContactsData, autoStatusData, breakStatusData] = await Promise.all([
        deliveryAvailabilityService.getAvailabilitySchedules(deliveryUserId),
        deliveryAvailabilityService.getBreakSettings(deliveryUserId),
        deliveryAvailabilityService.getEmergencyContacts(deliveryUserId),
        deliveryAvailabilityService.getAutoStatusSettings(deliveryUserId),
        deliveryAvailabilityService.getCurrentBreakStatus(deliveryUserId)
      ]);

      setSchedules(schedulesData);
      setBreakSettings(breakSettingsData);
      setEmergencyContacts(emergencyContactsData);
      setAutoStatusSettings(autoStatusData);
      setCurrentBreakStatus(breakStatusData);
    } catch (error) {
      console.error('Error loading availability data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load availability settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [deliveryUserId]);

  // Schedule management
  const createSchedule = useCallback(async (schedule: Omit<DeliveryAvailabilitySchedule, 'id' | 'created_at' | 'updated_at'>) => {
    if (!deliveryUserId) return;

    try {
      setIsProcessing(true);
      const newSchedule = await deliveryAvailabilityService.createAvailabilitySchedule(schedule);
      setSchedules(prev => [...prev, newSchedule]);
      toast({
        title: 'Success',
        description: 'Availability schedule created successfully'
      });
      return newSchedule;
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to create availability schedule',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [deliveryUserId]);

  const updateSchedule = useCallback(async (id: string, updates: Partial<DeliveryAvailabilitySchedule>) => {
    try {
      setIsProcessing(true);
      const updatedSchedule = await deliveryAvailabilityService.updateAvailabilitySchedule(id, updates);
      setSchedules(prev => prev.map(schedule => schedule.id === id ? updatedSchedule : schedule));
      toast({
        title: 'Success',
        description: 'Availability schedule updated successfully'
      });
      return updatedSchedule;
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability schedule',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      setIsProcessing(true);
      await deliveryAvailabilityService.deleteAvailabilitySchedule(id);
      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      toast({
        title: 'Success',
        description: 'Availability schedule deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete availability schedule',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Break management
  const createBreakSetting = useCallback(async (setting: Omit<DeliveryBreakSetting, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsProcessing(true);
      const newSetting = await deliveryAvailabilityService.createBreakSetting(setting);
      setBreakSettings(prev => [...prev, newSetting]);
      toast({
        title: 'Success',
        description: 'Break setting created successfully'
      });
      return newSetting;
    } catch (error) {
      console.error('Error creating break setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to create break setting',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const startBreak = useCallback(async (breakType: string, breakSettingId?: string, location?: { latitude: number; longitude: number }) => {
    if (!deliveryUserId) return;

    try {
      setIsProcessing(true);
      await deliveryAvailabilityService.startBreak(deliveryUserId, breakType, breakSettingId, location);
      // Refresh break status
      const breakStatus = await deliveryAvailabilityService.getCurrentBreakStatus(deliveryUserId);
      setCurrentBreakStatus(breakStatus);
      toast({
        title: 'Break Started',
        description: 'Your break has been started successfully'
      });
    } catch (error) {
      console.error('Error starting break:', error);
      toast({
        title: 'Error',
        description: 'Failed to start break',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [deliveryUserId]);

  // Emergency contacts management
  const createEmergencyContact = useCallback(async (contact: Omit<DeliveryEmergencyContact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsProcessing(true);
      const newContact = await deliveryAvailabilityService.createEmergencyContact(contact);
      setEmergencyContacts(prev => [...prev, newContact]);
      toast({
        title: 'Success',
        description: 'Emergency contact added successfully'
      });
      return newContact;
    } catch (error) {
      console.error('Error creating emergency contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to add emergency contact',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Auto status settings management
  const updateAutoStatusSettings = useCallback(async (settings: Partial<DeliveryAutoStatusSettings>) => {
    if (!deliveryUserId) return;

    try {
      setIsProcessing(true);
      const updatedSettings = await deliveryAvailabilityService.updateAutoStatusSettings(deliveryUserId, settings);
      setAutoStatusSettings(updatedSettings);
      toast({
        title: 'Success',
        description: 'Auto status settings updated successfully'
      });
      return updatedSettings;
    } catch (error) {
      console.error('Error updating auto status settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update auto status settings',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [deliveryUserId]);

  useEffect(() => {
    loadAvailabilityData();
  }, [loadAvailabilityData]);

  return {
    // Data
    schedules,
    breakSettings,
    emergencyContacts,
    autoStatusSettings,
    currentBreakStatus,
    loading,
    isProcessing,

    // Methods
    loadAvailabilityData,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    createBreakSetting,
    startBreak,
    createEmergencyContact,
    updateAutoStatusSettings
  };
}

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  DeliveryUser,
  DeliveryVehicle,
  DeliveryDocument,
  DeliveryAvailability,
  DeliveryPaymentInfo,
} from '@/types/delivery';

const DELIVERY_ONBOARDING_STEPS = 5;

export function useDeliveryOnboarding() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completeSteps, setCompleteSteps] = useState<number[]>([]);

  const [deliveryUser, setDeliveryUser] = useState<DeliveryUser | null>(null);
  const [vehicle, setVehicle] = useState<DeliveryVehicle | null>(null);
  const [documents, setDocuments] = useState<DeliveryDocument[]>([]);
  const [availability, setAvailability] = useState<DeliveryAvailability[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<DeliveryPaymentInfo | null>(null);

  const fetchDeliveryProfile = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      // Fetch delivery user profile
      const { data: userProfile, error: userError } = await supabase
        .from('delivery_users')
        .select('*')
        .eq('delivery_users_user_id', userId)
        .single();

      if (userError) throw userError;
      setDeliveryUser(userProfile);

      // Fetch vehicle information
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('delivery_vehicles')
        .select('*')
        .eq('delivery_vehicles_user_id', userId)
        .single();

      if (vehicleError) throw vehicleError;
      setVehicle(vehicleData);

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('delivery_documents')
        .select('*')
        .eq('delivery_documents_user_id', userId);

      if (documentsError) throw documentsError;
      setDocuments(documentsData);

      // Fetch availability schedule
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('delivery_availability')
        .select('*')
        .eq('delivery_availability_user_id', userId);

      if (availabilityError) throw availabilityError;
      setAvailability(availabilityData);

      // Fetch payment information
      const { data: paymentData, error: paymentError } = await supabase
        .from('delivery_payment_info')
        .select('*')
        .eq('delivery_payment_info_user_id', userId)
        .single();

      if (paymentError) throw paymentError;
      setPaymentInfo(paymentData);

      // Determine completed steps
      const completed: number[] = [];
      if (userProfile) completed.push(1);
      if (vehicleData) completed.push(2);
      if (documentsData && documentsData.length > 0) completed.push(3);
      if (availabilityData && availabilityData.length > 0) completed.push(4);
      if (paymentData) completed.push(5);

      setCompleteSteps(completed);
      setCurrentStep(completed.length + 1);
    } catch (error: any) {
      console.error('Error fetching delivery profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load delivery profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchDeliveryProfile(user.id);
    }
  }, [user, fetchDeliveryProfile]);

  const savePersonalInfo = async (data: Omit<DeliveryUser, 'id' | 'created_at' | 'updated_at' | 'delivery_users_user_id'>): Promise<DeliveryUser | null> => {
    setLoading(true);
    try {
      if (!user) throw new Error("User not authenticated");

      const { data: updatedUser, error: userError } = await supabase
        .from('delivery_users')
        .upsert(
          {
            delivery_users_user_id: user.id,
            ...data,
          },
          { onConflict: 'delivery_users_user_id' }
        )
        .select('*')
        .single();

      if (userError) throw userError;

      setDeliveryUser(updatedUser);
      setCompleteSteps(prev => prev.includes(1) ? prev : [...prev, 1]);
      setCurrentStep(2);

      toast({
        title: "Success",
        description: "Personal information saved successfully!",
      });

      return updatedUser;
    } catch (error: any) {
      console.error('Error saving personal info:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save personal information",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveVehicleInformation = async (data: Omit<DeliveryVehicle, 'id' | 'created_at' | 'updated_at' | 'delivery_vehicles_user_id'>): Promise<DeliveryVehicle | null> => {
    setLoading(true);
    try {
      if (!user) throw new Error("User not authenticated");

      const { data: vehicleData, error: vehicleError } = await supabase
        .from('delivery_vehicles')
        .upsert(
          {
            delivery_vehicles_user_id: user.id,
            ...data,
          },
          { onConflict: 'delivery_vehicles_user_id' }
        )
        .select('*')
        .single();

      if (vehicleError) throw vehicleError;

      setVehicle(vehicleData);
      setCompleteSteps(prev => prev.includes(2) ? prev : [...prev, 2]);
      setCurrentStep(3);

      toast({
        title: "Success",
        description: "Vehicle information saved successfully!",
      });

      return vehicleData;
    } catch (error: any) {
      console.error('Error saving vehicle information:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save vehicle information",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, type: DeliveryDocument['type']): Promise<DeliveryDocument | null> => {
    setLoading(true);
    try {
      if (!user) throw new Error("User not authenticated");

      const filePath = `delivery-documents/${user.id}/${type}-${Date.now()}.${file.name.split('.').pop()}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('delivery-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storageData.Key}`;

      const { data: documentData, error: documentError } = await supabase
        .from('delivery_documents')
        .insert({
          delivery_documents_user_id: user.id,
          type: type,
          url: publicURL,
        })
        .select('*')
        .single();

      if (documentError) throw documentError;

      setDocuments(prev => [...prev, documentData]);

      toast({
        title: "Success",
        description: `Document uploaded successfully!`,
      });

      return documentData;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const completeDocumentsStep = async (): Promise<void> => {
    setLoading(true);
    try {
      setCompleteSteps(prev => prev.includes(3) ? prev : [...prev, 3]);
      setCurrentStep(4);

      toast({
        title: "Success",
        description: "Documents uploaded successfully!",
      });
    } catch (error: any) {
      console.error('Error completing documents step:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete documents step",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAvailabilitySchedule = async (schedule: Omit<DeliveryAvailability, 'id' | 'created_at' | 'updated_at' | 'delivery_availability_user_id'>[]): Promise<void> => {
    setLoading(true);
    try {
      if (!user) throw new Error("User not authenticated");

      // Delete existing availability entries
      const { error: deleteError } = await supabase
        .from('delivery_availability')
        .delete()
        .eq('delivery_availability_user_id', user.id);

      if (deleteError) throw deleteError;

      // Insert new availability entries
      const scheduleWithUserId = schedule.map(item => ({
        ...item,
        delivery_availability_user_id: user.id,
      }));

      const { error: insertError } = await supabase
        .from('delivery_availability')
        .insert(scheduleWithUserId);

      if (insertError) throw insertError;

      setAvailability(scheduleWithUserId);
      setCompleteSteps(prev => prev.includes(4) ? prev : [...prev, 4]);
      setCurrentStep(5);

      toast({
        title: "Success",
        description: "Availability schedule saved successfully!",
      });
    } catch (error: any) {
      console.error('Error saving availability schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save availability schedule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePaymentInfo = async (data: Omit<DeliveryPaymentInfo, 'id' | 'created_at' | 'updated_at' | 'delivery_payment_info_user_id'>): Promise<void> => {
    setLoading(true);
    try {
      if (!user) throw new Error("User not authenticated");

      const { data: paymentData, error: paymentError } = await supabase
        .from('delivery_payment_info')
        .upsert(
          {
            delivery_payment_info_user_id: user.id,
            ...data,
          },
          { onConflict: 'delivery_payment_info_user_id' }
        )
        .select('*')
        .single();

      if (paymentError) throw paymentError;

      setPaymentInfo(paymentData);
      setCompleteSteps(prev => prev.includes(5) ? prev : [...prev, 5]);
      setCurrentStep(6);

      toast({
        title: "Success",
        description: "Payment information saved successfully!",
      });
    } catch (error: any) {
      console.error('Error saving payment info:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save payment information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    currentStep,
    deliveryUser,
    vehicle,
    documents,
    availability,
    paymentInfo,
    completeSteps,
    savePersonalInfo,
    saveVehicleInformation,
    uploadDocument,
    completeDocumentsStep,
    saveAvailabilitySchedule,
    savePaymentInfo,
  };
}

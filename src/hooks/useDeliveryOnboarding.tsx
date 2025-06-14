import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DeliveryUser, DeliveryVehicle, DeliveryDocument } from '@/types/delivery';
import { useToast } from '@/hooks/use-toast';

interface OnboardingState {
  currentStep: number;
  completeSteps: number[];
}

export const useDeliveryOnboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [deliveryUser, setDeliveryUser] = useState<DeliveryUser | null>(null);
  const [vehicle, setVehicle] = useState<DeliveryVehicle | null>(null);
  const [documents, setDocuments] = useState<DeliveryDocument[]>([]);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    currentStep: 1,
    completeSteps: [],
  });

  useEffect(() => {
    if (user) {
      loadOnboardingData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadOnboardingData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Fetch delivery user profile
      const { data: userData, error: userError } = await supabase
        .from('delivery_users')
        .select('*')
        .eq('delivery_users_user_id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      if (userData) {
        // Map API object to DeliveryUser shape
        const deliveryUser: DeliveryUser = {
          id: userData.id,
          delivery_users_user_id: userData.delivery_users_user_id,
          full_name: userData.first_name + ' ' + userData.last_name,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          vehicle_type: '', // Will be filled from vehicle data
          license_plate: '',
          driver_license_number: '',
          status: userData.status as "active" | "inactive" | "suspended" | "on_break",
          rating: userData.average_rating ?? 0,
          total_deliveries: userData.total_deliveries,
          verification_status: 'pending', // default/fetch as needed
          background_check_status: 'pending', // default/fetch as needed
          is_available: true, // default/fetch as needed
          is_approved: userData.is_approved,
          last_active: userData.updated_at,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
        };
        
        setDeliveryUser(deliveryUser);
        
        // Fetch vehicle information
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('delivery_vehicles')
          .select('*')
          .eq('delivery_vehicles_user_id', user.id)
          .maybeSingle();

        if (vehicleError) throw vehicleError;
        setVehicle(vehicleData);

        // Fetch documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('delivery_documents')
          .select('*')
          .eq('delivery_documents_user_id', user.id);

        if (documentsError) throw documentsError;
        setDocuments(documentsData || []);

        // Determine current step based on data
        determineCurrentStep(deliveryUser, vehicleData, documentsData);
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your profile data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const determineCurrentStep = (
    user: DeliveryUser | null,
    vehicle: DeliveryVehicle | null,
    documents: DeliveryDocument[] | null
  ) => {
    const completeSteps: number[] = [];
    let currentStep = 1;

    // Step 1: Personal Info
    if (user) {
      completeSteps.push(1);
      currentStep = 2;
    }

    // Step 2: Vehicle Info
    if (vehicle) {
      completeSteps.push(2);
      currentStep = 3;
    }

    // Step 3: Documents
    if (documents && documents.length > 0) {
      const requiredDocTypes = vehicle?.type === 'on_foot' || vehicle?.type === 'bicycle'
        ? ['profile_photo', 'identity']
        : ['profile_photo', 'identity', 'drivers_license', 'vehicle_registration'];
      
      const hasAllRequired = requiredDocTypes.every(type => 
        documents.some(doc => doc.document_type === type)
      );
      
      if (hasAllRequired) {
        completeSteps.push(3);
        currentStep = 4;
      }
    }

    // Step 4: Availability
    // Check if availability records exist
    // This is a placeholder - implement actual check based on your schema
    const hasAvailability = false; // Replace with actual check
    if (hasAvailability) {
      completeSteps.push(4);
      currentStep = 5;
    }

    // Step 5: Payment Details
    // Check if payment details exist
    // This is a placeholder - implement actual check based on your schema
    const hasPaymentDetails = false; // Replace with actual check
    if (hasPaymentDetails) {
      completeSteps.push(5);
      currentStep = 6;
    }

    setOnboardingState({
      currentStep,
      completeSteps,
    });
  };

  const savePersonalInfo = async (data: Partial<DeliveryUser>) => {
    if (!user?.id) return null;
    
    setLoading(true);
    try {
      const { first_name, last_name, phone } = data;
      
      const payload = {
        delivery_users_user_id: user.id,
        first_name,
        last_name,
        phone,
        status: 'inactive' as const,
        updated_at: new Date().toISOString(),
      };

      let result;
      
      if (deliveryUser?.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('delivery_users')
          .update(payload)
          .eq('id', deliveryUser.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('delivery_users')
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
            average_rating: 0,
            total_deliveries: 0,
            is_approved: false,
          })
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }

      // Map API object to DeliveryUser shape
      const updatedDeliveryUser: DeliveryUser = {
        id: result.id,
        delivery_users_user_id: result.delivery_users_user_id,
        full_name: result.first_name + ' ' + result.last_name,
        first_name: result.first_name,
        last_name: result.last_name,
        phone: result.phone,
        vehicle_type: '', // Will be filled from vehicle data
        license_plate: '',
        driver_license_number: '',
        status: result.status as "active" | "inactive" | "suspended" | "on_break",
        rating: result.average_rating ?? 0,
        total_deliveries: result.total_deliveries,
        verification_status: 'pending', // default/fetch as needed
        background_check_status: 'pending', // default/fetch as needed
        is_available: true, // default/fetch as needed
        is_approved: result.is_approved,
        last_active: result.updated_at,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };
      
      setDeliveryUser(updatedDeliveryUser);
      
      // Update onboarding state
      setOnboardingState(prev => ({
        currentStep: 2,
        completeSteps: [...new Set([...prev.completeSteps, 1])],
      }));
      
      toast({
        title: 'Success',
        description: 'Personal information saved successfully',
      });
      
      return updatedDeliveryUser;
    } catch (error) {
      console.error('Error saving personal info:', error);
      toast({
        title: 'Error',
        description: 'Failed to save personal information',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveVehicleInformation = async (data: Partial<DeliveryVehicle>) => {
    if (!user?.id) return null;
    
    setLoading(true);
    try {
      const payload = {
        delivery_vehicles_user_id: user.id,
        ...data,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      let result;
      
      if (vehicle?.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('delivery_vehicles')
          .update(payload)
          .eq('id', vehicle.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('delivery_vehicles')
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }

      setVehicle(result);
      
      // Update onboarding state
      setOnboardingState(prev => ({
        currentStep: 3,
        completeSteps: [...new Set([...prev.completeSteps, 2])],
      }));
      
      toast({
        title: 'Success',
        description: 'Vehicle information saved successfully',
      });
      
      return result;
    } catch (error) {
      console.error('Error saving vehicle info:', error);
      toast({
        title: 'Error',
        description: 'Failed to save vehicle information',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    documentType: DeliveryDocument['document_type'],
    file: File
  ) => {
    if (!user?.id) return null;
    
    setLoading(true);
    try {
      // Upload file to storage
      const fileName = `${user.id}/${documentType}_${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('delivery_documents')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('delivery_documents')
        .getPublicUrl(fileName);
        
      const documentUrl = urlData.publicUrl;
      
      // Save document reference to database
      const { data, error } = await supabase
        .from('delivery_documents')
        .insert({
          delivery_documents_user_id: user.id,
          document_type: documentType,
          document_url: documentUrl,
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Update documents state
      setDocuments(prev => [...prev, data]);
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
      
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const completeDocumentsStep = () => {
    // Check if all required documents are uploaded
    const requiredDocTypes = vehicle?.type === 'on_foot' || vehicle?.type === 'bicycle'
      ? ['profile_photo', 'identity']
      : ['profile_photo', 'identity', 'drivers_license', 'vehicle_registration'];
    
    const hasAllRequired = requiredDocTypes.every(type => 
      documents.some(doc => doc.document_type === type)
    );
    
    if (hasAllRequired) {
      setOnboardingState(prev => ({
        currentStep: 4,
        completeSteps: [...new Set([...prev.completeSteps, 3])],
      }));
      
      toast({
        title: 'Success',
        description: 'All required documents uploaded',
      });
      
      return true;
    } else {
      toast({
        title: 'Missing Documents',
        description: 'Please upload all required documents',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  const saveAvailabilitySchedule = async (availabilityData: any) => {
    if (!user?.id) return false;
    
    setLoading(true);
    try {
      // Save availability data to database
      // This is a placeholder - implement based on your schema
      
      // Update onboarding state
      setOnboardingState(prev => ({
        currentStep: 5,
        completeSteps: [...new Set([...prev.completeSteps, 4])],
      }));
      
      toast({
        title: 'Success',
        description: 'Availability schedule saved successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to save availability schedule',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const savePaymentInfo = async (paymentData: any) => {
    if (!user?.id) return false;
    
    setLoading(true);
    try {
      // Save payment info to database
      // This is a placeholder - implement based on your schema
      
      // Update onboarding state
      setOnboardingState(prev => ({
        currentStep: 6,
        completeSteps: [...new Set([...prev.completeSteps, 5])],
      }));
      
      toast({
        title: 'Success',
        description: 'Payment information saved successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving payment info:', error);
      toast({
        title: 'Error',
        description: 'Failed to save payment information',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    currentStep: onboardingState.currentStep,
    completeSteps: onboardingState.completeSteps,
    deliveryUser,
    vehicle,
    documents,
    savePersonalInfo,
    saveVehicleInformation,
    uploadDocument,
    completeDocumentsStep,
    saveAvailabilitySchedule,
    savePaymentInfo,
  };
};

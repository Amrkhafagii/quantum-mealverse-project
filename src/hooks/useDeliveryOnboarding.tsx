import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DeliveryUser, DeliveryVehicle, DeliveryDocument } from "@/types/delivery";
import { useAuth } from "./useAuth";

export const useDeliveryOnboarding = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryUser, setDeliveryUser] = useState<DeliveryUser | null>(null);
  const [vehicle, setVehicle] = useState<DeliveryVehicle | null>(null);
  const [documents, setDocuments] = useState<DeliveryDocument[]>([]);
  const [completeSteps, setCompleteSteps] = useState<number[]>([]);

  useEffect(() => {
    if (user) {
      fetchDeliveryUser(user.id);
      fetchDeliveryVehicle(user.id);
      fetchDeliveryDocuments(user.id);
    }
  }, [user]);

  // 👇 Place these type definitions at the top or import them:
  type RawDeliveryUser = {
    id: string;
    delivery_users_user_id: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone?: string;
    vehicle_type?: string;
    type?: string;
    license_plate?: string;
    driver_license_number?: string;
    status?: string;
    average_rating?: number;
    total_deliveries?: number;
    verification_status?: string;
    background_check_status?: string;
    is_available?: boolean;
    is_approved?: boolean;
    last_active?: string;
    created_at?: string;
    updated_at?: string;
  };

  type RawDeliveryDocument = {
    id: string;
    delivery_documents_user_id?: string;
    delivery_user_id?: string;
    document_type: string;
    file_path?: string;
    verified?: boolean;
    verification_status?: string;
    expiry_date?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
  };

  type RawDeliveryVehicle = {
    id: string;
    delivery_vehicles_user_id?: string;
    delivery_user_id?: string;
    type?: string;
    vehicle_type?: string;
    color?: string;
    license_plate?: string;
    insurance_number?: string;
    insurance_expiry?: string;
    make?: string;
    model?: string;
    year?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  };

  function mapToDeliveryUser(data: RawDeliveryUser): DeliveryUser {
    return {
      id: data.id || '',
      delivery_users_user_id: data.delivery_users_user_id || '',
      full_name: data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      phone: data.phone || '',
      vehicle_type: data.vehicle_type || data.type || '',
      license_plate: data.license_plate || '',
      driver_license_number: data.driver_license_number || '',
      status: data.status || 'inactive',
      average_rating: typeof data.average_rating === 'number' ? data.average_rating : 0,
      total_deliveries: typeof data.total_deliveries === 'number' ? data.total_deliveries : 0,
      verification_status: data.verification_status || 'pending',
      background_check_status: data.background_check_status || 'pending',
      is_available: !!data.is_available,
      is_approved: !!data.is_approved,
      last_active: data.last_active || '',
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
    };
  }

  function mapToDeliveryDocument(data: RawDeliveryDocument): DeliveryDocument {
    return {
      id: data.id || '',
      delivery_documents_user_id: data.delivery_documents_user_id || data.delivery_user_id || '',
      document_type: data.document_type || '',
      document_url: data.file_path || '', // single field, always mapped from file_path
      verification_status: data.verification_status || (data.verified === true ? "approved" : "pending"),
      expiry_date: data.expiry_date || '',
      notes: data.notes || '',
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
    };
  }

  function mapToDeliveryVehicle(data: RawDeliveryVehicle): DeliveryVehicle {
    return {
      id: data.id || '',
      delivery_vehicles_user_id: data.delivery_vehicles_user_id || data.delivery_user_id || '',
      vehicle_type: data.vehicle_type || data.type || '',
      color: data.color || '',
      license_plate: data.license_plate || '',
      insurance_number: data.insurance_number || '',
      insurance_expiry: data.insurance_expiry || '',
      make: data.make || '',
      model: data.model || '',
      year: typeof data.year === 'number' ? data.year : undefined,
      is_active: !!data.is_active,
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
    };
  }

  // When fetching a delivery user:
  const fetchDeliveryUser = async (id: string) => {
    const { data } = await supabase.from("delivery_users").select("*").eq("delivery_users_user_id", id).single();
    if (data) {
      setDeliveryUser(mapToDeliveryUser(data));
    }
  };

  // When fetching a delivery vehicle:
  const fetchDeliveryVehicle = async (id: string) => {
    const { data } = await supabase.from("delivery_vehicles").select("*").eq("delivery_vehicles_user_id", id).single();
    if (data) {
      setVehicle(mapToDeliveryVehicle(data));
    }
  };

  // When fetching delivery documents (array):
  const fetchDeliveryDocuments = async (id: string) => {
    const { data } = await supabase.from("delivery_documents").select("*").eq("delivery_documents_user_id", id);
    if (Array.isArray(data)) {
      setDocuments(data.map(mapToDeliveryDocument));
    }
  };

  const savePersonalInfo = async (values: any) => {
    setLoading(true);
    try {
      const { data: existingUser } = await supabase
        .from('delivery_users')
        .select('*')
        .eq('delivery_users_user_id', user?.id)
        .single();
  
      if (existingUser) {
        // Update existing user
        const { data, error } = await supabase
          .from('delivery_users')
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq('delivery_users_user_id', user?.id)
          .select()
          .single();
  
        if (error) {
          console.error("Error updating delivery user:", error);
          return;
        }
  
        setDeliveryUser(data as DeliveryUser);
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('delivery_users')
          .insert([
            {
              ...values,
              delivery_users_user_id: user?.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();
  
        if (error) {
          console.error("Error creating delivery user:", error);
          return;
        }
  
        setDeliveryUser(data as DeliveryUser);
      }
      setCompleteSteps([...completeSteps, 1]);
      setCurrentStep(2);
    } catch (error) {
      console.error("Error saving personal info:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveVehicleInformation = async (values: any) => {
    setLoading(true);
    try {
      const { data: existingVehicle } = await supabase
        .from('delivery_vehicles')
        .select('*')
        .eq('delivery_vehicles_user_id', user?.id)
        .single();
  
      if (existingVehicle) {
        // Update existing vehicle
        const { data, error } = await supabase
          .from('delivery_vehicles')
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq('delivery_vehicles_user_id', user?.id)
          .select()
          .single();
  
        if (error) {
          console.error("Error updating delivery vehicle:", error);
          return;
        }
  
        setVehicle(data as DeliveryVehicle);
      } else {
        // Create new vehicle
        const { data, error } = await supabase
          .from('delivery_vehicles')
          .insert([
            {
              ...values,
              delivery_vehicles_user_id: user?.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();
  
        if (error) {
          console.error("Error creating delivery vehicle:", error);
          return;
        }
  
        setVehicle(data as DeliveryVehicle);
      }
      setCompleteSteps([...completeSteps, 2]);
      setCurrentStep(3);
    } catch (error) {
      console.error("Error saving vehicle information:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (documentType: string, file: File) => {
    setLoading(true);
    try {
      const filePath = `delivery_documents/${user?.id}/${documentType}_${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from('delivery_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
  
      if (uploadError) {
        console.error("Error uploading document:", uploadError);
        return;
      }
  
      const { data: fileData } = supabase.storage
        .from('delivery_documents')
        .getPublicUrl(filePath);
  
      const { error: dbError } = await supabase
        .from('delivery_documents')
        .insert([
          {
            delivery_documents_user_id: user?.id,
            document_type: documentType,
            document_url: fileData.publicUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
  
      if (dbError) {
        console.error("Error saving document to database:", dbError);
        return;
      }
  
      fetchDeliveryDocuments(user?.id || '');
    } catch (error) {
      console.error("Error uploading document:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeDocumentsStep = () => {
    setCompleteSteps([...completeSteps, 3]);
    setCurrentStep(4);
  };

  const saveAvailabilitySchedule = async (schedule: any) => {
    setLoading(true);
    try {
      // Save availability schedule to database
      setCompleteSteps([...completeSteps, 4]);
      setCurrentStep(5);
    } catch (error) {
      console.error("Error saving availability schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePaymentInfo = async (paymentInfo: any) => {
    setLoading(true);
    try {
      // Save payment information to database
      setCompleteSteps([...completeSteps, 5]);
      setCurrentStep(6);
    } catch (error) {
      console.error("Error saving payment information:", error);
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
    completeSteps,
    savePersonalInfo,
    saveVehicleInformation,
    uploadDocument,
    completeDocumentsStep,
    saveAvailabilitySchedule,
    savePaymentInfo,
  };
};

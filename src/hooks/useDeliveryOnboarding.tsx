import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  DeliveryUser,
  DeliveryVehicle,
  DeliveryDocument,
  DeliveryAvailability,
  DeliveryPaymentDetails,
} from '@/types/delivery';

// TYPE VALIDATION UTILS - Simplify and cast raw Supabase strings to your strict union types

const VALID_STATUSES = ['inactive', 'active', 'suspended', 'on_break'] as const;
type ValidStatus = typeof VALID_STATUSES[number];
function toValidStatus(value: string): ValidStatus {
  return (VALID_STATUSES.includes(value as ValidStatus) ? value : 'inactive') as ValidStatus;
}

const DOC_VERIFICATION_STATUSES = ['pending', 'verified', 'rejected'] as const;
type DocVerificationStatus = typeof DOC_VERIFICATION_STATUSES[number];
function toVerificationStatus(value: string): DocVerificationStatus {
  return (DOC_VERIFICATION_STATUSES.includes(value as DocVerificationStatus) ? value : 'pending') as DocVerificationStatus;
}

const DOC_APPROVAL_STATUSES = ['pending', 'rejected', 'approved'] as const;
type DocApprovalStatus = typeof DOC_APPROVAL_STATUSES[number];
function toApprovalStatus(value: string): DocApprovalStatus {
  return (DOC_APPROVAL_STATUSES.includes(value as DocApprovalStatus) ? value : 'pending') as DocApprovalStatus;
}

const VEHICLE_TYPES = ['bicycle','car','motorcycle','scooter','on_foot'] as const;
type VehicleType = typeof VEHICLE_TYPES[number];
function toVehicleType(value: string): VehicleType {
  return (VEHICLE_TYPES.includes(value as VehicleType) ? value : 'bicycle') as VehicleType;
}

const DOCUMENT_TYPES = [
  'license','insurance','registration','background_check','profile_photo',
  'drivers_license','vehicle_registration','identity'
] as const;
type DocumentType = typeof DOCUMENT_TYPES[number];
function toDocumentType(value: string): DocumentType {
  return (DOCUMENT_TYPES.includes(value as DocumentType) ? value : 'license') as DocumentType;
}

// EXAMPLE MAPPING USAGE
// When receiving data from Supabase (which is plain strings), always cast using these functions:
// status: toValidStatus(row.status)
// document_type: toDocumentType(row.document_type)
// verification_status: toVerificationStatus(row.verification_status)
// approval_status: toApprovalStatus(row.approval_status)
// type: toVehicleType(row.type)

// PAYLOAD CLEANING FOR UPSERT/INSERT

function buildVehiclePayload(obj: any) {
  // Only include exact allowed fields, remove 'is_active' and any others
  const {
    color, created_at, delivery_user_id, id, insurance_expiry, insurance_number,
    license_plate, make, model, type, updated_at, year
  } = obj;
  return {
    color,
    created_at,
    delivery_user_id,
    id,
    insurance_expiry,
    insurance_number,
    license_plate,
    make,
    model,
    type,
    updated_at,
    year,
  };
}

function buildDocumentPayload(obj: any) {
  // Only include exact allowed fields, remove extraneous keys
  const {
    created_at, delivery_user_id, document_type, expiry_date, file_path, id,
    notes, updated_at, verified
  } = obj;
  return {
    created_at, delivery_user_id, document_type, expiry_date, file_path, id,
    notes, updated_at, verified,
  };
}

export const useDeliveryOnboarding = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completeSteps, setCompleteSteps] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });
  const [deliveryUser, setDeliveryUser] = useState<DeliveryUser | null>(null);
  const [vehicle, setVehicle] = useState<DeliveryVehicle | null>(null);
  const [documents, setDocuments] = useState<DeliveryDocument[]>([]);
  const [availability, setAvailability] = useState<DeliveryAvailability | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<DeliveryPaymentDetails | null>(null);

  const fetchDeliveryUser = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: existingUser, error: userError } = await supabase
        .from('delivery_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching delivery user:', userError);
      }

      if (existingUser) {
        setDeliveryUser(existingUser);
        setCompleteSteps(prev => ({ ...prev, 1: true }));
        return existingUser;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching delivery user:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchVehicleInformation = useCallback(async (deliveryUserId: string) => {
    setLoading(true);
    try {
      const { data: existingVehicle, error: vehicleError } = await supabase
        .from('delivery_vehicles')
        .select('*')
        .eq('delivery_user_id', deliveryUserId)
        .single();

      if (vehicleError) {
        console.error('Error fetching vehicle information:', vehicleError);
      }

      if (existingVehicle) {
        setVehicle(existingVehicle);
        setCompleteSteps(prev => ({ ...prev, 2: true }));
      }
    } catch (error) {
      console.error('Error fetching vehicle information:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDocuments = useCallback(async (deliveryUserId: string) => {
    setLoading(true);
    try {
      const { data: existingDocuments, error: documentsError } = await supabase
        .from('delivery_documents')
        .select('*')
        .eq('delivery_user_id', deliveryUserId);

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
      }

      if (existingDocuments) {
        setDocuments(existingDocuments);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailability = useCallback(async (deliveryUserId: string) => {
    setLoading(true);
    try {
      const { data: existingAvailability, error: availabilityError } = await supabase
        .from('delivery_availability')
        .select('*')
        .eq('delivery_user_id', deliveryUserId)
        .single();

      if (availabilityError) {
        console.error('Error fetching availability:', availabilityError);
      }

      if (existingAvailability) {
        setAvailability(existingAvailability);
        setCompleteSteps(prev => ({ ...prev, 4: true }));
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaymentDetails = useCallback(async (deliveryUserId: string) => {
    setLoading(true);
    try {
      const { data: existingPaymentDetails, error: paymentError } = await supabase
        .from('delivery_payment_details')
        .select('*')
        .eq('delivery_user_id', deliveryUserId)
        .single();

      if (paymentError) {
        console.error('Error fetching payment details:', paymentError);
      }

      if (existingPaymentDetails) {
        setPaymentDetails(existingPaymentDetails);
        setCompleteSteps(prev => ({ ...prev, 5: true }));
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDeliveryUser().then(existingUser => {
        if (existingUser) {
          fetchVehicleInformation(existingUser.id);
          fetchDocuments(existingUser.id);
          fetchAvailability(existingUser.id);
          fetchPaymentDetails(existingUser.id);
        }
      });
    }
  }, [user, fetchDeliveryUser, fetchVehicleInformation, fetchDocuments, fetchAvailability, fetchPaymentDetails]);

  const savePersonalInfo = async (data: DeliveryUser) => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('delivery_users')
        .upsert({
          id: deliveryUser?.id || undefined,
          user_id: user.id,
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          address: data.address,
          city: data.city,
          region: data.region,
          postal_code: data.postal_code,
          country: data.country,
          status: data.status || 'inactive',
        }, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      await fetchDeliveryUser();
      setCurrentStep(2);
      setCompleteSteps(prev => ({ ...prev, 1: true }));
    } catch (error) {
      console.error('Error saving personal info:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveVehicleInformation = async (data: DeliveryVehicle) => {
    if (!deliveryUser) return;
    setLoading(true);
    try {
      const vehicleData = buildVehiclePayload({
        ...data,
        delivery_user_id: deliveryUser.id,
      });

      const { error } = await supabase
        .from('delivery_vehicles')
        .upsert(vehicleData, { onConflict: 'delivery_user_id' });

      if (error) {
        throw error;
      }

      await fetchVehicleInformation(deliveryUser.id);
      setCurrentStep(3);
      setCompleteSteps(prev => ({ ...prev, 2: true }));
    } catch (error) {
      console.error('Error saving vehicle information:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    file: File,
    documentType: DocumentType,
    expiryDate?: Date,
    notes?: string
  ): Promise<DeliveryDocument> => {
    if (!deliveryUser) throw new Error('Delivery user not found');
    setLoading(true);
    try {
      const filePath = `delivery_documents/${deliveryUser.id}/${documentType}/${file.name}`;
      const { error: storageError } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        throw storageError;
      }

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${filePath}`;

      const documentData = buildDocumentPayload({
        delivery_user_id: deliveryUser.id,
        document_type: documentType,
        file_path: url,
        expiry_date: expiryDate?.toISOString(),
        notes: notes,
      });

      const { data, error } = await supabase
        .from('delivery_documents')
        .upsert(documentData)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No document data returned from upsert');
      }

      await fetchDocuments(deliveryUser.id);
      return data as DeliveryDocument;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeDocumentsStep = async () => {
    setCurrentStep(4);
    setCompleteSteps(prev => ({ ...prev, 3: true }));
  };

  const saveAvailabilitySchedule = async (schedule: Record<number, boolean>) => {
    if (!deliveryUser) return;
    setLoading(true);
    try {
      const availabilityData: number[] = Object.keys(schedule)
        .filter(key => schedule[parseInt(key)])
        .map(Number);

      const { error } = await supabase
        .from('delivery_availability')
        .upsert({
          delivery_user_id: deliveryUser.id,
          monday: availabilityData.includes(1),
          tuesday: availabilityData.includes(2),
          wednesday: availabilityData.includes(3),
          thursday: availabilityData.includes(4),
          friday: availabilityData.includes(5),
          saturday: availabilityData.includes(6),
          sunday: availabilityData.includes(7),
        }, { onConflict: 'delivery_user_id' });

      if (error) {
        throw error;
      }

      await fetchAvailability(deliveryUser.id);
      setCurrentStep(5);
      setCompleteSteps(prev => ({ ...prev, 4: true }));
    } catch (error) {
      console.error('Error saving availability schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePaymentInfo = async (paymentData: any): Promise<DeliveryPaymentDetails> => {
    if (!deliveryUser) throw new Error('Delivery user not found');
    setLoading(true);
    try {
      const { error } = await supabase
        .from('delivery_payment_details')
        .upsert({
          delivery_user_id: deliveryUser.id,
          account_number: paymentData.account_number,
          routing_number: paymentData.routing_number,
          bank_name: paymentData.bank_name,
          account_name: paymentData.account_name,
          has_accepted_terms: paymentData.has_accepted_terms,
        }, { onConflict: 'delivery_user_id' });

      if (error) {
        throw error;
      }

      await fetchPaymentDetails(deliveryUser.id);
      setCurrentStep(6);
      setCompleteSteps(prev => ({ ...prev, 5: true }));

      return {
        delivery_user_id: deliveryUser.id,
        account_number: paymentData.account_number,
        routing_number: paymentData.routing_number,
        bank_name: paymentData.bank_name,
        account_name: paymentData.account_name,
        has_accepted_terms: paymentData.has_accepted_terms,
      } as DeliveryPaymentDetails;
    } catch (error) {
      console.error('Error saving payment information:', error);
      throw error;
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
    paymentDetails,
    completeSteps,
    savePersonalInfo,
    saveVehicleInformation,
    uploadDocument,
    completeDocumentsStep,
    saveAvailabilitySchedule,
    savePaymentInfo,
  };
};

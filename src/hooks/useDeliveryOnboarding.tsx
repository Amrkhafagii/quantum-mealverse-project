import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DeliveryUser, DeliveryVehicle, DeliveryDocument, DeliveryPaymentDetails } from '@/types/delivery';
import { useToast } from '@/components/ui/use-toast';

export const useDeliveryOnboarding = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryUser, setDeliveryUser] = useState<DeliveryUser | null>(null);
  const [vehicle, setVehicle] = useState<DeliveryVehicle | null>(null);
  const [documents, setDocuments] = useState<DeliveryDocument[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<DeliveryPaymentDetails | null>(null);
  const [availability, setAvailability] = useState<any>(null); // TODO: Define type
  const [completeSteps, setCompleteSteps] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch Delivery User
        const { data: deliveryUserData, error: deliveryUserError } = await supabase
          .from('delivery_users')
          .select('*')
          .eq('delivery_users_user_id', user.id)
          .single();

        if (deliveryUserError) {
          console.error('Error fetching delivery user:', deliveryUserError);
        }

        if (deliveryUserData) {
          setDeliveryUser({
            ...deliveryUserData,
            full_name: deliveryUserData.full_name ?? "",
            vehicle_type: deliveryUserData.vehicle_type ?? "",
            license_plate: deliveryUserData.license_plate ?? "",
            driver_license_number: deliveryUserData.driver_license_number ?? "",
            status: deliveryUserData.status ?? "inactive",
            rating: deliveryUserData.rating ?? 0,
            total_deliveries: deliveryUserData.total_deliveries ?? 0,
            verification_status: deliveryUserData.verification_status ?? "pending",
            background_check_status: deliveryUserData.background_check_status ?? "pending",
            is_available: deliveryUserData.is_available ?? false,
            last_active: deliveryUserData.last_active ?? "",
            delivery_users_user_id: deliveryUserData.delivery_users_user_id ?? user.id,
            created_at: deliveryUserData.created_at ?? new Date().toISOString(),
            updated_at: deliveryUserData.updated_at ?? new Date().toISOString(),
            id: deliveryUserData.id ?? ""
          });
          if (!completeSteps.includes(1)) {
            setCompleteSteps([...completeSteps, 1]);
          }
        }

        // Fetch Vehicle Information
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('delivery_vehicles')
          .select('*')
          .eq('delivery_vehicles_user_id', user.id)
          .single();

        if (vehicleError) {
          console.error('Error fetching vehicle:', vehicleError);
        }

        if (vehicleData) {
          setVehicle({
            ...vehicleData,
            delivery_vehicles_user_id: vehicleData.delivery_vehicles_user_id ?? user.id,
            vehicle_type: vehicleData.vehicle_type ?? "",
            is_active: vehicleData.is_active ?? true,
            make: vehicleData.make ?? "",
            model: vehicleData.model ?? "",
            year: vehicleData.year ?? 2020,
            color: vehicleData.color ?? "",
            license_plate: vehicleData.license_plate ?? "",
            insurance_number: vehicleData.insurance_number ?? "",
            insurance_expiry: vehicleData.insurance_expiry ?? "",
            created_at: vehicleData.created_at ?? new Date().toISOString(),
            updated_at: vehicleData.updated_at ?? new Date().toISOString(),
            id: vehicleData.id ?? ""
          });
          if (!completeSteps.includes(2)) {
            setCompleteSteps([...completeSteps, 2]);
          }
        }

        // Fetch Documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('delivery_documents')
          .select('*')
          .eq('delivery_documents_user_id', user.id);

        if (documentsError) {
          console.error('Error fetching documents:', documentsError);
        }

        if (documentsData) {
          setDocuments(documentsData.map(doc => ({
            ...doc,
            delivery_documents_user_id: doc.delivery_documents_user_id ?? user.id,
            document_url: doc.document_url ?? doc.file_path ?? "",
            verification_status: doc.verification_status ?? (typeof doc.verified === "boolean" ? (doc.verified ? "verified" : "unverified") : "pending"),
            document_type: doc.document_type ?? "",
            expiry_date: doc.expiry_date ?? "",
            notes: doc.notes ?? "",
            created_at: doc.created_at ?? new Date().toISOString(),
            updated_at: doc.updated_at ?? new Date().toISOString(),
            id: doc.id ?? ""
          })));
          if (!completeSteps.includes(3)) {
            setCompleteSteps([...completeSteps, 3]);
          }
        }

        // Fetch Payment Details
        const { data: paymentData, error: paymentError } = await supabase
          .from('delivery_payment_details')
          .select('*')
          .eq('delivery_payment_details_user_id', user.id)
          .single();

        if (paymentError) {
          console.error('Error fetching payment details:', paymentError);
        }

        if (paymentData) {
          setPaymentDetails({
            ...paymentData,
            delivery_payment_details_user_id: paymentData.delivery_payment_details_user_id ?? user.id,
            account_holder_name: paymentData.account_holder_name ?? paymentData.account_name ?? "",
            account_type: paymentData.account_type ?? "checking",
            is_verified: paymentData.is_verified ?? false,
            id: paymentData.id ?? "",
            account_number: paymentData.account_number ?? "",
            routing_number: paymentData.routing_number ?? "",
            bank_name: paymentData.bank_name ?? "",
            created_at: paymentData.created_at ?? new Date().toISOString(),
            updated_at: paymentData.updated_at ?? new Date().toISOString(),
            has_accepted_terms: paymentData.has_accepted_terms ?? false,
          });
          if (!completeSteps.includes(5)) {
            setCompleteSteps([...completeSteps, 5]);
          }
        }

        // TODO: Fetch Availability
        if (!completeSteps.includes(4)) {
          // setCompleteSteps([...completeSteps, 4]);
        }

        // Determine current step
        if (deliveryUserData && vehicleData && documentsData && paymentData) {
          setCurrentStep(6); // Complete
        } else if (deliveryUserData && vehicleData && documentsData) {
          setCurrentStep(5); // Payment Details
        } else if (deliveryUserData && vehicleData) {
          setCurrentStep(3); // Documents
        } else if (deliveryUserData) {
          setCurrentStep(2); // Vehicle Info
        } else {
          setCurrentStep(1); // Personal Info
        }
      } catch (error) {
        console.error('Error during onboarding data fetch:', error);
        toast({
          title: "Error",
          description: "Failed to load onboarding data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOnboardingData();
    }
  }, [user]);

  const savePersonalInfo = async (data: { first_name: string; last_name: string; phone: string }) => {
    setLoading(true);
    try {
      // Check if delivery user exists
      const { data: existingUser, error: existingUserError } = await supabase
        .from('delivery_users')
        .select('*')
        .eq('delivery_users_user_id', user!.id)
        .single();

      if (existingUserError && existingUserError.code !== 'PGRST116') {
        throw existingUserError;
      }

      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error: updateUserError } = await supabase
          .from('delivery_users')
          .update({
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            updated_at: new Date().toISOString()
          })
          .eq('delivery_users_user_id', user!.id)
          .select()
          .single();

        if (updateUserError) {
          throw updateUserError;
        }

        setDeliveryUser({
          ...updatedUser,
          full_name: updatedUser.full_name ?? "",
          vehicle_type: updatedUser.vehicle_type ?? "",
          license_plate: updatedUser.license_plate ?? "",
          driver_license_number: updatedUser.driver_license_number ?? "",
          status: updatedUser.status ?? "inactive",
          rating: updatedUser.rating ?? 0,
          total_deliveries: updatedUser.total_deliveries ?? 0,
          verification_status: updatedUser.verification_status ?? "pending",
          background_check_status: updatedUser.background_check_status ?? "pending",
          is_available: updatedUser.is_available ?? false,
          last_active: updatedUser.last_active ?? "",
          delivery_users_user_id: updatedUser.delivery_users_user_id ?? user!.id,
          created_at: updatedUser.created_at ?? new Date().toISOString(),
          updated_at: updatedUser.updated_at ?? new Date().toISOString(),
          id: updatedUser.id ?? ""
        });
      } else {
        // Create new user
        const { data: newUser, error: newUserError } = await supabase
          .from('delivery_users')
          .insert({
            delivery_users_user_id: user!.id,
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            status: 'inactive',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (newUserError) {
          throw newUserError;
        }

        setDeliveryUser({
          ...newUser,
          full_name: newUser.full_name ?? "",
          vehicle_type: newUser.vehicle_type ?? "",
          license_plate: newUser.license_plate ?? "",
          driver_license_number: newUser.driver_license_number ?? "",
          status: newUser.status ?? "inactive",
          rating: newUser.rating ?? 0,
          total_deliveries: newUser.total_deliveries ?? 0,
          verification_status: newUser.verification_status ?? "pending",
          background_check_status: newUser.background_check_status ?? "pending",
          is_available: newUser.is_available ?? false,
          last_active: newUser.last_active ?? "",
          delivery_users_user_id: newUser.delivery_users_user_id ?? user!.id,
          created_at: newUser.created_at ?? new Date().toISOString(),
          updated_at: newUser.updated_at ?? new Date().toISOString(),
          id: newUser.id ?? ""
        });
      }

      setCurrentStep(2);
      if (!completeSteps.includes(1)) {
        setCompleteSteps([...completeSteps, 1]);
      }
      return deliveryUser;
    } catch (error) {
      console.error('Error saving personal info:', error);
      toast({
        title: "Error",
        description: "Failed to save personal information",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveVehicleInformation = async (data: { type: string; make: string; model: string; year: number; color: string; license_plate: string; insurance_number: string; insurance_expiry: string }) => {
    setLoading(true);
    try {
      const { data: existingVehicle, error: existingVehicleError } = await supabase
        .from('delivery_vehicles')
        .select('*')
        .eq('delivery_vehicles_user_id', user!.id)
        .single();

      if (existingVehicleError && existingVehicleError.code !== 'PGRST116') {
        throw existingVehicleError;
      }

      if (existingVehicle) {
        // Update existing vehicle
        const { data: updatedVehicle, error: updateVehicleError } = await supabase
          .from('delivery_vehicles')
          .update({
            vehicle_type: data.type,
            make: data.make,
            model: data.model,
            year: data.year,
            color: data.color,
            license_plate: data.license_plate,
            insurance_number: data.insurance_number,
            insurance_expiry: data.insurance_expiry,
            updated_at: new Date().toISOString()
          })
          .eq('delivery_vehicles_user_id', user!.id)
          .select()
          .single();

        if (updateVehicleError) {
          throw updateVehicleError;
        }

        setVehicle({
          ...updatedVehicle,
          delivery_vehicles_user_id: updatedVehicle.delivery_vehicles_user_id ?? user!.id,
          vehicle_type: updatedVehicle.vehicle_type ?? "",
          is_active: updatedVehicle.is_active ?? true,
          make: updatedVehicle.make ?? "",
          model: updatedVehicle.model ?? "",
          year: updatedVehicle.year ?? 2020,
          color: updatedVehicle.color ?? "",
          license_plate: updatedVehicle.license_plate ?? "",
          insurance_number: updatedVehicle.insurance_number ?? "",
          insurance_expiry: updatedVehicle.insurance_expiry ?? "",
          created_at: updatedVehicle.created_at ?? new Date().toISOString(),
          updated_at: updatedVehicle.updated_at ?? new Date().toISOString(),
          id: updatedVehicle.id ?? ""
        });
      } else {
        // Create new vehicle
        const { data: newVehicle, error: newVehicleError } = await supabase
          .from('delivery_vehicles')
          .insert({
            delivery_vehicles_user_id: user!.id,
            vehicle_type: data.type,
            make: data.make,
            model: data.model,
            year: data.year,
            color: data.color,
            license_plate: data.license_plate,
            insurance_number: data.insurance_number,
            insurance_expiry: data.insurance_expiry,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (newVehicleError) {
          throw newVehicleError;
        }

        setVehicle({
          ...newVehicle,
          delivery_vehicles_user_id: newVehicle.delivery_vehicles_user_id ?? user!.id,
          vehicle_type: newVehicle.vehicle_type ?? "",
          is_active: newVehicle.is_active ?? true,
          make: newVehicle.make ?? "",
          model: newVehicle.model ?? "",
          year: newVehicle.year ?? 2020,
          color: newVehicle.color ?? "",
          license_plate: newVehicle.license_plate ?? "",
          insurance_number: newVehicle.insurance_number ?? "",
          insurance_expiry: newVehicle.insurance_expiry ?? "",
          created_at: newVehicle.created_at ?? new Date().toISOString(),
          updated_at: newVehicle.updated_at ?? new Date().toISOString(),
          id: newVehicle.id ?? ""
        });
      }

      setCurrentStep(3);
      if (!completeSteps.includes(2)) {
        setCompleteSteps([...completeSteps, 2]);
      }
    } catch (error) {
      console.error('Error saving vehicle info:', error);
      toast({
        title: "Error",
        description: "Failed to save vehicle information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, documentType: string, expiryDate: string, notes: string) => {
    setLoading(true);
    try {
      const filePath = `delivery_documents/${user!.id}/${documentType}_${new Date().getTime()}`;
      const { error: uploadError } = await supabase.storage
        .from('delivery_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const document_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/delivery_documents/${filePath}`;

      const { data: newDocument, error: newDocumentError } = await supabase
        .from('delivery_documents')
        .insert({
          delivery_documents_user_id: user!.id,
          document_type: documentType,
          file_path: filePath,
          document_url: document_url,
          expiry_date: expiryDate,
          notes: notes,
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (newDocumentError) {
        throw newDocumentError;
      }

      setDocuments(prevDocuments => [...prevDocuments, {
        ...newDocument,
        delivery_documents_user_id: newDocument.delivery_documents_user_id ?? user!.id,
        document_url: newDocument.document_url ?? newDocument.file_path ?? "",
        verification_status: newDocument.verification_status ?? (typeof newDocument.verified === "boolean" ? (newDocument.verified ? "verified" : "unverified") : "pending"),
        document_type: newDocument.document_type ?? "",
        expiry_date: newDocument.expiry_date ?? "",
        notes: newDocument.notes ?? "",
        created_at: newDocument.created_at ?? new Date().toISOString(),
        updated_at: newDocument.updated_at ?? new Date().toISOString(),
        id: newDocument.id ?? ""
      }]);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const completeDocumentsStep = async () => {
    setCurrentStep(4);
    if (!completeSteps.includes(3)) {
      setCompleteSteps([...completeSteps, 3]);
    }
  };

  const saveAvailabilitySchedule = async (scheduleData: any) => {
    setLoading(true);
    try {
      // TODO: Save availability schedule to database
      setAvailability(scheduleData);
      setCurrentStep(5);
      if (!completeSteps.includes(4)) {
        setCompleteSteps([...completeSteps, 4]);
      }
    } catch (error) {
      console.error('Error saving availability schedule:', error);
      toast({
        title: "Error",
        description: "Failed to save availability schedule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePaymentInfo = async (paymentData: { account_name: string; account_number: string; routing_number: string; bank_name: string; has_accepted_terms: boolean }) => {
    setLoading(true);
    try {
      const { data: existingPayment, error: existingPaymentError } = await supabase
        .from('delivery_payment_details')
        .select('*')
        .eq('delivery_payment_details_user_id', user!.id)
        .single();

      if (existingPaymentError && existingPaymentError.code !== 'PGRST116') {
        throw existingPaymentError;
      }

      if (existingPayment) {
        // Update existing payment info
        const { data: updatedPayment, error: updatePaymentError } = await supabase
          .from('delivery_payment_details')
          .update({
            account_name: paymentData.account_name,
            account_number: paymentData.account_number,
            routing_number: paymentData.routing_number,
            bank_name: paymentData.bank_name,
            has_accepted_terms: paymentData.has_accepted_terms,
            updated_at: new Date().toISOString()
          })
          .eq('delivery_payment_details_user_id', user!.id)
          .select()
          .single();

        if (updatePaymentError) {
          throw updatePaymentError;
        }

        setPaymentDetails({
          ...updatedPayment,
          delivery_payment_details_user_id: updatedPayment.delivery_payment_details_user_id ?? user!.id,
          account_holder_name: updatedPayment.account_holder_name ?? updatedPayment.account_name ?? "",
          account_type: updatedPayment.account_type ?? "checking",
          is_verified: updatedPayment.is_verified ?? false,
          id: updatedPayment.id ?? "",
          account_number: updatedPayment.account_number ?? "",
          routing_number: updatedPayment.routing_number ?? "",
          bank_name: updatedPayment.bank_name ?? "",
          created_at: updatedPayment.created_at ?? new Date().toISOString(),
          updated_at: updatedPayment.updated_at ?? new Date().toISOString(),
          has_accepted_terms: updatedPayment.has_accepted_terms ?? false,
        });
      } else {
        // Create new payment info
        const { data: newPayment, error: newPaymentError } = await supabase
          .from('delivery_payment_details')
          .insert({
            delivery_payment_details_user_id: user!.id,
            account_name: paymentData.account_name,
            account_number: paymentData.account_number,
            routing_number: paymentData.routing_number,
            bank_name: paymentData.bank_name,
            has_accepted_terms: paymentData.has_accepted_terms,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (newPaymentError) {
          throw newPaymentError;
        }

        setPaymentDetails({
          ...newPayment,
          delivery_payment_details_user_id: newPayment.delivery_payment_details_user_id ?? user!.id,
          account_holder_name: newPayment.account_holder_name ?? newPayment.account_name ?? "",
          account_type: newPayment.account_type ?? "checking",
          is_verified: newPayment.is_verified ?? false,
          id: newPayment.id ?? "",
          account_number: newPayment.account_number ?? "",
          routing_number: newPayment.routing_number ?? "",
          bank_name: newPayment.bank_name ?? "",
          created_at: newPayment.created_at ?? new Date().toISOString(),
          updated_at: newPayment.updated_at ?? new Date().toISOString(),
          has_accepted_terms: newPayment.has_accepted_terms ?? false,
        });
      }

      setCurrentStep(6);
      if (!completeSteps.includes(5)) {
        setCompleteSteps([...completeSteps, 5]);
      }
    } catch (error) {
      console.error('Error saving payment info:', error);
      toast({
        title: "Error",
        description: "Failed to save payment information",
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
    paymentDetails,
    availability,
    completeSteps,
    savePersonalInfo,
    saveVehicleInformation,
    uploadDocument,
    completeDocumentsStep,
    saveAvailabilitySchedule,
    savePaymentInfo,
  };
};

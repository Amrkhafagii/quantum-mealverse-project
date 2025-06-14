import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  DeliveryUser,
  DeliveryVehicle,
  DeliveryDocument,
  DeliveryAvailability,
} from '@/types/delivery';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export const useDeliveryOnboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryUser, setDeliveryUser] = useState<DeliveryUser | null>(null);
  const [vehicle, setVehicle] = useState<DeliveryVehicle | null>(null);
  const [documents, setDocuments] = useState<DeliveryDocument[]>([]);
  const [availability, setAvailability] = useState<DeliveryAvailability[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<any>(null); // Replace 'any' with the correct type
  const [completeSteps, setCompleteSteps] = useState<number[]>([]);

  useEffect(() => {
    const fetchDeliveryProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch delivery user profile
        const { data: deliveryUserData, error: deliveryUserError } = await supabase
          .from('delivery_users')
          .select('*')
          .eq('delivery_users_user_id', user.id)
          .single();

        if (deliveryUserError) {
          console.error('Error fetching delivery user:', deliveryUserError);
        }

        if (deliveryUserData) {
          const mappedDeliveryUser = mapToDeliveryUser(deliveryUserData);
          setDeliveryUser(mappedDeliveryUser);

          // Fetch vehicle information
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('delivery_vehicles')
            .select('*')
            .eq('delivery_vehicles_user_id', user.id)
            .single();

          if (vehicleError) {
            console.error('Error fetching vehicle info:', vehicleError);
          }

          if (vehicleData) {
            const mappedVehicle = mapToDeliveryVehicle(vehicleData);
            setVehicle(mappedVehicle);
          }

          // Fetch documents
          const { data: documentsData, error: documentsError } = await supabase
            .from('delivery_documents')
            .select('*')
            .eq('delivery_documents_user_id', user.id);

          if (documentsError) {
            console.error('Error fetching documents:', documentsError);
          }

          if (documentsData) {
            const mappedDocuments = documentsData.map(doc => mapToDeliveryDocument(doc));
            setDocuments(mappedDocuments);
          }

          // Fetch availability
          const { data: availabilityData, error: availabilityError } = await supabase
            .from('delivery_availability')
            .select('*')
            .eq('delivery_user_id', user.id);

          if (availabilityError) {
            console.error('Error fetching availability:', availabilityError);
          }

          if (availabilityData) {
            setAvailability(availabilityData as DeliveryAvailability[]);
          }

          // Determine completed steps
          const completed: number[] = [];
          if (deliveryUserData) completed.push(1);
          if (vehicleData) completed.push(2);
          if (documentsData && documentsData.length > 0) completed.push(3);
          if (availabilityData && availabilityData.length > 0) completed.push(4);
          // Add payment details check when implemented
          setCompleteSteps(completed);

          // Set current step
          if (completed.length < 5) {
            setCurrentStep(completed.length + 1);
          } else {
            setCurrentStep(6); // Complete
          }
        }
      } catch (error) {
        console.error('Error fetching delivery profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryProfile();
  }, [user]);

  const savePersonalInfo = async (data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }): Promise<DeliveryUser | null> => {
    if (!user) return null;
    setLoading(true);
    try {
      const { data: existingUser, error: existingUserError } = await supabase
        .from('delivery_users')
        .select('*')
        .eq('delivery_users_user_id', user.id)
        .single();

      if (existingUserError && existingUserError.code !== 'PGRST116') {
        console.error('Error checking existing delivery user:', existingUserError);
        toast({
          title: "Error",
          description: "Failed to check existing delivery user.",
          variant: "destructive"
        });
        return null;
      }

      const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();

      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error: updateUserError } = await supabase
          .from('delivery_users')
          .update({
            first_name: data.first_name,
            last_name: data.last_name,
            full_name: fullName,
            phone: data.phone,
            updated_at: new Date().toISOString(),
          })
          .eq('delivery_users_user_id', user.id)
          .select('*')
          .single();

        if (updateUserError) {
          console.error('Error updating delivery user:', updateUserError);
          toast({
            title: "Error",
            description: "Failed to update personal information.",
            variant: "destructive"
          });
          return null;
        }

        if (updatedUser) {
          const mappedUser = mapToDeliveryUser(updatedUser);
          setDeliveryUser(mappedUser);
          setCompleteSteps(prev => [...new Set([...prev, 1])]);
          setCurrentStep(2);
          toast({
            title: "Success",
            description: "Personal information updated successfully.",
          });
          return mappedUser;
        }
      } else {
        // Create new user
        const { data: newUser, error: createUserError } = await supabase
          .from('delivery_users')
          .insert({
            delivery_users_user_id: user.id,
            first_name: data.first_name,
            last_name: data.last_name,
            full_name: fullName,
            phone: data.phone,
            status: 'inactive', // Default status
            rating: 5, // Default rating
            total_deliveries: 0, // Default deliveries
            verification_status: 'pending', // Default verification
            background_check_status: 'pending', // Default background check
            is_available: false, // Default availability
            last_active: new Date().toISOString(),
          })
          .select('*')
          .single();

        if (createUserError) {
          console.error('Error creating delivery user:', createUserError);
          toast({
            title: "Error",
            description: "Failed to save personal information.",
            variant: "destructive"
          });
          return null;
        }

        if (newUser) {
          const mappedUser = mapToDeliveryUser(newUser);
          setDeliveryUser(mappedUser);
          setCompleteSteps(prev => [...new Set([...prev, 1])]);
          setCurrentStep(2);
          toast({
            title: "Success",
            description: "Personal information saved successfully.",
          });
          return mappedUser;
        }
      }
      return null;
    } catch (error) {
      console.error('Error saving personal info:', error);
      toast({
        title: "Error",
        description: "Failed to save personal information.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveVehicleInformation = async (data: {
    type?: "bicycle" | "car" | "motorcycle" | "scooter" | "on_foot";
    make?: string;
    model?: string;
    year?: number;
    license_plate?: string;
    color?: string;
    insurance_expiry?: Date;
    insurance_number?: string;
  }): Promise<DeliveryVehicle | null> => {
    if (!user) return null;
    setLoading(true);
    try {
      const { data: existingVehicle, error: existingVehicleError } = await supabase
        .from('delivery_vehicles')
        .select('*')
        .eq('delivery_vehicles_user_id', user.id)
        .single();

      if (existingVehicleError && existingVehicleError.code !== 'PGRST116') {
        console.error('Error checking existing vehicle:', existingVehicleError);
        toast({
          title: "Error",
          description: "Failed to check existing vehicle information.",
          variant: "destructive"
        });
        return null;
      }

      const vehicleData = {
        vehicle_type: data.type,
        make: data.make,
        model: data.model,
        year: data.year,
        license_plate: data.license_plate,
        color: data.color,
        insurance_number: data.insurance_number,
        insurance_expiry: data.insurance_expiry ? data.insurance_expiry.toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      if (existingVehicle) {
        // Update existing vehicle
        const { data: updatedVehicle, error: updateVehicleError } = await supabase
          .from('delivery_vehicles')
          .update(vehicleData)
          .eq('delivery_vehicles_user_id', user.id)
          .select('*')
          .single();

        if (updateVehicleError) {
          console.error('Error updating vehicle:', updateVehicleError);
          toast({
            title: "Error",
            description: "Failed to update vehicle information.",
            variant: "destructive"
          });
          return null;
        }

        if (updatedVehicle) {
          const mappedVehicle = mapToDeliveryVehicle(updatedVehicle);
          setVehicle(mappedVehicle);
          setCompleteSteps(prev => [...new Set([...prev, 2])]);
          setCurrentStep(3);
          toast({
            title: "Success",
            description: "Vehicle information updated successfully.",
          });
          return mappedVehicle;
        }
      } else {
        // Create new vehicle
        const { data: newVehicle, error: createVehicleError } = await supabase
          .from('delivery_vehicles')
          .insert({
            delivery_vehicles_user_id: user.id,
            ...vehicleData,
            is_active: true, // Default value
          })
          .select('*')
          .single();

        if (createVehicleError) {
          console.error('Error creating vehicle:', createVehicleError);
          toast({
            title: "Error",
            description: "Failed to save vehicle information.",
            variant: "destructive"
          });
          return null;
        }

        if (newVehicle) {
          const mappedVehicle = mapToDeliveryVehicle(newVehicle);
          setVehicle(mappedVehicle);
          setCompleteSteps(prev => [...new Set([...prev, 2])]);
          setCurrentStep(3);
          toast({
            title: "Success",
            description: "Vehicle information saved successfully.",
          });
          return mappedVehicle;
        }
      }
      return null;
    } catch (error) {
      console.error('Error saving vehicle info:', error);
      toast({
        title: "Error",
        description: "Failed to save vehicle information.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    file: File,
    documentType: "license" | "insurance" | "registration" | "background_check" | "profile_photo" | "drivers_license" | "vehicle_registration" | "identity",
    expiryDate?: Date,
    notes?: string
  ): Promise<void> => {
    if (!user) return;
    setLoading(true);
    try {
      const filePath = `delivery_documents/${user.id}/${documentType}_${Date.now()}_${file.name}`;
      const { error: storageError } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        console.error('Error uploading document:', storageError);
        toast({
          title: "Error",
          description: "Failed to upload document.",
          variant: "destructive"
        });
        return;
      }

      const documentUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${filePath}`;

      const { data: newDocument, error: dbError } = await supabase
        .from('delivery_documents')
        .insert({
          delivery_documents_user_id: user.id,
          document_type: documentType,
          document_url: documentUrl,
          expiry_date: expiryDate ? expiryDate.toISOString() : null,
          notes: notes,
        })
        .select('*')
        .single();

      if (dbError) {
        console.error('Error saving document details:', dbError);
        toast({
          title: "Error",
          description: "Failed to save document details.",
          variant: "destructive"
        });
        return;
      }

      if (newDocument) {
        const mappedDocument = mapToDeliveryDocument(newDocument);
        setDocuments(prev => [...prev, mappedDocument]);
        toast({
          title: "Success",
          description: "Document uploaded successfully.",
        });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const completeDocumentsStep = (): boolean => {
    if (documents.length > 0) {
      setCompleteSteps(prev => [...new Set([...prev, 3])]);
      setCurrentStep(4);
      toast({
        title: "Success",
        description: "Documents uploaded, continuing to next step.",
      });
      return true;
    } else {
      toast({
        title: "Warning",
        description: "Please upload at least one document to continue.",
        variant: "destructive"
      });
      return false;
    }
  };

  const saveAvailabilitySchedule = async (schedules: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_recurring: boolean;
  }[]): Promise<DeliveryAvailability[]> => {
    if (!user) return [];
    setLoading(true);
    try {
      // Delete existing availability entries for the user
      const { error: deleteError } = await supabase
        .from('delivery_availability')
        .delete()
        .eq('delivery_user_id', user.id);

      if (deleteError) {
        console.error('Error deleting existing availability:', deleteError);
        toast({
          title: "Error",
          description: "Failed to update availability schedule.",
          variant: "destructive"
        });
        return [];
      }

      // Insert new availability entries
      const newSchedules = schedules.map(schedule => ({
        delivery_user_id: user.id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        is_recurring: schedule.is_recurring,
      }));

      const { data: newAvailability, error: insertError } = await supabase
        .from('delivery_availability')
        .insert(newSchedules)
        .select('*');

      if (insertError) {
        console.error('Error saving availability:', insertError);
        toast({
          title: "Error",
          description: "Failed to update availability schedule.",
          variant: "destructive"
        });
        return [];
      }

      if (newAvailability) {
        setAvailability(newAvailability as DeliveryAvailability[]);
        setCompleteSteps(prev => [...new Set([...prev, 4])]);
        setCurrentStep(5);
        toast({
          title: "Success",
          description: "Availability schedule updated successfully.",
        });
        return newAvailability as DeliveryAvailability[];
      }
      return [];
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability schedule.",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const savePaymentInfo = async (paymentData: any): Promise<void> => {
    if (!user) return;
    setLoading(true);
    try {
      // Implement your payment saving logic here
      // This is just a placeholder
      setPaymentDetails(paymentData);
      setCompleteSteps(prev => [...new Set([...prev, 5])]);
      setCurrentStep(6);
      toast({
        title: "Success",
        description: "Payment information saved successfully.",
      });
    } catch (error) {
      console.error('Error saving payment info:', error);
      toast({
        title: "Error",
        description: "Failed to save payment information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Example enum safe-cast helpers:
  function mapStatusString(val: string): "inactive" | "active" | "suspended" | "on_break" {
    if (val === "active" || val === "inactive" || val === "suspended" || val === "on_break") return val;
    return "inactive";
  }
  function mapVerificationStatus(val: string): "pending" | "verified" | "rejected" {
    if (val === "pending" || val === "verified" || val === "rejected") return val;
    return "pending";
  }
  function mapBackgroundCheckStatus(val: string): "pending" | "rejected" | "approved" {
    if (val === "pending" || val === "rejected" || val === "approved") return val;
    return "pending";
  }
  function mapDocumentType(val: string):
    "license" | "insurance" | "registration" | "background_check" | "profile_photo" | "drivers_license" | "vehicle_registration" | "identity"
  {
    const valid: any = ["license","insurance","registration","background_check","profile_photo","drivers_license","vehicle_registration","identity"];
    if (valid.includes(val)) return val as any;
    return "license";
  }
  function mapDocumentVerificationStatus(val: string): "pending" | "rejected" | "approved" {
    if (val === "pending" || val === "rejected" || val === "approved") return val;
    return "pending";
  }
  function mapVehicleType(val: string): "bicycle" | "car" | "motorcycle" | "scooter" | "on_foot" {
    if (val === "bicycle" || val === "car" || val === "motorcycle" || val === "scooter" || val === "on_foot") return val;
    return "on_foot";
  }

  // Usage in mapping DB records:
  function mapToDeliveryUser(raw: any): DeliveryUser {
    return {
      id: raw.id,
      delivery_users_user_id: raw.delivery_users_user_id,
      full_name: raw.full_name || `${raw.first_name || ""} ${raw.last_name || ""}`.trim(),
      first_name: raw.first_name || "",
      last_name: raw.last_name || "",
      phone: raw.phone || "",
      vehicle_type: mapVehicleType(raw.vehicle_type || ""),
      license_plate: raw.license_plate || "",
      driver_license_number: raw.driver_license_number || "",
      status: mapStatusString(raw.status || ""),
      rating: typeof raw.rating === "number" ? raw.rating : (typeof raw.average_rating === "number" ? raw.average_rating : 5),
      total_deliveries: typeof raw.total_deliveries === "number" ? raw.total_deliveries : 0,
      verification_status: mapVerificationStatus(raw.verification_status || ""),
      background_check_status: mapBackgroundCheckStatus(raw.background_check_status || ""),
      is_available: !!raw.is_available,
      is_approved: !!raw.is_approved,
      last_active: raw.last_active || "",
      created_at: raw.created_at || "",
      updated_at: raw.updated_at || ""
    };
  }
  function mapToDeliveryVehicle(raw: any): DeliveryVehicle {
    return {
      id: raw.id,
      delivery_vehicles_user_id: raw.delivery_vehicles_user_id || "",
      delivery_user_id: raw.delivery_user_id || "",
      vehicle_type: mapVehicleType(raw.vehicle_type || raw.type || ""),
      type: mapVehicleType(raw.vehicle_type || raw.type || ""),
      make: raw.make || "",
      model: raw.model || "",
      year: typeof raw.year === "number" ? raw.year : 2020,
      license_plate: raw.license_plate || "",
      color: raw.color || "",
      insurance_policy_number: raw.insurance_policy_number || raw.insurance_number || "",
      insurance_number: raw.insurance_number || "",
      insurance_expiry: raw.insurance_expiry || "",
      registration_number: raw.registration_number || "",
      is_active: raw.is_active !== undefined ? !!raw.is_active : true,
      created_at: raw.created_at || "",
      updated_at: raw.updated_at || ""
    };
  }
  function mapToDeliveryDocument(raw: any): DeliveryDocument {
    return {
      id: raw.id,
      delivery_documents_user_id: raw.delivery_documents_user_id || "",
      document_type: mapDocumentType(raw.document_type || ""),
      document_url: raw.document_url || raw.file_path || "",
      verification_status: mapDocumentVerificationStatus(raw.verification_status || ""),
      expiry_date: raw.expiry_date || "",
      notes: raw.notes || "",
      created_at: raw.created_at || "",
      updated_at: raw.updated_at || ""
    };
  }

  return {
    loading,
    currentStep,
    deliveryUser,
    vehicle,
    documents,
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

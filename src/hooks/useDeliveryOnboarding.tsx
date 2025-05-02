
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  DeliveryUser,
  DeliveryVehicle,
  DeliveryDocument,
  DeliveryAvailability,
  DeliveryPaymentDetails
} from '@/types/delivery';
import {
  createDeliveryUser,
  getDeliveryUserByUserId,
  saveVehicleInfo,
  getVehicleByDeliveryUserId,
  uploadDeliveryDocument,
  getDocumentsByDeliveryUserId,
  saveAvailability,
  getAvailabilityByDeliveryUserId,
  savePaymentDetails,
  getPaymentDetailsByDeliveryUserId
} from '@/services/delivery/deliveryService';

export const useDeliveryOnboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryUser, setDeliveryUser] = useState<DeliveryUser | null>(null);
  const [vehicle, setVehicle] = useState<DeliveryVehicle | null>(null);
  const [documents, setDocuments] = useState<DeliveryDocument[]>([]);
  const [availability, setAvailability] = useState<DeliveryAvailability[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<DeliveryPaymentDetails | null>(null);
  const [completeSteps, setCompleteSteps] = useState<Record<number, boolean>>({
    1: false, // Personal Info
    2: false, // Vehicle Info
    3: false, // Documents
    4: false, // Availability
    5: false  // Payment Details
  });

  // Check existing delivery user profile
  useEffect(() => {
    const checkDeliveryUser = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await getDeliveryUserByUserId(user.id);
        if (userData) {
          setDeliveryUser(userData);
          setCompleteSteps(prev => ({ ...prev, 1: true }));

          // If user exists, fetch other related data
          const vehicleData = await getVehicleByDeliveryUserId(userData.id);
          if (vehicleData) {
            setVehicle(vehicleData);
            setCompleteSteps(prev => ({ ...prev, 2: true }));
          }

          const documentsData = await getDocumentsByDeliveryUserId(userData.id);
          if (documentsData && documentsData.length > 0) {
            setDocuments(documentsData);
            setCompleteSteps(prev => ({ ...prev, 3: true }));
          }

          const availabilityData = await getAvailabilityByDeliveryUserId(userData.id);
          if (availabilityData && availabilityData.length > 0) {
            setAvailability(availabilityData);
            setCompleteSteps(prev => ({ ...prev, 4: true }));
          }

          const paymentData = await getPaymentDetailsByDeliveryUserId(userData.id);
          if (paymentData) {
            setPaymentDetails(paymentData);
            setCompleteSteps(prev => ({ ...prev, 5: true }));
          }

          // Determine which is the next incomplete step
          for (let i = 1; i <= 5; i++) {
            if (!completeSteps[i]) {
              setCurrentStep(i);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error checking delivery user:', error);
        toast({
          title: "Error",
          description: "Failed to load delivery user profile",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    checkDeliveryUser();
  }, [user]);

  // Handle saving personal information
  const savePersonalInfo = async (data: {
    first_name: string;
    last_name: string;
    phone: string;
  }) => {
    if (!user) return null;

    try {
      setLoading(true);
      const userData = await createDeliveryUser({
        user_id: user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        status: 'inactive'
      });

      if (userData) {
        setDeliveryUser(userData);
        setCompleteSteps(prev => ({ ...prev, 1: true }));
        setCurrentStep(2);
        toast({
          title: "Success",
          description: "Personal information saved successfully",
        });
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error saving personal information:', error);
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

  // Handle saving vehicle information
  const saveVehicleInformation = async (data: {
    type: DeliveryVehicle['type'];
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    license_plate?: string;
    insurance_number?: string;
    insurance_expiry?: Date;
  }) => {
    if (!deliveryUser) return null;

    try {
      setLoading(true);
      const vehicleData = await saveVehicleInfo({
        delivery_user_id: deliveryUser.id,
        type: data.type,
        make: data.make,
        model: data.model,
        year: data.year,
        color: data.color,
        license_plate: data.license_plate,
        insurance_number: data.insurance_number,
        insurance_expiry: data.insurance_expiry?.toISOString().split('T')[0],
      });

      if (vehicleData) {
        setVehicle(vehicleData);
        setCompleteSteps(prev => ({ ...prev, 2: true }));
        setCurrentStep(3);
        toast({
          title: "Success",
          description: "Vehicle information saved successfully",
        });
        return vehicleData;
      }
      return null;
    } catch (error) {
      console.error('Error saving vehicle information:', error);
      toast({
        title: "Error",
        description: "Failed to save vehicle information",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handle document upload
  const uploadDocument = async (
    file: File,
    documentType: DeliveryDocument['document_type'],
    expiryDate?: Date,
    notes?: string
  ) => {
    if (!deliveryUser) return null;

    try {
      setLoading(true);
      const documentData = await uploadDeliveryDocument(
        file,
        documentType,
        deliveryUser.id,
        expiryDate,
        notes
      );

      if (documentData) {
        setDocuments(prev => [...prev, documentData]);
        toast({
          title: "Success",
          description: `${documentType} uploaded successfully`,
        });
        return documentData;
      }
      return null;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: `Failed to upload ${documentType}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Complete documents step
  const completeDocumentsStep = () => {
    const requiredDocTypes: DeliveryDocument['document_type'][] = ['drivers_license', 'profile_photo'];
    
    // For vehicles that require more documentation
    if (vehicle?.type === 'car' || vehicle?.type === 'motorcycle') {
      requiredDocTypes.push('vehicle_registration', 'insurance');
    }
    
    const hasAllRequired = requiredDocTypes.every(type => 
      documents.some(doc => doc.document_type === type)
    );
    
    if (hasAllRequired) {
      setCompleteSteps(prev => ({ ...prev, 3: true }));
      setCurrentStep(4);
      toast({
        title: "Success",
        description: "All required documents uploaded successfully",
      });
      return true;
    } else {
      toast({
        title: "Missing Documents",
        description: "Please upload all required documents",
        variant: "destructive"
      });
      return false;
    }
  };

  // Handle saving availability
  const saveAvailabilitySchedule = async (schedules: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_recurring: boolean;
  }[]) => {
    if (!deliveryUser) return null;

    try {
      setLoading(true);
      
      // Clear existing schedules first
      // (We'll implement this more robustly in a real system, here just adding new ones)
      
      const savedSchedules = [];
      for (const schedule of schedules) {
        const savedSchedule = await saveAvailability({
          delivery_user_id: deliveryUser.id,
          ...schedule
        });
        if (savedSchedule) {
          savedSchedules.push(savedSchedule);
        }
      }

      if (savedSchedules.length > 0) {
        setAvailability(savedSchedules);
        setCompleteSteps(prev => ({ ...prev, 4: true }));
        setCurrentStep(5);
        toast({
          title: "Success",
          description: "Availability schedule saved successfully",
        });
        return savedSchedules;
      }
      return null;
    } catch (error) {
      console.error('Error saving availability schedule:', error);
      toast({
        title: "Error",
        description: "Failed to save availability schedule",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handle saving payment details
  const savePaymentInfo = async (data: {
    account_name: string;
    account_number: string;
    routing_number: string;
    bank_name: string;
    has_accepted_terms: boolean;
  }) => {
    if (!deliveryUser) return null;

    try {
      setLoading(true);
      const paymentData = await savePaymentDetails({
        delivery_user_id: deliveryUser.id,
        ...data
      });

      if (paymentData) {
        setPaymentDetails(paymentData);
        setCompleteSteps(prev => ({ ...prev, 5: true }));
        setCurrentStep(6); // Complete
        toast({
          title: "Success",
          description: "Payment details saved successfully",
        });
        return paymentData;
      }
      return null;
    } catch (error) {
      console.error('Error saving payment details:', error);
      toast({
        title: "Error",
        description: "Failed to save payment details",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check if onboarding is complete
  const isOnboardingComplete = () => {
    return Object.values(completeSteps).every(step => step === true);
  };

  return {
    loading,
    currentStep,
    setCurrentStep,
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
    isOnboardingComplete
  };
};

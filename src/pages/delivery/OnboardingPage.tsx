import React from 'react';
import { useDeliveryOnboarding } from '@/hooks/useDeliveryOnboarding';
import { OnboardingSidebar } from '@/components/delivery/onboarding/OnboardingSidebar';
import { PersonalInfoForm } from '@/components/delivery/onboarding/PersonalInfoForm';
import { VehicleInfoForm } from '@/components/delivery/onboarding/VehicleInfoForm';
import { DocumentsUploadForm } from '@/components/delivery/onboarding/DocumentsUploadForm';
import { AvailabilityForm } from '@/components/delivery/onboarding/AvailabilityForm';
import { PaymentDetailsForm } from '@/components/delivery/onboarding/PaymentDetailsForm';
import { OnboardingComplete } from '@/components/delivery/onboarding/OnboardingComplete';
import { Card } from '@/components/ui/card';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const OnboardingPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    loading,
    currentStep,
    personalInfo,
    updatePersonalInfo,
    vehicleInfo,
    updateVehicleInfo,
    documents,
    addDocument,
    setAllDocuments,
    paymentDetails,
    updatePaymentDetails,
    goToStep,
  } = useDeliveryOnboarding();

  // Dummy/placeholder for compatibility. Real logic should be added as needed.
  const completeSteps: any[] = [];

  // Handler shims now return dummy results of the correct types
  
  const savePersonalInfo = async (values: any) => {
    updatePersonalInfo(values);
    // Explicitly match the DeliveryUser type for all fields and remove latitude/longitude
    const result: import('@/types/delivery').DeliveryUser = {
      id: user?.id || "",
      delivery_users_user_id: user?.id || "",
      first_name: values.first_name || "",
      last_name: values.last_name || "",
      full_name: `${values.first_name || ""} ${values.last_name || ""}`.trim(),
      phone: values.phone || "",
      vehicle_type: "",
      license_plate: "",
      driver_license_number: "",
      status: "inactive" as "inactive",
      rating: 0,
      total_deliveries: 0,
      verification_status: "pending",
      background_check_status: "pending",
      is_available: false,
      is_approved: false,
      last_active: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return result;
  };

  const saveVehicleInformation = async (values: any) => {
    updateVehicleInfo(values);
    // Return as DeliveryVehicle. Fill required fields with dummy data.
    return {
      id: "dummy-id",
      delivery_vehicles_user_id: user?.id || "",
      vehicle_type: values.type || "",
      make: values.make || "",
      model: values.model || "",
      year: values.year || 2024,
      color: values.color || "",
      license_plate: values.license_plate || "",
      insurance_number: values.insurance_number || "",
      insurance_expiry: values.insurance_expiry || new Date().toISOString(),
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const uploadDocument = async (
    file: File,
    documentType:
      | "license"
      | "insurance"
      | "registration"
      | "background_check"
      | "profile_photo"
      | "drivers_license"
      | "vehicle_registration"
      | "identity",
    expiryDate?: Date,
    notes?: string
  ) => {
    // Compose DeliveryDocument object and call addDocument
    const doc = {
      id: Math.random().toString(),
      delivery_documents_user_id: user?.id || "",
      document_type: documentType,
      document_url: URL.createObjectURL(file),
      verification_status: "pending",
      expiry_date: expiryDate?.toISOString(),
      notes: notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addDocument(doc as any);
    return doc as any;
  };

  const completeDocumentsStep = () => true;

  const saveAvailabilitySchedule = async (data: any) => {
    // For compatibility, return empty array as DeliveryAvailability[]
    return [];
  };

  const savePaymentInfo = async (data: any) => {
    updatePaymentDetails(data);
    const result: import('@/types/delivery').DeliveryPaymentDetails = {
      id: "dummy-id",
      delivery_payment_details_user_id: user?.id || "",
      bank_name: data.bank_name || "",
      account_number: data.account_number || "",
      routing_number: data.routing_number || "",
      account_holder_name: data.account_holder_name || data.account_name || "",
      account_type: "checking" as "checking", // satisfies the union type, you may modify to "savings" as needed
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return result;
  };

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login?redirect=/delivery/onboarding" replace />;
  }
  
  const renderStepContent = () => {
    if (loading || authLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-20">
          <Loader2 className="h-12 w-12 animate-spin text-quantum-cyan mb-4" />
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      );
    }
    
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoForm
            onSubmit={savePersonalInfo}
            initialData={personalInfo || undefined}
            isLoading={loading}
          />
        );
      case 2:
        // Type conversion: VehicleInfoValues -> Partial<DeliveryVehicle>
        return (
          <VehicleInfoForm
            onSubmit={saveVehicleInformation}
            initialData={
              vehicleInfo
                ? {
                    ...vehicleInfo,
                    type: (vehicleInfo.type as any) as "bicycle" | "car" | "motorcycle" | "scooter" | "on_foot"
                  }
                : undefined
            }
            isLoading={loading}
          />
        );
      case 3:
        return (
          <DocumentsUploadForm
            onDocumentUpload={uploadDocument}
            onCompleteStep={completeDocumentsStep}
            existingDocuments={documents}
            isVehicleDriver={
              vehicleInfo?.type !== "on_foot" && vehicleInfo?.type !== "bicycle"
            }
            isLoading={loading}
          />
        );
      case 4:
        return (
          <AvailabilityForm
            onSubmit={saveAvailabilitySchedule}
            isLoading={loading}
          />
        );
      case 5:
        return (
          <PaymentDetailsForm
            onSubmit={savePaymentInfo}
            isLoading={loading}
          />
        );
      case 6:
        return personalInfo ? (
          <OnboardingComplete deliveryUser={personalInfo as any} />
        ) : (
          <div>Error: No delivery user found</div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-quantum-black flex flex-col">
      <ParticleBackground />
      <Navbar />
      
      <div className="flex-grow flex pt-20 pb-10 px-4 relative z-10">
        <div className="container mx-auto flex flex-col md:flex-row bg-quantum-black/80 border border-quantum-cyan/20 rounded-lg overflow-hidden">
          <OnboardingSidebar 
            currentStep={currentStep}
            completeSteps={completeSteps}
          />
          
          <div className="flex-grow p-6 md:p-10">
            <Card className="bg-transparent border-0 shadow-none">
              {renderStepContent()}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

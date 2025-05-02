
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
  } = useDeliveryOnboarding();
  
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
            initialData={deliveryUser || undefined}
            isLoading={loading}
          />
        );
      case 2:
        return (
          <VehicleInfoForm
            onSubmit={saveVehicleInformation}
            initialData={vehicle || undefined}
            isLoading={loading}
          />
        );
      case 3:
        return (
          <DocumentsUploadForm
            onDocumentUpload={uploadDocument}
            onCompleteStep={completeDocumentsStep}
            existingDocuments={documents}
            isVehicleDriver={vehicle?.type !== 'on_foot' && vehicle?.type !== 'bicycle'}
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
        return deliveryUser ? (
          <OnboardingComplete deliveryUser={deliveryUser} />
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

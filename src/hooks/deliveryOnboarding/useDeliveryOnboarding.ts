
import { useState } from "react";
import { usePersonalInfo } from "./usePersonalInfo";
import { useVehicleInfo } from "./useVehicleInfo";
import { useDocumentsInfo } from "./useDocumentsInfo";
import { usePaymentInfo } from "./usePaymentInfo";
import { DeliveryUser, DeliveryVehicle, DeliveryDocument, DeliveryPaymentDetails } from "@/types/delivery";

export function useDeliveryOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);

  // Get each section's info and update handlers
  const { personalInfo, updatePersonalInfo } = usePersonalInfo();
  const { vehicleInfo, updateVehicleInfo } = useVehicleInfo();
  const { documents, addDocument, setAllDocuments } = useDocumentsInfo();
  const { paymentDetails, updatePaymentDetails } = usePaymentInfo();

  // Simulated "loading" -- can be replaced with real fetch logic later
  const loading = false; // Set to 'false' for now
  // Add optional logic for completeSteps (e.g., from state or step rule logic)
  const completeSteps = [];

  async function savePersonalInfo(values: any) {
    updatePersonalInfo(values);
    // ...additional save logic
    return Promise.resolve(null);
  }
  async function saveVehicleInformation(values: any) {
    updateVehicleInfo(values);
    // ...additional save logic
    return Promise.resolve(null);
  }
  async function uploadDocument(document: any) {
    addDocument(document);
    // ...additional save logic
    return Promise.resolve();
  }
  async function completeDocumentsStep() {
    // ...save step as complete
    return Promise.resolve();
  }
  async function saveAvailabilitySchedule(data: any) {
    // ...save availability
    return Promise.resolve(null);
  }
  async function savePaymentInfo(data: any) {
    updatePaymentDetails(data);
    // ...actual save logic
    return Promise.resolve(null);
  }

  return {
    loading,
    currentStep,
    goToStep: setCurrentStep,
    personalInfo,
    updatePersonalInfo,
    vehicleInfo,
    updateVehicleInfo,
    documents,
    addDocument,
    setAllDocuments,
    paymentDetails,
    updatePaymentDetails,
    // Expose the handlers expected by OnboardingPage
    deliveryUser: personalInfo, // For demo compatibility
    vehicle: vehicleInfo,
    completeSteps,
    savePersonalInfo,
    saveVehicleInformation,
    uploadDocument,
    completeDocumentsStep,
    saveAvailabilitySchedule,
    savePaymentInfo,
  };
}

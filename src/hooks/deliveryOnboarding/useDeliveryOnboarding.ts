
import { useState } from "react";
import { usePersonalInfo } from "./usePersonalInfo";
import { useVehicleInfo } from "./useVehicleInfo";
import { useDocumentsInfo } from "./useDocumentsInfo";
import { usePaymentInfo } from "./usePaymentInfo";
import { DeliveryUser, DeliveryVehicle, DeliveryDocument, DeliveryPaymentDetails } from "@/types/delivery";

export function useDeliveryOnboarding() {
  // This could later be enhanced to load from the server or context:
  const [currentStep, setCurrentStep] = useState(1);

  // Replace these nulls with fetched API objects if available:
  const { personalInfo, updatePersonalInfo } = usePersonalInfo();
  const { vehicleInfo, updateVehicleInfo } = useVehicleInfo();
  const { documents, addDocument, setAllDocuments } = useDocumentsInfo();
  const { paymentDetails, updatePaymentDetails } = usePaymentInfo();

  function goToStep(step: number) {
    setCurrentStep(step);
  }

  return {
    currentStep,
    goToStep,
    personalInfo,
    updatePersonalInfo,
    vehicleInfo,
    updateVehicleInfo,
    documents,
    addDocument,
    setAllDocuments,
    paymentDetails,
    updatePaymentDetails,
  };
}

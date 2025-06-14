
import { useState } from "react";
import { DeliveryPaymentDetails } from "@/types/delivery";

export function usePaymentInfo(initial?: DeliveryPaymentDetails | null) {
  const [paymentDetails, setPaymentDetails] = useState<DeliveryPaymentDetails | null>(initial || null);

  function updatePaymentDetails(details: DeliveryPaymentDetails) {
    setPaymentDetails(details);
  }

  return {
    paymentDetails,
    updatePaymentDetails,
  };
}

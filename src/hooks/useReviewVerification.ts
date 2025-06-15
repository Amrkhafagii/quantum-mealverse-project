
import { useCallback, useState } from "react";
import { useEnhancedReviewSubmission, VerificationStatus } from "@/hooks/useEnhancedReviewSubmission";

// Centralizes review verification status check logic
export function useReviewVerification(userId?: string) {
  const { checkVerificationStatus } = useEnhancedReviewSubmission();
  const [status, setStatus] = useState<VerificationStatus | null>(null);

  const check = useCallback(
    async (mealId: string) => {
      const result = await checkVerificationStatus(mealId);
      setStatus(result);
      return result;
    },
    [checkVerificationStatus]
  );

  return {
    verificationStatus: status,
    checkVerification: check,
  };
}

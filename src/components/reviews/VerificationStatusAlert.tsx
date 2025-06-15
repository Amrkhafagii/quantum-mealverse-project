
import React from "react";
import { VerificationStatus } from "@/hooks/useEnhancedReviewSubmission";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Check, X } from "lucide-react";

// Display verification or wait time alert
interface Props {
  verificationStatus?: VerificationStatus | null;
}

export const VerificationStatusAlert: React.FC<Props> = ({ verificationStatus }) => {
  if (!verificationStatus) return null;
  if (!verificationStatus.isVerified) {
    return (
      <Alert variant="destructive" className="mb-2">
        <X className="h-5 w-5" />
        <AlertTitle>Purchase not verified</AlertTitle>
        <AlertDescription>
          Only verified purchasers can review this meal.
        </AlertDescription>
      </Alert>
    );
  }
  if (verificationStatus.isVerified && !verificationStatus.canReview) {
    return (
      <Alert variant="warning" className="mb-2">
        <X className="h-5 w-5" />
        <AlertTitle>Too early</AlertTitle>
        <AlertDescription>
          {verificationStatus.waitTimeHours
            ? `Please wait ${Math.max(0, Math.round(verificationStatus.waitTimeHours))} more hours before reviewing.`
            : `You can't review this meal yet.`}
        </AlertDescription>
      </Alert>
    );
  }
  if (verificationStatus.isVerified && verificationStatus.canReview) {
    return (
      <Alert variant="success" className="mb-2">
        <Check className="h-5 w-5" />
        <AlertTitle>Verified!</AlertTitle>
        <AlertDescription>
          Your purchase has been verified. Thank you for being a real customer.
        </AlertDescription>
      </Alert>
    );
  }
  return null;
};

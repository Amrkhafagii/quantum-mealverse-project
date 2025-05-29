
import React from 'react';
import { EnhancedAssignmentCard } from './EnhancedAssignmentCard';
import { DeliveryAssignment } from '@/types/delivery-assignment';

interface AutomaticAssignmentCardProps {
  assignment: DeliveryAssignment;
  onAccept: () => void;
  onReject: () => void;
  isProcessing: boolean;
}

export const AutomaticAssignmentCard: React.FC<AutomaticAssignmentCardProps> = ({
  assignment,
  onAccept,
  onReject,
  isProcessing
}) => {
  const handleResponse = () => {
    // The EnhancedAssignmentCard will handle the response internally
    // This component just needs to refresh when done
  };

  return (
    <EnhancedAssignmentCard
      assignment={assignment}
      onResponse={handleResponse}
      showActions={!isProcessing}
    />
  );
};

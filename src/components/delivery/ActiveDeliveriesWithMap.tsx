
import React, { useState, useEffect } from 'react';
import { ActiveDeliveries } from './ActiveDeliveries';
import { DeliveryMapView } from './DeliveryMapView';
import { DeliveryAssignment } from '@/types/delivery-assignment';
import { useDeliveryAssignments } from '@/hooks/useDeliveryAssignments';
import { useAuth } from '@/hooks/useAuth';
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import { useDeliveryMap } from '@/contexts/DeliveryMapContext';

const ActiveDeliveriesWithMap: React.FC = () => {
  const { user } = useAuth();
  const { deliveryUser } = useDeliveryUser(user?.id);
  const { activeAssignments, refreshData } = useDeliveryAssignments(deliveryUser?.id);
  const [selectedAssignment, setSelectedAssignment] = useState<DeliveryAssignment | null>(null);
  const { selectedDeliveryId } = useDeliveryMap();
  
  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [refreshData]);
  
  // Select the first active assignment by default or sync with context
  useEffect(() => {
    if (selectedDeliveryId && activeAssignments.some(a => a.id === selectedDeliveryId)) {
      setSelectedAssignment(activeAssignments.find(a => a.id === selectedDeliveryId) || null);
    } else if (activeAssignments.length > 0 && !selectedAssignment) {
      setSelectedAssignment(activeAssignments[0]);
    } else if (activeAssignments.length === 0) {
      setSelectedAssignment(null);
    } else if (selectedAssignment && !activeAssignments.some(a => a.id === selectedAssignment.id)) {
      // If the selected assignment is no longer in the active list
      setSelectedAssignment(activeAssignments.length > 0 ? activeAssignments[0] : null);
    }
  }, [activeAssignments, selectedAssignment, selectedDeliveryId]);

  const handleAssignmentSelect = (assignment: DeliveryAssignment) => {
    setSelectedAssignment(assignment);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="lg:order-1">
        <ActiveDeliveries 
          selectedAssignmentId={selectedAssignment?.id}
          onAssignmentSelect={handleAssignmentSelect}
        />
      </div>
      
      <div className="lg:order-2">
        <DeliveryMapView 
          activeAssignment={selectedAssignment || undefined}
          className="h-full"
        />
      </div>
    </div>
  );
};

export default ActiveDeliveriesWithMap;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActiveDeliveries } from './ActiveDeliveries';
import DeliveryMapView from './DeliveryMapView';
import { DeliveryAssignment } from '@/types/delivery-assignment';
import { useDeliveryAssignments } from '@/hooks/useDeliveryAssignments';
import { useAuth } from '@/hooks/useAuth';
import { useDeliveryUser } from '@/hooks/useDeliveryUser';

const ActiveDeliveriesWithMap: React.FC = () => {
  const { user } = useAuth();
  const { deliveryUser } = useDeliveryUser(user?.id);
  const { activeAssignments } = useDeliveryAssignments(deliveryUser?.id);
  const [selectedAssignment, setSelectedAssignment] = useState<DeliveryAssignment | null>(null);
  const [showMap, setShowMap] = useState(true);

  // Select the first active assignment by default
  useEffect(() => {
    if (activeAssignments.length > 0 && !selectedAssignment) {
      setSelectedAssignment(activeAssignments[0]);
    } else if (activeAssignments.length === 0) {
      setSelectedAssignment(null);
    } else if (selectedAssignment && !activeAssignments.some(a => a.id === selectedAssignment.id)) {
      // If the selected assignment is no longer in the active list
      setSelectedAssignment(activeAssignments.length > 0 ? activeAssignments[0] : null);
    }
  }, [activeAssignments, selectedAssignment]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="lg:order-1">
        <ActiveDeliveries />
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


import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PackageCheck, 
  PackageX, 
  Navigation, 
  Clock, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { DeliveryAssignment } from '@/types/delivery';
import { getActiveDeliveryAssignments, updateDeliveryStatus } from '@/services/delivery/deliveryAssignmentService';

interface ActiveDeliveriesProps {
  deliveryUserId: string;
}

export const ActiveDeliveries: React.FC<ActiveDeliveriesProps> = ({ deliveryUserId }) => {
  const { toast } = useToast();
  const [activeAssignments, setActiveAssignments] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadActiveAssignments();
    
    // Poll for new assignments every 30 seconds
    const interval = setInterval(loadActiveAssignments, 30000);
    return () => clearInterval(interval);
  }, [deliveryUserId]);
  
  const loadActiveAssignments = async () => {
    try {
      setLoading(true);
      const assignments = await getActiveDeliveryAssignments(deliveryUserId);
      setActiveAssignments(assignments);
    } catch (error) {
      console.error('Error loading active assignments:', error);
      toast({
        title: "Couldn't load deliveries",
        description: "There was a problem loading your active deliveries.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateStatus = async (assignmentId: string, newStatus: DeliveryAssignment['status']) => {
    try {
      await updateDeliveryStatus(assignmentId, newStatus);
      toast({
        title: "Status updated",
        description: `Delivery status updated to ${formatStatus(newStatus)}`,
      });
      loadActiveAssignments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update failed",
        description: "Couldn't update the delivery status.",
        variant: "destructive"
      });
    }
  };
  
  const formatStatus = (status: string): string => {
    return {
      'pending': 'Pending',
      'assigned': 'Assigned',
      'picked_up': 'Picked Up',
      'on_the_way': 'On the Way',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    }[status] || status;
  };
  
  const getNextAction = (assignment: DeliveryAssignment): { status: DeliveryAssignment['status'], label: string } | null => {
    switch (assignment.status) {
      case 'assigned':
        return { status: 'picked_up', label: 'Mark as Picked Up' };
      case 'picked_up':
        return { status: 'on_the_way', label: 'Start Delivery' };
      case 'on_the_way':
        return { status: 'delivered', label: 'Complete Delivery' };
      default:
        return null;
    }
  };
  
  const getStatusBadgeColor = (status: string): string => {
    return {
      'pending': 'bg-gray-500',
      'assigned': 'bg-blue-500',
      'picked_up': 'bg-purple-500',
      'on_the_way': 'bg-yellow-500',
      'delivered': 'bg-green-500',
      'cancelled': 'bg-red-500'
    }[status] || 'bg-gray-500';
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
      </div>
    );
  }
  
  if (activeAssignments.length === 0) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <PackageX className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No Active Deliveries</h3>
          <p className="text-gray-400 text-center max-w-md">
            You don't have any active deliveries at the moment. When you're online, new delivery requests will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {activeAssignments.map((assignment) => (
        <Card key={assignment.id} className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Order #{assignment.order_id.slice(-6)}</CardTitle>
              <Badge className={`${getStatusBadgeColor(assignment.status)}`}>
                {formatStatus(assignment.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Assignment details would be shown here */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Restaurant</p>
                  <p className="font-medium">[Restaurant Name]</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Customer</p>
                  <p className="font-medium">[Customer Name]</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pickup Time</p>
                  <p className="font-medium">
                    {assignment.pickup_time 
                      ? new Date(assignment.pickup_time).toLocaleTimeString() 
                      : 'Not picked up yet'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Estimated Delivery</p>
                  <p className="font-medium">
                    {assignment.estimated_delivery_time 
                      ? new Date(assignment.estimated_delivery_time).toLocaleTimeString()
                      : 'Not available'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                {/* Navigation button */}
                <Button variant="outline" size="sm" className="flex-1">
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate
                </Button>
                
                {/* Status update button */}
                {getNextAction(assignment) && (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      const nextAction = getNextAction(assignment);
                      if (nextAction) {
                        handleUpdateStatus(assignment.id, nextAction.status);
                      }
                    }}
                  >
                    {assignment.status === 'on_the_way' ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    {getNextAction(assignment)?.label}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

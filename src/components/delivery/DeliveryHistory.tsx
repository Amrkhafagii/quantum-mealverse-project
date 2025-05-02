
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  PackageCheck,
  PackageX,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { DeliveryAssignment } from '@/types/delivery-assignment';
import { useDeliveryAssignments } from '@/hooks/useDeliveryAssignments';

interface DeliveryHistoryProps {
  deliveryUserId: string;
}

export const DeliveryHistory: React.FC<DeliveryHistoryProps> = ({ deliveryUserId }) => {
  const { 
    pastAssignments, 
    totalPastAssignments,
    currentPage,
    loading, 
    loadPage
  } = useDeliveryAssignments(deliveryUserId);
  
  const [hasMore, setHasMore] = useState(false);
  
  useEffect(() => {
    if (totalPastAssignments > 0) {
      setHasMore(totalPastAssignments > currentPage * 5); // Assuming 5 items per page
    }
  }, [totalPastAssignments, currentPage]);
  
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
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading && currentPage === 1) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
      </div>
    );
  }
  
  if (pastAssignments.length === 0 && currentPage === 1) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <PackageX className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No Delivery History</h3>
          <p className="text-gray-400 text-center max-w-md">
            You haven't completed any deliveries yet. Once you complete deliveries, they will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Delivery History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastAssignments.map((assignment) => (
              <div key={assignment.id} className="p-4 border border-quantum-cyan/10 rounded-md bg-quantum-black/30">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium">Order #{assignment.order_id.slice(-6)}</p>
                    <p className="text-sm text-gray-400">{formatDate(assignment.created_at)}</p>
                  </div>
                  <Badge className={`${getStatusBadgeColor(assignment.status)}`}>
                    {formatStatus(assignment.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Pickup:</span>{' '}
                    {formatDate(assignment.pickup_time)}
                  </div>
                  <div>
                    <span className="text-gray-400">Delivered:</span>{' '}
                    {formatDate(assignment.delivery_time)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            <div className="flex justify-between items-center pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-gray-400">Page {currentPage}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadPage(currentPage + 1)}
                disabled={!hasMore || loading}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {loading && <div className="flex justify-center pt-2">
              <Loader2 className="h-5 w-5 animate-spin text-quantum-cyan" />
            </div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryHistory;

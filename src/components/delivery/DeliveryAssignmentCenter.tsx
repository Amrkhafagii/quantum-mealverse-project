
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AutomaticAssignmentCard } from './AutomaticAssignmentCard';
import { useAutomaticAssignments } from '@/hooks/useAutomaticAssignments';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { Bell, Package } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface DeliveryAssignmentCenterProps {
  deliveryUserId: string;
}

export const DeliveryAssignmentCenter: React.FC<DeliveryAssignmentCenterProps> = ({
  deliveryUserId
}) => {
  const {
    pendingAssignments,
    loading,
    isProcessing,
    acceptAssignment,
    rejectAssignment
  } = useAutomaticAssignments(deliveryUserId);

  // Subscribe to real-time notifications
  const { unreadCount } = useRealtimeNotifications();

  if (loading) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan mx-auto mb-2" />
          <p className="text-gray-400">Loading assignments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-quantum-cyan" />
          <h3 className="text-lg font-semibold text-quantum-cyan">
            Delivery Assignments ({pendingAssignments.length})
          </h3>
        </div>
        {unreadCount > 0 && (
          <div className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
            {unreadCount} new notifications
          </div>
        )}
      </div>

      {pendingAssignments.length === 0 ? (
        <Card className="border border-quantum-cyan/20 bg-transparent">
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Pending Assignments</h3>
            <p className="text-gray-400">
              New delivery assignments will appear here automatically when orders are ready for pickup.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingAssignments.map((assignment) => (
            <AutomaticAssignmentCard
              key={assignment.id}
              assignment={assignment}
              onAccept={() => acceptAssignment(assignment.id)}
              onReject={() => rejectAssignment(assignment.id, 'Driver unavailable')}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      )}
    </div>
  );
};

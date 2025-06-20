
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Clock, Package } from 'lucide-react';
import { OrderAssignmentCard } from './OrderAssignmentCard';
import { OrderWithContext } from './OrderWithContext';
import { usePendingAssignments } from '@/hooks/usePendingAssignments';

interface PendingAssignmentsListProps {
  restaurantId: string;
}

export const PendingAssignmentsList: React.FC<PendingAssignmentsListProps> = ({
  restaurantId
}) => {
  const { assignments, loading, error, refetch } = usePendingAssignments(restaurantId);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending assignments...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Assignments</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Order Assignments</CardTitle>
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pending Assignments</h3>
          <p className="text-gray-600 mb-4">
            New order assignments will appear here when available.
          </p>
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            <Clock className="h-4 w-4 inline mr-1" />
            Orders are automatically assigned based on your restaurant's availability and location.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Pending Assignments ({assignments.length})
        </h2>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment) => {
          // Validate assignment data before processing
          if (!assignment?.order || !assignment.order.id) {
            console.warn('Invalid assignment data:', assignment);
            return (
              <Card key={assignment?.id || 'invalid'} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4 text-center">
                  <AlertCircle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-yellow-700">Invalid assignment data - skipping</p>
                </CardContent>
              </Card>
            );
          }

          // The order data is already properly formatted from the hook
          const orderData = assignment.order;

          return (
            <OrderWithContext
              key={assignment.id}
              order={orderData}
              restaurantId={restaurantId}
              onAssignmentUpdate={refetch}
            >
              <OrderAssignmentCard />
            </OrderWithContext>
          );
        })}
      </div>
      
      {assignments.length > 0 && (
        <div className="text-sm text-gray-500 text-center p-4 bg-blue-50 rounded-lg">
          <Clock className="h-4 w-4 inline mr-1" />
          Remember to respond to assignments promptly to maintain your restaurant's rating and customer satisfaction.
        </div>
      )}
    </div>
  );
};

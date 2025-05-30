
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { OrderAssignmentCard } from './OrderAssignmentCard';
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

  if (assignments.length === 0) {
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
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pending Assignments</h3>
          <p className="text-gray-600">New order assignments will appear here when available.</p>
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
        {assignments.map((assignment) => (
          <OrderAssignmentCard
            key={assignment.id}
            order={assignment.order}
            restaurantId={restaurantId}
            onAssignmentUpdate={refetch}
          />
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Phone, User, CheckCircle, XCircle, Utensils } from 'lucide-react';
import { useRestaurantAssignments } from '@/hooks/useRestaurantAssignments';
import { useToast } from '@/components/ui/use-toast';
import type { RestaurantAssignment } from '@/types/notifications';

type RestaurantAssignment = any; // TODO: Define this type properly

const AssignmentItem: React.FC<{
  assignment: RestaurantAssignment;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}> = ({ assignment, onAccept, onReject }) => {
  const order = (assignment as any).orders;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const remaining = expiry - now;
    
    if (remaining <= 0) return 'Expired';
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Determine if this is a nutrition-generated order based on assignment metadata
  const isNutritionGenerated = (assignment as any).assignment_metadata?.assignment_type === 'nutrition_generated';
  const estimatedPrepTime = (assignment as any).assignment_metadata?.estimated_prep_time;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">New Order Assignment</h3>
              {isNutritionGenerated && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Utensils className="h-3 w-3" />
                  Nutrition Plan
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Expires in: {getTimeRemaining(assignment.expires_at)}</span>
            </div>
            {estimatedPrepTime && (
              <div className="flex items-center space-x-2 text-sm text-blue-600 mt-1">
                <Utensils className="h-4 w-4" />
                <span>Est. prep time: {estimatedPrepTime} min</span>
              </div>
            )}
          </div>
          <Badge variant="secondary">
            {assignment.distance_km && `${assignment.distance_km.toFixed(1)} km away`}
          </Badge>
        </div>

        {order && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{order.customer_name}</span>
              <Phone className="h-4 w-4 text-gray-500 ml-4" />
              <span>{order.customer_phone}</span>
            </div>
            
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
              <span className="text-sm">{order.delivery_address}</span>
            </div>
            
            <div className="text-lg font-bold text-green-600">
              Total: {formatCurrency(order.total)}
            </div>
            
            {order.order_items && order.order_items.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Order Items:</h4>
                <ul className="text-sm space-y-1">
                  {order.order_items.map((item: any, index: number) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isNutritionGenerated && (
              <div className="bg-blue-50 p-3 rounded-md mt-3">
                <p className="text-sm text-blue-800">
                  <strong>Nutrition-Generated Order:</strong> This order was created from a customer's meal plan and has been automatically assigned to your restaurant based on your menu capabilities.
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button 
            onClick={() => onAccept(assignment.id)}
            className="flex-1"
            size="sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Accept Order
          </Button>
          <Button
            variant="outline"
            onClick={() => onReject(assignment.id)}
            className="flex-1"
            size="sm"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const AssignmentCenter: React.FC = () => {
  const { pendingAssignments, assignmentHistory, loading, acceptAssignment, rejectAssignment } = useRestaurantAssignments();
  const { toast } = useToast();

  const handleAccept = async (assignmentId: string) => {
    try {
      await acceptAssignment(assignmentId);
      toast({
        title: 'Success',
        description: 'Order accepted successfully!'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept assignment',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (assignmentId: string) => {
    try {
      await rejectAssignment(assignmentId, 'Unable to fulfill order');
      toast({
        title: 'Order Rejected',
        description: 'Assignment has been rejected'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject assignment',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Assignments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Order Assignments</CardTitle>
            {pendingAssignments.length > 0 && (
              <Badge variant="destructive">{pendingAssignments.length}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pendingAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No pending assignments</p>
              <p className="text-sm">New order assignments will appear here</p>
              <p className="text-xs mt-2 text-blue-600">
                This includes both traditional orders and nutrition-generated meal plans
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAssignments.map((assignment) => (
                <AssignmentItem
                  key={assignment.id}
                  assignment={assignment}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assignment History</CardTitle>
        </CardHeader>
        <CardContent>
          {assignmentHistory.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No assignment history yet</p>
          ) : (
            <div className="space-y-3">
              {assignmentHistory.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Order Assignment</p>
                    <p className="text-sm text-gray-600">
                      {new Date(assignment.responded_at || assignment.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge 
                    variant={assignment.status === 'accepted' ? 'default' : 
                             assignment.status === 'rejected' ? 'destructive' : 'secondary'}
                  >
                    {assignment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

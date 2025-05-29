
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Timer, AlertTriangle, Package, Utensils } from 'lucide-react';
import { orderAssignmentService } from '@/services/orders/orderAssignmentService';
import { orderRejectionService } from '@/services/restaurant/orderRejectionService';
import { useToast } from '@/hooks/use-toast';
import { OrderRejectionModal } from './OrderRejectionModal';

interface OrderAssignmentCardProps {
  assignment: {
    id: string;
    order_id: string;
    restaurant_id: string;
    expires_at: string;
    assignment_metadata?: any;
    orders: {
      id: string;
      customer_name: string;
      customer_phone: string;
      delivery_address: string;
      total: number;
      created_at: string;
      rejection_count?: number;
      order_items: Array<{
        name: string;
        quantity: number;
        price: number;
        special_instructions?: string;
      }>;
    };
  };
  onResponse: () => void;
}

export const OrderAssignmentCard: React.FC<OrderAssignmentCardProps> = ({
  assignment,
  onResponse
}) => {
  const [loading, setLoading] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const { toast } = useToast();
  const order = assignment.orders;

  const handleAccept = async () => {
    setLoading(true);
    try {
      const success = await orderAssignmentService.handleRestaurantResponse(
        assignment.id,
        assignment.restaurant_id,
        'accept'
      );

      if (success) {
        toast({
          title: 'Order Accepted',
          description: `Order #${order.id.slice(-8)} has been accepted`,
          variant: 'default'
        });
        onResponse();
      } else {
        throw new Error('Failed to accept assignment');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept order',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reason: string, details?: string) => {
    try {
      const result = await orderRejectionService.rejectOrderAssignment(
        assignment.id,
        assignment.restaurant_id,
        reason,
        details
      );

      if (result.success) {
        toast({
          title: 'Order Rejected',
          description: result.message,
          variant: result.reassigned ? 'default' : 'destructive'
        });
        onResponse();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject order',
        variant: 'destructive'
      });
    }
  };

  const timeRemaining = new Date(assignment.expires_at).getTime() - Date.now();
  const minutesRemaining = Math.max(0, Math.floor(timeRemaining / 60000));
  const isExpired = minutesRemaining <= 0;

  // Check if this is a reassignment
  const isReassignment = assignment.assignment_metadata?.reassignment === true;
  const rejectionCount = order.rejection_count || 0;

  // Analyze order complexity for preparation insights
  const getPreparationInsights = () => {
    const insights = [];
    const totalItems = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueItems = order.order_items.length;
    
    if (totalItems > 5) {
      insights.push({ type: 'quantity', message: `High quantity order (${totalItems} items)`, icon: Package });
    }
    
    if (uniqueItems > 3) {
      insights.push({ type: 'variety', message: `Multiple different items (${uniqueItems} varieties)`, icon: Utensils });
    }

    const hasSpecialInstructions = order.order_items.some(item => item.special_instructions);
    if (hasSpecialInstructions) {
      insights.push({ type: 'special', message: 'Contains special instructions', icon: AlertTriangle });
    }

    return insights;
  };

  const preparationInsights = getPreparationInsights();

  return (
    <>
      <Card className={`border-l-4 ${isReassignment ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-orange-500'}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                New Order #{order.id.slice(-8)}
                {isReassignment && (
                  <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Reassigned
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {order.customer_name} • {new Date(order.created_at).toLocaleDateString()}
                {rejectionCount > 0 && (
                  <span className="text-red-600 font-medium ml-2">
                    ({rejectionCount} previous rejection{rejectionCount > 1 ? 's' : ''})
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isExpired ? "destructive" : "outline"} className="flex items-center space-x-1">
                <Timer className="h-3 w-3" />
                <span>{isExpired ? 'Expired' : `${minutesRemaining}m left`}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isReassignment && assignment.assignment_metadata?.previous_rejection_reason && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Previous rejection reason:</strong> {assignment.assignment_metadata.previous_rejection_reason}
                </p>
                {assignment.assignment_metadata?.distance_km && (
                  <p className="text-sm text-yellow-700 mt-1">
                    Distance: {assignment.assignment_metadata.distance_km.toFixed(1)} km
                  </p>
                )}
              </div>
            )}

            {/* Preparation Insights */}
            {preparationInsights.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Order Preparation Notes
                </h5>
                <div className="space-y-1">
                  {preparationInsights.map((insight, index) => {
                    const IconComponent = insight.icon;
                    return (
                      <div key={index} className="flex items-center gap-2 text-sm text-blue-800">
                        <IconComponent className="h-3 w-3" />
                        <span>{insight.message}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Customer Details</h4>
              <p className="text-sm text-gray-600">Phone: {order.customer_phone}</p>
              <p className="text-sm text-gray-600">Address: {order.delivery_address}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Order Items</h4>
              <div className="space-y-2">
                {order.order_items.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.name} x {item.quantity}</span>
                      <span className="font-medium">${item.price.toFixed(2)}</span>
                    </div>
                    {item.special_instructions && (
                      <div className="mt-2 p-2 bg-yellow-100 border border-yellow-200 rounded text-sm">
                        <span className="font-medium text-yellow-800">Special Instructions:</span>
                        <p className="text-yellow-700 mt-1">{item.special_instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center font-medium pt-2 border-t">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Button
                  onClick={handleAccept}
                  disabled={loading || isExpired}
                  className="flex-1"
                >
                  {loading ? (
                    <Clock className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Accept Order
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectionModal(true)}
                  disabled={loading || isExpired}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Order
                </Button>
              </div>
              
              {/* Quick Rejection Reasons */}
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Common rejection reasons:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  <Badge 
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-red-50"
                    onClick={() => setShowRejectionModal(true)}
                  >
                    Missing ingredients
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-red-50"
                    onClick={() => setShowRejectionModal(true)}
                  >
                    Too busy
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-red-50"
                    onClick={() => setShowRejectionModal(true)}
                  >
                    Equipment issues
                  </Badge>
                </div>
              </div>
            </div>

            {isExpired && (
              <div className="text-center text-red-600 text-sm font-medium">
                This assignment has expired
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <OrderRejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onReject={handleReject}
        orderInfo={{
          id: order.id,
          customer_name: order.customer_name,
          total: order.total
        }}
      />
    </>
  );
};

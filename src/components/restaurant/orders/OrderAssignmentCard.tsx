
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Timer } from 'lucide-react';
import { orderAssignmentService } from '@/services/orders/orderAssignmentService';
import { useToast } from '@/components/ui/use-toast';

interface OrderAssignmentCardProps {
  assignment: {
    id: string;
    order_id: string;
    expires_at: string;
    orders: {
      id: string;
      customer_name: string;
      customer_phone: string;
      delivery_address: string;
      total: number;
      created_at: string;
      order_items: Array<{
        name: string;
        quantity: number;
        price: number;
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
  const { toast } = useToast();
  const order = assignment.orders;

  const handleResponse = async (action: 'accept' | 'reject') => {
    setLoading(true);
    try {
      const success = await orderAssignmentService.handleRestaurantResponse(
        assignment.id,
        assignment.restaurant_id,
        action
      );

      if (success) {
        toast({
          title: action === 'accept' ? 'Order Accepted' : 'Order Declined',
          description: `Order #${order.id.slice(-8)} has been ${action}ed`,
          variant: action === 'accept' ? 'default' : 'destructive'
        });
        onResponse();
      } else {
        throw new Error('Failed to respond to assignment');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} order`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const timeRemaining = new Date(assignment.expires_at).getTime() - Date.now();
  const minutesRemaining = Math.max(0, Math.floor(timeRemaining / 60000));

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              New Order #{order.id.slice(-8)}
            </CardTitle>
            <CardDescription>
              {order.customer_name} • {new Date(order.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Timer className="h-3 w-3" />
              <span>{minutesRemaining}m left</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Customer Details</h4>
            <p className="text-sm text-gray-600">Phone: {order.customer_phone}</p>
            <p className="text-sm text-gray-600">Address: {order.delivery_address}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Order Items</h4>
            <div className="space-y-2">
              {order.order_items.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center font-medium pt-2 border-t">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() => handleResponse('accept')}
              disabled={loading || minutesRemaining <= 0}
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
              onClick={() => handleResponse('reject')}
              disabled={loading || minutesRemaining <= 0}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>

          {minutesRemaining <= 0 && (
            <div className="text-center text-red-600 text-sm font-medium">
              This assignment has expired
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

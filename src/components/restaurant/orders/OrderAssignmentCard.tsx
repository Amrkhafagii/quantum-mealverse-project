
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Clock, MapPin, Phone, DollarSign, Package } from 'lucide-react';
import { orderAssignmentService } from '@/services/orders/orderAssignmentService';
import { useToast } from '@/components/ui/use-toast';

interface OrderAssignmentCardProps {
  assignment: any;
  onResponse: () => void;
}

export const OrderAssignmentCard: React.FC<OrderAssignmentCardProps> = ({
  assignment,
  onResponse
}) => {
  const { toast } = useToast();
  const [responding, setResponding] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const handleResponse = async (action: 'accept' | 'reject') => {
    try {
      setResponding(true);
      
      const success = await orderAssignmentService.handleRestaurantResponse(
        assignment.id,
        assignment.restaurant_id,
        action,
        notes || undefined
      );

      if (success) {
        toast({
          title: action === 'accept' ? 'Order Accepted' : 'Order Rejected',
          description: `You have ${action}ed the order assignment.`,
          variant: action === 'accept' ? 'default' : 'destructive'
        });
        onResponse();
      } else {
        throw new Error('Failed to process response');
      }
    } catch (error) {
      console.error('Error responding to assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your response. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setResponding(false);
      setNotes('');
      setShowNotes(false);
    }
  };

  const timeRemaining = new Date(assignment.expires_at).getTime() - new Date().getTime();
  const minutesRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60)));

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            Order #{assignment.orders?.id?.slice(-8)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-orange-600">
              <Clock className="h-3 w-3 mr-1" />
              {minutesRemaining}m left
            </Badge>
            <Badge variant="secondary">New Assignment</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Name:</strong> {assignment.orders?.customer_name}</p>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{assignment.orders?.customer_phone}</span>
              </div>
              <div className="flex items-start gap-1">
                <MapPin className="h-3 w-3 mt-0.5" />
                <span>{assignment.orders?.delivery_address}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span><strong>Total:</strong> ${assignment.orders?.total?.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                <span><strong>Items:</strong> {assignment.orders?.order_items?.length || 0}</span>
              </div>
              <p><strong>Placed:</strong> {new Date(assignment.orders?.created_at).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {assignment.orders?.order_items?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
            <div className="space-y-1">
              {assignment.orders.order_items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        {showNotes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Notes (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this order..."
              rows={3}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => handleResponse('accept')}
            disabled={responding}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {responding ? 'Processing...' : 'Accept Order'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowNotes(!showNotes)}
            disabled={responding}
          >
            {showNotes ? 'Hide Notes' : 'Add Notes'}
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => handleResponse('reject')}
            disabled={responding}
            className="flex-1"
          >
            {responding ? 'Processing...' : 'Reject Order'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

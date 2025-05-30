
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Clock, MapPin, Phone, User, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useOrderAssignment } from '@/hooks/useOrderAssignment';

interface OrderAssignmentCardProps {
  order: {
    id: string;
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    total: number;
    created_at: string;
    status: string;
    order_items?: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  restaurantId: string;
  onAssignmentUpdate?: () => void;
}

export const OrderAssignmentCard: React.FC<OrderAssignmentCardProps> = ({
  order,
  restaurantId,
  onAssignmentUpdate
}) => {
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { acceptOrder, rejectOrder } = useOrderAssignment();

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const success = await acceptOrder(order.id, restaurantId, notes);
      if (success && onAssignmentUpdate) {
        onAssignmentUpdate();
      }
    } catch (error) {
      console.error('Error accepting order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      const success = await rejectOrder(order.id, restaurantId, notes);
      if (success && onAssignmentUpdate) {
        onAssignmentUpdate();
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'restaurant_assigned':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="border-l-4 border-l-quantum-cyan">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              Order #{order.id.substring(0, 8)}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {format(new Date(order.created_at), 'MMM dd, yyyy at h:mm a')}
            </p>
          </div>
          <Badge className={`${getStatusColor(order.status)} text-white`}>
            New Assignment
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Customer Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-quantum-cyan" />
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-quantum-cyan" />
            <span>{order.customer_phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-quantum-cyan" />
            <span className="text-sm">{order.delivery_address}</span>
          </div>
        </div>

        {/* Order Items */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Order Items:</h4>
            <div className="space-y-1">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>EGP {item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Total */}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-medium">Total Amount:</span>
          <span className="text-lg font-bold text-quantum-cyan">
            EGP {order.total}
          </span>
        </div>

        {/* Response Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Response Notes (Optional):
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this order assignment..."
            className="min-h-[80px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isProcessing ? 'Accepting...' : 'Accept Order'}
          </Button>
          <Button
            onClick={handleReject}
            disabled={isProcessing}
            variant="destructive"
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {isProcessing ? 'Rejecting...' : 'Reject Order'}
          </Button>
        </div>

        {/* Time Indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t">
          <Clock className="h-4 w-4" />
          <span>Please respond within 15 minutes to maintain good rating</span>
        </div>
      </CardContent>
    </Card>
  );
};

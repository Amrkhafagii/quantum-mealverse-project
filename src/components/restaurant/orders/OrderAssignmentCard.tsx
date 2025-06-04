import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Clock, MapPin, Phone, User, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useOrderAssignment } from '@/hooks/useOrderAssignment';
import { useOrderContext } from '@/contexts/UnifiedOrderContext';
import { useRestaurantAssignmentContext } from '@/contexts/UnifiedOrderContext';
import { OrderActionConfirmationModal } from './OrderActionConfirmationModal';
import { orderActionToasts } from '@/utils/orderActionToasts';

export const OrderAssignmentCard: React.FC = () => {
  const { order } = useOrderContext();
  const { restaurantId, onAssignmentUpdate, isProcessing: globalProcessing } = useRestaurantAssignmentContext();
  const [notes, setNotes] = useState('');
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    action: 'accept' | 'reject' | null;
  }>({ isOpen: false, action: null });
  const { acceptOrder, rejectOrder, isLoading } = useOrderAssignment();

  // Use global processing state if available, fallback to local loading state
  const processing = globalProcessing ?? isLoading;

  const handleAcceptClick = () => {
    if (!order.customer_name || !order.total) {
      orderActionToasts.error('accept', 'Order information is incomplete');
      return;
    }
    setConfirmationModal({ isOpen: true, action: 'accept' });
  };

  const handleRejectClick = () => {
    if (!order.customer_name) {
      orderActionToasts.error('reject', 'Order information is incomplete');
      return;
    }
    setConfirmationModal({ isOpen: true, action: 'reject' });
  };

  const handleConfirmAction = async () => {
    const { action } = confirmationModal;
    if (!action || !order.id) return;

    try {
      let success = false;
      
      if (action === 'accept') {
        success = await acceptOrder(order.id, restaurantId, notes);
      } else {
        success = await rejectOrder(order.id, restaurantId, notes);
      }

      if (success) {
        orderActionToasts.success(action, order.customer_name);
        setConfirmationModal({ isOpen: false, action: null });
        setNotes(''); // Clear notes after successful action
        
        if (onAssignmentUpdate) {
          onAssignmentUpdate();
        }
      }
    } catch (error) {
      console.error(`Error ${confirmationModal.action}ing order:`, error);
      // Error handling is now done in the hook with centralized toasts
    }
  };

  const closeConfirmationModal = () => {
    if (!processing) {
      setConfirmationModal({ isOpen: false, action: null });
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

  // Validate required order data
  if (!order.id || !order.customer_name || !order.delivery_address) {
    return (
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-6 text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Invalid Order Data</h3>
          <p className="text-red-600">This order is missing required information and cannot be processed.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-l-4 border-l-quantum-cyan">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Order #{order.id.substring(0, 8)}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {format(new Date(order.created_at!), 'MMM dd, yyyy at h:mm a')}
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
            {order.customer_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-quantum-cyan" />
                <span>{order.customer_phone}</span>
              </div>
            )}
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
              disabled={processing}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAcceptClick}
              disabled={processing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {processing ? 'Processing...' : 'Accept Order'}
            </Button>
            <Button
              onClick={handleRejectClick}
              disabled={processing}
              variant="destructive"
              className="flex-1"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {processing ? 'Processing...' : 'Reject Order'}
            </Button>
          </div>

          {/* Time Indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t">
            <Clock className="h-4 w-4" />
            <span>Please respond within 15 minutes to maintain good rating</span>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <OrderActionConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleConfirmAction}
        action={confirmationModal.action!}
        orderTotal={order.total}
        customerName={order.customer_name}
        isProcessing={processing}
      />
    </>
  );
};

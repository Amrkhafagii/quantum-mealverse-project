
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { MapPin, Phone, CreditCard, Clock, Calendar, Package } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { ReturnRequestForm } from './ReturnRequestForm';
import { OrderStatusDisplay } from './OrderStatusDisplay';
import { checkAssignmentStatus } from '@/integrations/webhook';
import { useInterval } from '@/hooks/use-interval';

interface OrderTrackerProps {
  orderId: string;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId }) => {
  const [assignmentStatus, setAssignmentStatus] = React.useState<any>(null);

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *, 
          order_items(*),
          restaurant:restaurants(id, name)
        `)
        .eq('id', orderId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  // More frequent polling when awaiting restaurant response
  const pollingInterval = order && ['pending', 'awaiting_restaurant'].includes(order.status) ? 5000 : null;

  useInterval(() => {
    if (order && ['pending', 'awaiting_restaurant'].includes(order.status)) {
      checkAssignmentStatus(orderId)
        .then(status => {
          setAssignmentStatus(status);
          
          // Always refetch to ensure we have the latest data
          // This ensures we catch status transitions between restaurants
          refetch();
        })
        .catch(err => console.error('Error checking assignment status:', err));
    }
  }, pollingInterval);

  React.useEffect(() => {
    if (orderId && order && ['pending', 'awaiting_restaurant'].includes(order.status)) {
      checkAssignmentStatus(orderId)
        .then(status => {
          setAssignmentStatus(status);
          if (status.status !== assignmentStatus?.status) {
            refetch();
          }
        })
        .catch(err => console.error('Error checking initial assignment status:', err));
    }
  }, [orderId, order, assignmentStatus?.status]);
  
  if (isLoading || !order) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">Loading order details...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            Order #{order.formatted_order_id || order.id.substring(0, 8)}
          </CardTitle>
          <OrderStatusBadge status={order.status} />
        </div>
        <CardDescription>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="pt-0 pb-4">
            <OrderStatusDisplay 
              order={order} 
              assignmentStatus={assignmentStatus}
              onOrderUpdate={refetch}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Delivery Address</h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-quantum-cyan mt-0.5" />
                <div>
                  <p>{order.customer_name}</p>
                  <p>{order.delivery_address}</p>
                  <p>{order.city}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Order Info</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-quantum-cyan" />
                  <span>{order.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-quantum-cyan" />
                  <span>{order.payment_method}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-quantum-cyan" />
                  <span>{order.delivery_method}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-medium mb-4">Order Status</h3>
            <OrderStatusTimeline orderId={orderId} />
          </div>
          
          <div className="pt-2">
            <h3 className="text-lg font-medium mb-4">Order Items</h3>
            <div className="space-y-2">
              {order.order_items && order.order_items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-quantum-cyan font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between pt-2">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>${order.delivery_fee.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Total:</span>
                <span className="text-quantum-cyan">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {order.status === 'delivered' && !order.return_status && (
            <div className="pt-4">
              <ReturnRequestForm orderId={orderId} />
            </div>
          )}
          
          {order.return_status && (
            <div className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Return Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>Status: <OrderStatusBadge status={order.return_status} /></p>
                    {order.return_reason && (
                      <p>Reason: {order.return_reason}</p>
                    )}
                    {order.refund_status && (
                      <p>Refund Status: <OrderStatusBadge status={order.refund_status} /></p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

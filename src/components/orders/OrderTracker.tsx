
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { MapPin, Phone, CreditCard, Clock, Calendar, Package, CheckCircle2 } from 'lucide-react';

interface OrderTrackerProps {
  orderId: string;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId }) => {
  const { data: order, isLoading } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
  
  if (isLoading || !order) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">Loading order details...</div>
        </CardContent>
      </Card>
    );
  }
  
  const orderStatuses = [
    { key: 'pending', label: 'Order Received', icon: Package },
    { key: 'processing', label: 'Preparing', icon: Package },
    { key: 'on_the_way', label: 'On The Way', icon: MapPin },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];
  
  // Find the current status index
  const currentStatusIndex = orderStatuses.findIndex(status => status.key === order.status);
  
  const getStatusColor = (index: number) => {
    if (index < currentStatusIndex) return 'text-green-500';
    if (index === currentStatusIndex) return 'text-quantum-cyan';
    return 'text-gray-500';
  };
  
  const getLineColor = (index: number) => {
    if (index < currentStatusIndex) return 'bg-green-500';
    return 'bg-gray-500 bg-opacity-30';
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
          <Badge className={
            order.status === 'pending' ? 'bg-yellow-500' : 
            order.status === 'processing' ? 'bg-blue-500' : 
            order.status === 'on_the_way' ? 'bg-purple-500' : 
            order.status === 'delivered' ? 'bg-green-500' : 'bg-red-500'
          }>
            {order.status.replace('_', ' ')}
          </Badge>
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
            
            <div className="space-y-0">
              {orderStatuses.map((status, index) => (
                <div key={status.key} className="flex items-start">
                  <div className="flex flex-col items-center">
                    <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                      index <= currentStatusIndex ? 'border-quantum-cyan' : 'border-gray-500 border-opacity-50'
                    }`}>
                      <status.icon className={`h-4 w-4 ${getStatusColor(index)}`} />
                    </div>
                    {index < orderStatuses.length - 1 && (
                      <div className={`w-0.5 h-12 ${getLineColor(index)}`} />
                    )}
                  </div>
                  
                  <div className="ml-4 pb-8">
                    <h4 className={`font-medium ${getStatusColor(index)}`}>
                      {status.label}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {index < currentStatusIndex 
                        ? 'Completed' 
                        : index === currentStatusIndex 
                          ? 'In Progress' 
                          : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-2">
            <h3 className="text-lg font-medium mb-4">Order Items</h3>
            <div className="space-y-2">
              {order.order_items.map((item: any) => (
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
        </div>
      </CardContent>
    </Card>
  );
};

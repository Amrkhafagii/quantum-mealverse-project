
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { ReturnRequestForm } from './ReturnRequestForm';
import { OrderStatusDisplay } from './OrderStatusDisplay';
import { OrderDetailsGrid } from './OrderDetailsGrid';
import { OrderItemsList } from './OrderItemsList';
import { useOrderData } from '@/hooks/useOrderData';
import { checkAssignmentStatus } from '@/services/orders/webhookService';
import { useInterval } from '@/hooks/use-interval';
import OrderLocationMap from './OrderLocationMap';
import MapContainer from '../maps/MapContainer';

interface OrderTrackerProps {
  orderId: string;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId }) => {
  const [assignmentStatus, setAssignmentStatus] = React.useState<any>(null);
  const { data: order, isLoading, error, refetch } = useOrderData(orderId);

  React.useEffect(() => {
    if (orderId && order && ['pending', 'awaiting_restaurant'].includes(order.status)) {
      checkAssignmentStatus(orderId)
        .then(status => {
          setAssignmentStatus(status);
        })
        .catch(() => {});
    }
  }, [orderId, order?.status]);

  useInterval(() => {
    if (order && ['pending', 'awaiting_restaurant'].includes(order.status)) {
      checkAssignmentStatus(orderId)
        .then(status => {
          setAssignmentStatus(status);
          refetch();
        })
        .catch(() => {});
    }
  }, 5000);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">Loading order details...</div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 space-y-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p>There was an error loading your order details.</p>
            <p className="text-sm text-gray-500">Please try again later or contact support.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">Order not found</div>
        </CardContent>
      </Card>
    );
  }

  // Prepare locations for the map if order is being delivered
  let driverLocation, restaurantLocation, customerLocation;
  
  if (order.latitude && order.longitude) {
    customerLocation = {
      latitude: order.latitude,
      longitude: order.longitude,
      title: "Delivery Address",
      type: "customer"
    };
  }

  if (order.restaurant?.latitude && order.restaurant?.longitude) {
    restaurantLocation = {
      latitude: order.restaurant.latitude,
      longitude: order.restaurant.longitude,
      title: order.restaurant.name,
      type: "restaurant"
    };
  }

  const showMap = ['preparing', 'ready_for_pickup', 'picked_up', 'on_the_way'].includes(order.status);

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
            
            {/* Add map for orders that are being prepared, picked up or on the way */}
            {showMap && (
              <div className="mt-4">
                {order.latitude && order.longitude ? (
                  <OrderLocationMap order={order} />
                ) : (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-muted-foreground">Location tracking unavailable</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          <OrderDetailsGrid order={order} />
          
          <div className="pt-4">
            <h3 className="text-lg font-medium mb-4">Order Status</h3>
            <OrderStatusTimeline orderId={orderId} />
          </div>
          
          <div className="pt-2">
            <h3 className="text-lg font-medium mb-4">Order Items</h3>
            <OrderItemsList 
              items={order.order_items}
              subtotal={order.subtotal}
              deliveryFee={order.delivery_fee}
              total={order.total}
            />
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

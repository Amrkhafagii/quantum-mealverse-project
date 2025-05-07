
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
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/webhook';
import { fixOrderStatus } from '@/utils/orderStatusFix';

interface OrderTrackerProps {
  orderId: string;
}

// Define a more complete restaurant type
interface RestaurantWithLocation {
  id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId }) => {
  const [assignmentStatus, setAssignmentStatus] = React.useState<any>(null);
  const [isFixingOrderStatus, setIsFixingOrderStatus] = React.useState(false);
  const [deliveryAssignmentId, setDeliveryAssignmentId] = React.useState<string | null>(null);
  const { data: order, isLoading, error, refetch } = useOrderData(orderId);

  // Find the delivery assignment ID for this order
  React.useEffect(() => {
    if (orderId && ['preparing', 'ready_for_pickup', 'on_the_way', 'picked_up'].includes(order?.status || '')) {
      // Fetch the active delivery assignment for this order
      const fetchDeliveryAssignment = async () => {
        try {
          const { data, error } = await supabase
            .from('delivery_assignments')
            .select('id')
            .eq('order_id', orderId)
            .in('status', ['assigned', 'picked_up', 'on_the_way'])
            .maybeSingle();
            
          if (!error && data) {
            console.log('Found delivery assignment for tracking:', data.id);
            setDeliveryAssignmentId(data.id);
          } else {
            console.log('No active delivery assignment found for order:', orderId);
            setDeliveryAssignmentId(null);
          }
        } catch (err) {
          console.error('Error fetching delivery assignment:', err);
        }
      };
      
      fetchDeliveryAssignment();
    }
  }, [orderId, order?.status]);

  // Check for restaurant assignments that might be accepted but order status is still pending
  React.useEffect(() => {
    const checkAndFixOrderStatus = async () => {
      if (order && ['pending', 'awaiting_restaurant', 'restaurant_assigned'].includes(order.status)) {
        try {
          setIsFixingOrderStatus(true);
          // Try to fix the order status using our enhanced utility
          const fixed = await fixOrderStatus(orderId);
          
          if (fixed) {
            console.log('Successfully fixed order status with utility');
            await refetch();
          }
          
          setIsFixingOrderStatus(false);
        } catch (e) {
          console.error('Error in checkAndFixOrderStatus:', e);
          setIsFixingOrderStatus(false);
        }
      }
    };
    
    checkAndFixOrderStatus();
  }, [order, orderId, refetch]);

  React.useEffect(() => {
    if (orderId && order && ['pending', 'awaiting_restaurant', 'restaurant_assigned'].includes(order.status)) {
      checkAssignmentStatus(orderId)
        .then(status => {
          setAssignmentStatus(status);
        })
        .catch(() => {});
    }
  }, [orderId, order?.status]);

  useInterval(() => {
    if (order && ['pending', 'awaiting_restaurant', 'restaurant_assigned', 'restaurant_accepted', 'preparing', 'ready_for_pickup'].includes(order.status)) {
      checkAssignmentStatus(orderId)
        .then(status => {
          setAssignmentStatus(status);
          refetch();
        })
        .catch(() => {});
    }
  }, 5000);
  
  if (isLoading || isFixingOrderStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">{isFixingOrderStatus ? 'Fixing order status...' : 'Loading order details...'}</div>
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

  // Type guard to check if restaurant has location data
  const hasRestaurantLocation = 
    order.restaurant && 
    'latitude' in order.restaurant && 
    'longitude' in order.restaurant &&
    order.restaurant.latitude !== null &&
    order.restaurant.longitude !== null;

  if (hasRestaurantLocation) {
    const typedRestaurant = order.restaurant as RestaurantWithLocation;
    restaurantLocation = {
      latitude: typedRestaurant.latitude!,
      longitude: typedRestaurant.longitude!,
      title: typedRestaurant.name,
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
                  <OrderLocationMap 
                    order={order} 
                    assignmentId={deliveryAssignmentId} 
                  />
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

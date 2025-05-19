
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { ReturnRequestForm } from './ReturnRequestForm';
import OrderStatusDisplay from './status/OrderStatusDisplay'; // Fixed import
import { OrderDetailsGrid } from './OrderDetailsGrid';
import { OrderItemsList } from './OrderItemsList';
import { useOrderData } from '@/hooks/useOrderData';
import { checkAssignmentStatus } from '@/services/orders/webhookService';
import { useInterval } from '@/hooks/use-interval';
import OrderLocationMap from './OrderLocationMap';
import { supabase } from '@/integrations/supabase/client';
import { fixOrderStatus } from '@/utils/orderStatusFix';
import { Platform } from '@/utils/platform';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { OrderStatusListener } from './status/OrderStatusListener';
import { NotificationPermissionPrompt } from '../notifications/NotificationPermissionPrompt';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { MobileStatusDebug } from './status/MobileStatusDebug';

// Define a more complete restaurant type
interface RestaurantWithLocation {
  id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface OrderTrackerProps {
  orderId: string;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId }) => {
  const [assignmentStatus, setAssignmentStatus] = React.useState<any>(null);
  const [isFixingOrderStatus, setIsFixingOrderStatus] = React.useState(false);
  const [deliveryAssignmentId, setDeliveryAssignmentId] = React.useState<string | null>(null);
  const { data: order, isLoading, error, refetch } = useOrderData(orderId);
  const { isOnline } = useConnectionStatus();
  const isMobile = Platform.isNative();
  
  // Find the delivery assignment ID for this order
  React.useEffect(() => {
    if (!orderId || !isOnline || !['preparing', 'ready_for_pickup', 'picked_up', 'on_the_way'].includes(order?.status || '')) {
      return;
    }

    // Fetch the active delivery assignment for this order
    const fetchDeliveryAssignment = async () => {
      try {
        const { data, error } = await supabase
          .from('delivery_assignments')
          .select('id, status')
          .eq('order_id', orderId)
          .in('status', ['assigned', 'picked_up', 'on_the_way', 'delivered'])
          .maybeSingle();
          
        if (!error && data) {
          console.log('Found delivery assignment for tracking:', data.id, 'with status:', data.status);
          setDeliveryAssignmentId(data.id);
          
          // Extra check: ensure order status and delivery assignment status are in sync
          const statusMap: Record<string, string> = {
            'picked_up': 'picked_up',
            'on_the_way': 'on_the_way',
            'delivered': 'delivered'
          };
          
          // If delivery status doesn't match order status, fix it
          if (statusMap[data.status] && order?.status !== statusMap[data.status]) {
            console.log(`Status mismatch detected - delivery: ${data.status}, order: ${order?.status}`);
            await fixOrderStatus(orderId);
            await refetch();
          }
        } else {
          console.log('No active delivery assignment found for order:', orderId);
          setDeliveryAssignmentId(null);
        }
      } catch (err) {
        console.error('Error fetching delivery assignment:', err);
      }
    };
    
    fetchDeliveryAssignment();
  }, [orderId, order?.status, refetch, isOnline]);

  // Check for restaurant assignments that might be accepted but order status is still pending
  React.useEffect(() => {
    const checkAndFixOrderStatus = async () => {
      if (order && ['pending', 'awaiting_restaurant', 'restaurant_assigned', 'picked_up', 'on_the_way'].includes(order.status)) {
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
  }, [order, orderId, refetch, isOnline]);

  React.useEffect(() => {
    if (orderId && order && ['pending', 'awaiting_restaurant', 'restaurant_assigned'].includes(order.status) && isOnline) {
      checkAssignmentStatus(orderId)
        .then(status => {
          setAssignmentStatus(status);
        })
        .catch(() => {});
    }
  }, [orderId, order?.status, isOnline]);

  useInterval(() => {
    if (order && 
        ['pending', 'awaiting_restaurant', 'restaurant_assigned', 'restaurant_accepted', 'preparing', 'ready_for_pickup', 'picked_up', 'on_the_way'].includes(order.status) && 
        isOnline) {
      checkAssignmentStatus(orderId)
        .then(status => {
          setAssignmentStatus(status);
          refetch();
        })
        .catch(() => {});
    }
  }, isOnline ? 5000 : null); // Only poll when online
  
  // Handler for pull-to-refresh
  const handleRefresh = async () => {
    if (!isOnline) {
      return;
    }
    
    try {
      await fixOrderStatus(orderId);
      await refetch();
      
      // Also refresh assignment status
      const status = await checkAssignmentStatus(orderId);
      setAssignmentStatus(status);
    } catch (error) {
      console.error('Error refreshing order data:', error);
    }
  };

  if (isLoading || isFixingOrderStatus) {
    return (
      <Card className={isMobile ? 'mx-0 rounded-lg shadow-lg' : ''}>
        <CardContent className={`p-6 flex justify-center items-center ${isMobile ? 'min-h-[200px]' : ''}`}>
          <div className="text-center py-8">{isFixingOrderStatus ? 'Fixing order status...' : 'Loading order details...'}</div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !isOnline) {
    return (
      <Card className={isMobile ? 'mx-0 rounded-lg shadow-lg' : ''}>
        <CardContent className="p-6">
          <div className="text-center py-8 space-y-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p>{!isOnline ? 'You are currently offline' : 'There was an error loading your order details.'}</p>
            <p className="text-sm text-gray-500">
              {!isOnline ? 'Please check your connection and try again' : 'Please try again later or contact support.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className={isMobile ? 'mx-0 rounded-lg shadow-lg' : ''}>
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

  // Wrap content in PullToRefresh for mobile
  const content = (
    <Card className={`h-full ${isMobile ? 'mx-0 rounded-lg shadow-lg' : ''}`}>
      <CardHeader className={isMobile ? 'px-3 py-4' : ''}>
        <div className="flex justify-between items-center">
          <CardTitle className={isMobile ? 'text-lg' : ''}>
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
      
      <CardContent className={isMobile ? 'px-3 py-2' : ''}>
        {/* Add notification permission prompt for mobile users */}
        {isMobile && (
          <div className="mb-4">
            <NotificationPermissionPrompt variant="inline" />
          </div>
        )}

        <div className="space-y-6">
          <div className="pt-0 pb-4">
            <OrderStatusDisplay 
              order={order} 
              assignmentStatus={assignmentStatus}
              onOrderUpdate={() => {
                refetch();
                hapticFeedback.medium();
              }}
            />
            
            {/* Add order status listener for notifications */}
            {isMobile && <OrderStatusListener orderId={orderId} order={order} />}
            
            {/* Add map for orders that are being prepared, picked up or on the way */}
            {showMap && (
              <div className={`mt-4 ${isMobile ? 'h-[250px] rounded-lg overflow-hidden' : ''}`}>
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
          
          <div className={`pt-4 ${isMobile ? 'pb-16' : ''}`}>
            <h3 className={`font-medium mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>Order Status</h3>
            <OrderStatusTimeline orderId={orderId} />
          </div>
          
          <div className="pt-2">
            <h3 className={`font-medium mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>Order Items</h3>
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
          
          {/* Add simplified debug component for mobile */}
          {isMobile && process.env.NODE_ENV === 'development' && (
            <MobileStatusDebug 
              orderId={orderId}
              onStatusFixed={refetch}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
  
  // Use PullToRefresh only on mobile
  return isMobile ? (
    <PullToRefresh onRefresh={handleRefresh} disabled={!isOnline}>
      {content}
    </PullToRefresh>
  ) : content;
};


import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Platform } from '@/utils/platform';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { getRestaurantOrders } from '@/services/restaurant/orderService';
import { RestaurantOrder, OrderStatus } from '@/types/restaurant';

interface OrderManagementProps {
  restaurantId: string;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ restaurantId }) => {
  const [activeTab, setActiveTab] = useState('incoming');
  const { isOnline } = useConnectionStatus();
  const isMobile = Platform.isNative() || window.innerWidth < 768;
  
  // Fetch orders with React Query
  const { 
    data: orders = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['restaurant-orders', restaurantId],
    queryFn: () => getRestaurantOrders(restaurantId),
    enabled: isOnline && !!restaurantId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
  
  // Filter orders based on active tab
  const incomingOrders = orders.filter(order => 
    order.status === OrderStatus.AWAITING_RESTAURANT || 
    order.status === OrderStatus.PENDING || 
    order.status === OrderStatus.RESTAURANT_ASSIGNED
  );
  
  const preparingOrders = orders.filter(order => 
    order.status === OrderStatus.RESTAURANT_ACCEPTED || 
    order.status === OrderStatus.PREPARING
  );
  
  const readyOrders = orders.filter(order => 
    order.status === OrderStatus.READY_FOR_PICKUP || 
    order.status === OrderStatus.PICKED_UP || 
    order.status === OrderStatus.ON_THE_WAY
  );
  
  const completedOrders = orders.filter(order => 
    order.status === OrderStatus.DELIVERED
  );
  
  // Check for new orders periodically when online
  useEffect(() => {
    if (!isOnline) return;
    
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [isOnline, refetch]);
  
  // Handle offline mode
  useEffect(() => {
    if (!isOnline) {
      // Show cached orders or offline message
    }
  }, [isOnline]);
  
  if (isLoading) {
    return <div className="p-4">Loading orders...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500">Error loading orders</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Order Management</h2>
        <div className="flex gap-2">
          <Badge variant="outline">{orders.length} Orders</Badge>
        </div>
      </div>
      
      <Tabs defaultValue="incoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={isMobile ? "w-full grid grid-cols-4" : ""}>
          <TabsTrigger value="incoming">
            Incoming {incomingOrders.length > 0 && `(${incomingOrders.length})`}
          </TabsTrigger>
          <TabsTrigger value="preparing">
            Preparing {preparingOrders.length > 0 && `(${preparingOrders.length})`}
          </TabsTrigger>
          <TabsTrigger value="ready">
            Ready {readyOrders.length > 0 && `(${readyOrders.length})`}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming" className="mt-4">
          {incomingOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center p-6 text-gray-500">No incoming orders</div>
          )}
        </TabsContent>
        
        <TabsContent value="preparing" className="mt-4">
          {preparingOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {preparingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center p-6 text-gray-500">No orders being prepared</div>
          )}
        </TabsContent>
        
        <TabsContent value="ready" className="mt-4">
          {readyOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center p-6 text-gray-500">No orders ready for pickup</div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          {completedOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center p-6 text-gray-500">No completed orders</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Order Card Component
interface OrderCardProps {
  order: RestaurantOrder;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">
            Order #{order.formatted_order_id || order.id.substring(0, 8)}
          </CardTitle>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Customer:</span> {order.customer_name}</p>
          <p><span className="font-medium">Items:</span> {order.order_items?.length || 0}</p>
          <p><span className="font-medium">Total:</span> ${order.total.toFixed(2)}</p>
          <p><span className="font-medium">Delivery:</span> {order.delivery_method}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Order Status Badge Component
interface OrderStatusBadgeProps {
  status: OrderStatus | string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  let variant: 
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "success" = "default";
  
  switch (status) {
    case OrderStatus.PENDING:
    case OrderStatus.AWAITING_RESTAURANT:
    case OrderStatus.RESTAURANT_ASSIGNED:
      variant = "secondary";
      break;
    case OrderStatus.RESTAURANT_ACCEPTED:
    case OrderStatus.PREPARING:
      variant = "default";
      break;
    case OrderStatus.READY_FOR_PICKUP:
    case OrderStatus.PICKED_UP:
    case OrderStatus.ON_THE_WAY:
      variant = "success";
      break;
    case OrderStatus.DELIVERED:
      variant = "outline";
      break;
    case OrderStatus.CANCELLED:
    case OrderStatus.RESTAURANT_REJECTED:
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }
  
  // Format the status for display
  let displayStatus = status.replace(/_/g, ' ');
  displayStatus = displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1);
  
  return (
    <Badge variant={variant as any}>
      {displayStatus}
    </Badge>
  );
};

export default OrderManagement;

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { supabase } from '@/integrations/supabase/client';
import { RestaurantOrder, OrderStatus } from '@/types/restaurant';
import { RefreshCcw } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { getRestaurantOrders } from '@/services/restaurant/orderService';
import { updateOrderStatus } from '@/services/restaurant/orderService';

export const RestaurantDashboard = () => {
  const { restaurant, loading } = useRestaurantAuth();
  const [pendingOrders, setPendingOrders] = useState<RestaurantOrder[]>([]);
  const [activeOrders, setActiveOrders] = useState<RestaurantOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<RestaurantOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (!restaurant) return;
    
    setLoadingOrders(true);
    try {
      console.log('Fetching orders for restaurant:', restaurant.id);
      
      // Get all pending assignments first to debug
      const { data: pendingAssignments, error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .select('*')
        .eq('restaurant_id', restaurant.id);
        
      if (assignmentError) {
        console.error('Error fetching assignments:', assignmentError);
      } else {
        console.log('All restaurant assignments:', pendingAssignments);
      }
      
      // Use the orderService to fetch pending orders
      const pendingOrdersData = await getRestaurantOrders(
        restaurant.id,
        [OrderStatus.AWAITING_RESTAURANT, OrderStatus.RESTAURANT_ASSIGNED, OrderStatus.PENDING]
      );
      console.log('Pending orders:', pendingOrdersData);
      setPendingOrders(pendingOrdersData);
      
      // Fetch active orders
      const activeOrdersData = await getRestaurantOrders(
        restaurant.id,
        [OrderStatus.RESTAURANT_ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP, OrderStatus.ON_THE_WAY]
      );
      console.log('Active orders:', activeOrdersData);
      setActiveOrders(activeOrdersData);
      
      // Fetch completed orders
      const completedOrdersData = await getRestaurantOrders(
        restaurant.id,
        [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUNDED]
      );
      console.log('Completed orders:', completedOrdersData);
      setCompletedOrders(completedOrdersData);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurant orders",
        variant: "destructive"
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (restaurant) {
      fetchOrders();
    }
  }, [restaurant]);

  useEffect(() => {
    if (!restaurant) return;
    
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [restaurant]);

  useEffect(() => {
    if (!restaurant) return;
    
    const channel = supabase
      .channel('restaurant-orders')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurant.id}`,
      }, (payload) => {
        console.log('Order updated:', payload);
        fetchOrders();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurant.id}`,
      }, (payload) => {
        console.log('New order:', payload);
        fetchOrders();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant]);

  if (loading || !restaurant) {
    return <div className="p-4 text-center">Loading restaurant data...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{restaurant.name} Dashboard</h1>
        <Button variant="outline" onClick={fetchOrders} disabled={loadingOrders}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Requests</CardTitle>
            <CardDescription>Orders awaiting your response</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Orders</CardTitle>
            <CardDescription>Orders you are currently preparing</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed Today</CardTitle>
            <CardDescription>Orders delivered today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {completedOrders.filter(order => 
                order.status === OrderStatus.DELIVERED &&
                new Date(order.updated_at).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="pending">
            Pending Requests ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active Orders ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loadingOrders ? (
            <Card>
              <CardContent className="pt-6 text-center">
                Loading pending orders...
              </CardContent>
            </Card>
          ) : pendingOrders.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                No pending orders at this time.
              </CardContent>
            </Card>
          ) : (
            pendingOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                type="pending"
                onRefresh={fetchOrders}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {loadingOrders ? (
            <Card>
              <CardContent className="pt-6 text-center">
                Loading active orders...
              </CardContent>
            </Card>
          ) : activeOrders.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                No active orders at this time.
              </CardContent>
            </Card>
          ) : (
            activeOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                type="active"
                onRefresh={fetchOrders}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {loadingOrders ? (
            <Card>
              <CardContent className="pt-6 text-center">
                Loading completed orders...
              </CardContent>
            </Card>
          ) : completedOrders.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                No completed orders to show.
              </CardContent>
            </Card>
          ) : (
            completedOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                type="completed"
                onRefresh={fetchOrders}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface OrderCardProps {
  order: RestaurantOrder;
  type: 'pending' | 'active' | 'completed';
  onRefresh: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, type, onRefresh }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { restaurant } = useRestaurantAuth();

  const handleOrderAction = async (action: string) => {
    if (!restaurant || !restaurant.id) {
      toast({
        title: "Error",
        description: "Restaurant information is missing",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      let status: OrderStatus;
      
      switch (action) {
        case 'accept':
          status = OrderStatus.RESTAURANT_ACCEPTED;
          break;
        case 'reject':
          status = OrderStatus.RESTAURANT_REJECTED;
          break;
        case 'prepare':
          status = OrderStatus.PREPARING;
          break;
        case 'ready':
          status = OrderStatus.READY_FOR_PICKUP;
          break;
        case 'deliver':
          status = OrderStatus.ON_THE_WAY;
          break;
        case 'complete':
          status = OrderStatus.DELIVERED;
          break;
        default:
          throw new Error('Invalid action');
      }
      
      // Get the assignment ID if this is an accept/reject action
      let assignmentId = null;
      if (action === 'accept' || action === 'reject') {
        // Find the assignment for this order
        const { data: assignments, error: assignmentError } = await supabase
          .from('restaurant_assignments')
          .select('id')
          .eq('order_id', order.id)
          .eq('restaurant_id', restaurant.id)
          .eq('status', 'pending')
          .maybeSingle();
          
        if (assignmentError) {
          console.error('Error finding assignment:', assignmentError);
          throw new Error('Error fetching restaurant assignment');
        }
        
        if (!assignments) {
          console.error('No pending assignment found for this restaurant and order');
          throw new Error('No pending assignment found for this restaurant. The assignment may have expired or been cancelled.');
        }
        
        assignmentId = assignments.id;
      }
      
      console.log(`Updating order ${order.id} to status ${status} with restaurant ${restaurant.id}`);
      
      // Use the orderService to update the status
      const success = await updateOrderStatus(
        order.id,
        status,
        restaurant.id,
        assignmentId ? { assignment_id: assignmentId } : undefined
      );
      
      if (!success) {
        throw new Error('Failed to update order status');
      }
      
      toast({
        title: "Success",
        description: `Order ${action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'updated'} successfully.`
      });
      
      onRefresh();
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: error.message || 'An error occurred while updating the order',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card key={order.id}>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
            <CardDescription>
              {new Date(order.created_at).toLocaleString()}
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="font-bold">${order.total.toFixed(2)}</span>
            <CardDescription>
              Status: {order.status.replace('_', ' ').toUpperCase()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-1">Customer Details</h3>
            <p>{order.customer_name}</p>
            <p>{order.customer_phone}</p>
            <p className="text-sm text-gray-500">{order.delivery_address}</p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Order Items</h3>
            <ul className="space-y-1">
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map(item => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))
              ) : (
                <li>No items</li>
              )}
            </ul>
          </div>
        </div>
        
        {type === 'pending' && (
          <div className="flex space-x-2 mt-4">
            <Button 
              className="w-1/2" 
              onClick={() => handleOrderAction('accept')}
              disabled={isProcessing}
            >
              Accept Order
            </Button>
            <Button 
              className="w-1/2" 
              variant="destructive" 
              onClick={() => handleOrderAction('reject')}
              disabled={isProcessing}
            >
              Reject Order
            </Button>
          </div>
        )}
        
        {type === 'active' && (
          <div className="flex space-x-2 mt-4">
            {order.status === OrderStatus.RESTAURANT_ACCEPTED && (
              <Button 
                className="w-full" 
                onClick={() => handleOrderAction('prepare')}
                disabled={isProcessing}
              >
                Start Preparing
              </Button>
            )}
            {order.status === OrderStatus.PREPARING && (
              <Button 
                className="w-full" 
                onClick={() => handleOrderAction('ready')}
                disabled={isProcessing}
              >
                Mark as Ready
              </Button>
            )}
            {order.status === OrderStatus.READY_FOR_PICKUP && (
              <Button 
                className="w-full" 
                onClick={() => handleOrderAction('deliver')}
                disabled={isProcessing}
              >
                Start Delivery
              </Button>
            )}
            {order.status === OrderStatus.ON_THE_WAY && (
              <Button 
                className="w-full" 
                onClick={() => handleOrderAction('complete')}
                disabled={isProcessing}
              >
                Mark as Delivered
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

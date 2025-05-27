
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, CheckCircle, XCircle, Package, Bell } from 'lucide-react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { orderAssignmentService } from '@/services/orders/orderAssignmentService';
import { orderNotificationService } from '@/services/notifications/orderNotificationService';
import { OrderAssignmentCard } from './OrderAssignmentCard';

interface RestaurantOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  status: string;
  total: number;
  created_at: string;
  order_items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export const OrderManagement = () => {
  const { restaurant } = useRestaurantAuth();
  const { toast } = useToast();
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (restaurant?.id) {
      loadData();
      setupRealtimeSubscriptions();
    }
  }, [restaurant?.id]);

  const loadData = async () => {
    if (!restaurant?.id) return;

    try {
      setLoading(true);
      
      // Load pending assignments
      const assignments = await orderAssignmentService.getRestaurantPendingAssignments(restaurant.id);
      setPendingAssignments(assignments);

      // Load active orders (accepted by this restaurant)
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_email,
          customer_phone,
          delivery_address,
          status,
          total,
          created_at,
          order_items(*)
        `)
        .eq('restaurant_id', restaurant.id)
        .in('status', ['restaurant_accepted', 'preparing', 'ready_for_pickup', 'on_the_way'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      } else {
        setActiveOrders(orders || []);
      }
    } catch (error) {
      console.error('Error in loadData:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!restaurant?.id) return;

    return orderNotificationService.subscribeToRestaurantNotifications(
      restaurant.id,
      (notification) => {
        toast({
          title: notification.title,
          description: notification.message,
        });
      },
      (assignment) => {
        // New assignment received
        loadData();
        toast({
          title: "New Order Assignment",
          description: "You have received a new order to review",
        });
      }
    );
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!restaurant?.id) return;

    try {
      setUpdatingOrder(orderId);
      
      const success = await orderAssignmentService.updateOrderStatus(orderId, newStatus, restaurant.id);

      if (success) {
        await loadData();
        toast({
          title: "Success",
          description: `Order status updated to ${newStatus.replace('_', ' ')}`,
        });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'restaurant_accepted': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready_for_pickup': return 'bg-purple-100 text-purple-800';
      case 'on_the_way': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'restaurant_accepted': return <CheckCircle className="h-4 w-4" />;
      case 'preparing': return <Package className="h-4 w-4" />;
      case 'ready_for_pickup': return <Package className="h-4 w-4" />;
      case 'on_the_way': return <Package className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
          <span className="ml-2 text-quantum-cyan">Loading orders...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Pending Assignments</h3>
            <Badge variant="destructive">{pendingAssignments.length}</Badge>
          </div>
          <div className="grid gap-4">
            {pendingAssignments.map((assignment) => (
              <OrderAssignmentCard
                key={assignment.id}
                assignment={assignment}
                onResponse={loadData}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active Orders */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Active Orders</h3>
        {activeOrders.length === 0 ? (
          <Card className="p-6">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Orders</h3>
              <p className="text-gray-600">Active orders will appear here once you accept assignments.</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                      <CardDescription>
                        {order.customer_name} • {new Date(order.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Customer Details</h4>
                      <p className="text-sm text-gray-600">Email: {order.customer_email}</p>
                      <p className="text-sm text-gray-600">Phone: {order.customer_phone}</p>
                      <p className="text-sm text-gray-600">Address: {order.delivery_address}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span>{item.name} x {item.quantity}</span>
                            <span>${item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center font-medium pt-2 border-t">
                        <span>Total</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {order.status === 'restaurant_accepted' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        disabled={updatingOrder === order.id}
                        size="sm"
                      >
                        {updatingOrder === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Start Preparing
                      </Button>
                    )}

                    {order.status === 'preparing' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'ready_for_pickup')}
                        disabled={updatingOrder === order.id}
                        size="sm"
                      >
                        Mark Ready for Pickup
                      </Button>
                    )}

                    {order.status === 'ready_for_pickup' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'on_the_way')}
                        disabled={updatingOrder === order.id}
                        size="sm"
                      >
                        Mark as On The Way
                      </Button>
                    )}

                    {order.status === 'on_the_way' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        disabled={updatingOrder === order.id}
                        size="sm"
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { useRestaurantOrders } from '@/hooks/useRestaurantOrders';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  id: string;
  meal_id: string;
  quantity: number;
  name: string;
  price: number;
}

interface RestaurantOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

export const OrderManagement = () => {
  const { restaurant } = useRestaurantAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (restaurant?.id) {
      loadOrders();
    }
  }, [restaurant?.id]);

  const loadOrders = async () => {
    if (!restaurant?.id) return;

    try {
      setLoading(true);
      
      // Get orders for this restaurant
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_email,
          customer_phone,
          delivery_address,
          status,
          total,
          created_at
        `)
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          if (itemsError) {
            console.error('Error fetching order items:', itemsError);
            return { ...order, order_items: [] };
          }

          return {
            ...order,
            order_items: itemsData || []
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'restaurant_accepted': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready_for_pickup': return 'bg-purple-100 text-purple-800';
      case 'on_the_way': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'restaurant_accepted': return <CheckCircle className="h-4 w-4" />;
      case 'preparing': return <Package className="h-4 w-4" />;
      case 'ready_for_pickup': return <Package className="h-4 w-4" />;
      case 'on_the_way': return <Package className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
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

  if (orders.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
          <p className="text-gray-600">Orders will appear here once customers start placing them.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {orders.map((order) => (
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

                {order.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'restaurant_accepted')}
                      disabled={updatingOrder === order.id}
                      size="sm"
                    >
                      {updatingOrder === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Accept Order
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateOrderStatus(order.id, 'restaurant_rejected')}
                      disabled={updatingOrder === order.id}
                      size="sm"
                    >
                      Decline
                    </Button>
                  </div>
                )}

                {order.status === 'restaurant_accepted' && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    disabled={updatingOrder === order.id}
                    size="sm"
                  >
                    Start Preparing
                  </Button>
                )}

                {order.status === 'preparing' && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, 'ready_for_pickup')}
                    disabled={updatingOrder === order.id}
                    size="sm"
                  >
                    Mark Ready
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;

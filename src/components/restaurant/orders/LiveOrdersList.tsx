import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Clock, AlertCircle, MapPin, User, Phone, Check, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { OrderStatus } from '@/types/restaurant';
import { Order, OrderItem } from '@/types/order';

interface LiveOrdersListProps {
  restaurantId: string;
  onOrderAccepted?: () => void;
}

interface OrderData {
  id: string;
  restaurant_id: string;
  order_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  expires_at: string;
  order: Order;
}

export const LiveOrdersList: React.FC<LiveOrdersListProps> = ({ restaurantId, onOrderAccepted }) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  const { toast } = useToast();

  useEffect(() => {
    if (!restaurantId) return;
    
    // Initial fetch of orders
    fetchOrders();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('restaurant_orders_live')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'restaurant_assignments',
          filter: `restaurant_id=eq.${restaurantId}`
        }, 
        () => {
          // Refetch orders when there are changes
          fetchOrders();
        })
      .subscribe();
      
    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);
  
  const fetchOrders = async () => {
    setLoading(true);
    
    try {
      // Fetch assignments for restaurant - use "order_id" instead of "orders(*)"
      const { data: assignments, error } = await supabase
        .from('restaurant_assignments')
        .select(`
          *
        `)
        .eq('restaurant_id', restaurantId)
        .in('status', filter === 'all' ? ['pending', 'accepted'] : ['pending'])
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Enhance each order with additional details
      const enhancedOrders: OrderData[] = [];
      for (const assignment of assignments || []) {
        // Fetch the order separately
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', assignment.order_id)
          .single();
        
        if (orderError || !orderData) {
          console.error('Error fetching order:', orderError);
          continue;
        }
        
        // Fetch order items
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', assignment.order_id);
        
        // Create a properly typed Order object - make sure to handle latitude and longitude correctly
        const order: Order = {
          id: orderData.id,
          user_id: orderData.user_id,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          delivery_address: orderData.delivery_address,
          city: orderData.city,
          notes: orderData.notes,
          delivery_method: orderData.delivery_method,
          payment_method: orderData.payment_method,
          delivery_fee: orderData.delivery_fee,
          subtotal: orderData.subtotal,
          total: orderData.total,
          status: orderData.status,
          // Cast latitude and longitude explicitly as nullable numbers, handling them as potentially missing fields
          latitude: 'latitude' in orderData ? Number(orderData.latitude) : null,
          longitude: 'longitude' in orderData ? Number(orderData.longitude) : null,
          formatted_order_id: orderData.formatted_order_id,
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          restaurant_id: orderData.restaurant_id,
          order_items: orderItems as OrderItem[] || [],
        };
        
        enhancedOrders.push({
          id: assignment.id,
          restaurant_id: assignment.restaurant_id,
          order_id: assignment.order_id,
          status: assignment.status,
          created_at: assignment.created_at,
          updated_at: assignment.updated_at,
          notes: assignment.notes,
          expires_at: assignment.expires_at,
          order: order
        });
      }
      
      setOrders(enhancedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error fetching orders',
        description: 'Could not load your orders. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAcceptOrder = async (assignmentId: string) => {
    try {
      // Update the restaurant assignment status
      const { error } = await supabase
        .from('restaurant_assignments')
        .update({ status: 'accepted' })
        .eq('id', assignmentId);
      
      if (error) {
        throw error;
      }
      
      // Get the order_id and restaurant_id for the accepted assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .select('order_id, restaurant_id')
        .eq('id', assignmentId)
        .single();
        
      if (assignmentError || !assignment) {
        throw new Error('Could not find assignment details');
      }
      
      // Also update the order status to preparing
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ 
          status: 'preparing', 
          restaurant_id: assignment.restaurant_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignment.order_id);
        
      if (orderUpdateError) {
        console.error('Error updating order status:', orderUpdateError);
        throw orderUpdateError;
      }
      
      // Get restaurant name for the order history
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', assignment.restaurant_id)
        .single();
        
      const restaurantName = restaurant?.name || 'Unknown Restaurant';
      
      // Record in order history
      await supabase.from('order_history').insert({
        order_id: assignment.order_id,
        previous_status: 'awaiting_restaurant',
        status: 'preparing',
        restaurant_id: assignment.restaurant_id,
        restaurant_name: restaurantName,
        changed_by_type: 'restaurant',
        details: { assignment_id: assignmentId }
      });
      
      toast({
        title: "Order Accepted",
        description: "The order has been moved to preparation.",
      });
      
      // Update the orders list
      fetchOrders();
      
      // Call the callback if provided
      if (onOrderAccepted) {
        onOrderAccepted();
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: 'Error accepting order',
        description: 'Could not accept the order. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleRejectOrder = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('restaurant_assignments')
        .update({ status: 'rejected' })
        .eq('id', assignmentId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Order Rejected",
        description: "The order has been rejected.",
      });
      
      // Update the orders list
      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: 'Error rejecting order',
        description: 'Could not reject the order. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'pending')}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="all">All New</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No new orders</p>
              <p className="text-sm">When customers place orders, they will appear here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((orderData) => {
            const order = orderData.order;
            return (
              <Card key={orderData.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        Order #{order.formatted_order_id || order.id.substring(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="inline w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(orderData.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {orderData.status === 'pending' && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 animate-pulse">
                        New
                      </span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <User className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{order.customer_name}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{order.customer_phone}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{order.delivery_address}, {order.city}</span>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-1">Items</h4>
                      <ul className="space-y-1">
                        {order.order_items && order.order_items.map((item) => (
                          <li key={item.id} className="text-sm">
                            <span className="font-medium">{item.quantity}x</span> {item.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-2 border-t mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fee:</span>
                        <span>${order.delivery_fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium mt-1">
                        <span>Total:</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                {orderData.status === 'pending' && (
                  <CardFooter className="pt-2">
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="destructive" 
                        className="w-1/2"
                        onClick={() => handleRejectOrder(orderData.id)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Decline
                      </Button>
                      <Button 
                        variant="default" 
                        className="w-1/2 bg-quantum-cyan hover:bg-quantum-cyan/80"
                        onClick={() => handleAcceptOrder(orderData.id)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Accept
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

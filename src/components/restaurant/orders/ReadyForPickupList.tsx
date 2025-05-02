
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Clock, AlertCircle, Package, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Order, OrderItem } from '@/types/order';

interface ReadyForPickupListProps {
  restaurantId: string;
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
  driver?: {
    id: string;
    name: string;
    phone: string;
  } | null;
}

export const ReadyForPickupList: React.FC<ReadyForPickupListProps> = ({ restaurantId }) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    
    try {
      // Fetch assignments for restaurant that are ready for pickup
      const { data: assignments, error } = await supabase
        .from('restaurant_assignments')
        .select(`
          *
        `)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'ready_for_pickup')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Process the orders
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
        
        // Get order ID for further queries
        const orderId = assignment.order_id;
        
        // Check if there is an assigned delivery driver
        let driver = null;
        const { data: deliveryAssignments } = await supabase
          .from('delivery_assignments')
          .select('*')
          .eq('order_id', orderId);
          
        if (deliveryAssignments && deliveryAssignments.length > 0) {
          // Find the driver assigned to this order
          const { data: driverData } = await supabase
            .from('delivery_users')
            .select('*')
            .eq('id', deliveryAssignments[0].delivery_user_id)
            .single();
            
          driver = driverData;
        }
        
        // Fetch order items
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);
        
        // Create a properly typed Order object
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
          // Either use the values from orderData or provide default null values
          latitude: orderData.latitude || null,
          longitude: orderData.longitude || null, 
          formatted_order_id: orderData.formatted_order_id,
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          restaurant_id: orderData.restaurant_id,
          order_items: orderItems as OrderItem[] || []
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
          order: order,
          driver
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
  
  useEffect(() => {
    if (!restaurantId) return;
    
    // Initial fetch of orders
    fetchOrders();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('restaurant_pickup_live')
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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Ready for Pickup</h2>
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
              <p className="text-lg font-medium">No orders ready for pickup</p>
              <p className="text-sm">When orders are prepared, they will appear here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((orderData) => {
            const order = orderData.order;
            return (
              <Card key={orderData.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        Order #{order.formatted_order_id || order.id.substring(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="inline w-3 h-3 mr-1" />
                        Ready {formatDistanceToNow(new Date(orderData.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Ready
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        <span className="font-medium">{order.order_items?.length || 0} items</span>
                      </div>
                      
                      {orderData.driver ? (
                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Driver Assigned
                        </div>
                      ) : (
                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Awaiting Driver
                        </div>
                      )}
                    </div>
                    
                    {orderData.driver && (
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                        <p className="font-medium">Delivery Driver</p>
                        <div className="text-sm">
                          <p>{orderData.driver.name}</p>
                          <p>{orderData.driver.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium mb-1">Order Summary</h4>
                      <ul className="space-y-1">
                        {order.order_items && order.order_items.map((item) => (
                          <li key={item.id} className="text-sm">
                            <span className="font-medium">{item.quantity}x</span> {item.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

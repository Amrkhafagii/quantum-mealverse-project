
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Clock, AlertCircle, User, Check, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Order, OrderItem } from '@/types/order';
import { updateOrderStatus } from '@/services/orders/webhookService';
import { OrderStatus } from '@/types/webhook';
import { fixOrderStatus } from '@/utils/orderStatusFix';

interface OrderPreparationProps {
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
  progress: number;
  elapsed: number;
  assignment_type: 'order' | 'assignment'; // To track the source of the order
}

export const OrderPreparation: React.FC<OrderPreparationProps> = ({ restaurantId }) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    
    try {
      // First fetch orders that are directly in "preparing" status
      const { data: preparingOrders, error: preparingError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'preparing');
        
      if (preparingError) {
        throw preparingError;
      }
      
      console.log('Preparing orders from direct orders table:', preparingOrders?.length);
      
      // Also fetch assignments for restaurant that have been accepted
      const { data: assignments, error: assignmentsError } = await supabase
        .from('restaurant_assignments')
        .select(`*`)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'accepted');
        
      if (assignmentsError) {
        throw assignmentsError;
      }
      
      console.log('Accepted assignments:', assignments?.length);
      
      // Enhance each order with additional details
      const enhancedOrders: OrderData[] = [];
      
      // Process direct preparing orders
      for (const orderData of preparingOrders || []) {
        // Fetch order items
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderData.id);
          
        const typedOrderItems = (orderItems || []) as OrderItem[];
        
        // Calculate preparation progress (simulated based on time)
        const startTime = new Date(orderData.updated_at).getTime();
        const now = new Date().getTime();
        const elapsed = now - startTime;
        
        // Assuming prep time of 15 minutes (900000ms)
        const prepTime = 900000;
        let progress = Math.min(Math.round((elapsed / prepTime) * 100), 95);
        
        // If a preparation_time field exists on order items, use the max preparation time
        if (typedOrderItems && typedOrderItems.length > 0) {
          const maxPrepTime = typedOrderItems.reduce((max, item) => {
            // Safely access preparation_time with a default of 15
            const itemPrepTime = item.preparation_time || 15;
            return Math.max(max, itemPrepTime);
          }, 15);
          const prepTimeMs = maxPrepTime * 60 * 1000;
          progress = Math.min(Math.round((elapsed / prepTimeMs) * 100), 95);
        }
        
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
          // Cast latitude and longitude explicitly as nullable numbers, handling them as potentially missing fields
          latitude: 'latitude' in orderData ? Number(orderData.latitude) : null,
          longitude: 'longitude' in orderData ? Number(orderData.longitude) : null,
          formatted_order_id: orderData.formatted_order_id,
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          restaurant_id: orderData.restaurant_id,
          order_items: typedOrderItems
        };
        
        enhancedOrders.push({
          id: orderData.id, // Using order ID as assignment ID for direct orders
          restaurant_id: orderData.restaurant_id,
          order_id: orderData.id,
          status: orderData.status,
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          notes: orderData.notes,
          expires_at: '', // No expiration for direct orders
          order: order,
          progress,
          elapsed,
          assignment_type: 'order' // This is a direct order
        });
      }
      
      // Process orders from assignments
      for (const assignment of assignments || []) {
        // Skip if we already have this order from direct fetch
        if (enhancedOrders.some(o => o.order_id === assignment.order_id)) {
          continue;
        }
        
        // Fetch the order separately
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', assignment.order_id)
          .single();
          
        if (orderError || !orderData) {
          console.error('Error fetching order for assignment:', orderError);
          continue;
        }
        
        // Only process orders that are in accepted or preparing status
        if (orderData.status !== 'restaurant_accepted' && orderData.status !== 'preparing') {
          continue;
        }
        
        // Check for order status inconsistency and fix if needed
        if (orderData.status === 'restaurant_accepted') {
          console.log(`Found inconsistency in order ${orderData.id} - accepted assignment but order status is still ${orderData.status}`);
          
          // Auto-fix this inconsistency
          await fixOrderStatus(orderData.id);
        }
        
        // Fetch order items
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', assignment.order_id);
        
        const typedOrderItems = (orderItems || []) as OrderItem[];
        
        // Calculate preparation progress (simulated based on time)
        const startTime = new Date(assignment.updated_at).getTime();
        const now = new Date().getTime();
        const elapsed = now - startTime;
        
        // Assuming prep time of 15 minutes (900000ms)
        const prepTime = 900000;
        let progress = Math.min(Math.round((elapsed / prepTime) * 100), 95);
        
        // If a preparation_time field exists on order items, use the max preparation time
        if (typedOrderItems && typedOrderItems.length > 0) {
          const maxPrepTime = typedOrderItems.reduce((max, item) => {
            // Safely access preparation_time with a default of 15
            const itemPrepTime = item.preparation_time || 15;
            return Math.max(max, itemPrepTime);
          }, 15);
          const prepTimeMs = maxPrepTime * 60 * 1000;
          progress = Math.min(Math.round((elapsed / prepTimeMs) * 100), 95);
        }
        
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
          latitude: 'latitude' in orderData ? Number(orderData.latitude) : null,
          longitude: 'longitude' in orderData ? Number(orderData.longitude) : null,
          formatted_order_id: orderData.formatted_order_id,
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          restaurant_id: orderData.restaurant_id,
          order_items: typedOrderItems
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
          progress,
          elapsed,
          assignment_type: 'assignment' // This came from an assignment
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
      .channel('restaurant_preparation_live')
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
      
    // Also listen to changes in the orders table
    const ordersChannel = supabase
      .channel('restaurant_orders_live')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        () => {
          // Refetch orders when there are changes
          fetchOrders();
        })
      .subscribe();
      
    // Set up a timer to update progress
    const timer = setInterval(() => {
      setOrders(prev => prev.map(order => ({
        ...order,
        elapsed: order.elapsed + 1000,
        progress: Math.min(Math.round(((order.elapsed + 1000) / 900000) * 100), 95)
      })));
    }, 1000);
    
    // Clean up subscription and timer
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(ordersChannel);
      clearInterval(timer);
    };
  }, [restaurantId]);
  
  const markAsReady = async (orderData: OrderData) => {
    try {
      console.log("Marking order as ready with data:", orderData);
      
      // Based on the source of the order, update accordingly
      if (orderData.assignment_type === 'assignment') {
        // First update the restaurant_assignment status
        const { error: assignmentError } = await supabase
          .from('restaurant_assignments')
          .update({ 
            status: 'ready_for_pickup',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderData.id);
        
        if (assignmentError) {
          console.error('Error updating assignment status:', assignmentError);
          throw assignmentError;
        }
        
        console.log(`Updated restaurant_assignment ${orderData.id} to ready_for_pickup`);
      } else {
        // For direct orders, we need to find if there is an assignment and update it
        const { data: assignments } = await supabase
          .from('restaurant_assignments')
          .select('id')
          .eq('order_id', orderData.order_id)
          .eq('restaurant_id', restaurantId)
          .eq('status', 'accepted');
          
        if (assignments && assignments.length > 0) {
          const { error: assignmentError } = await supabase
            .from('restaurant_assignments')
            .update({ 
              status: 'ready_for_pickup',
              updated_at: new Date().toISOString()
            })
            .eq('id', assignments[0].id);
          
          if (assignmentError) {
            console.error('Error updating assignment status:', assignmentError);
            // Continue anyway as we'll update the order status directly
          } else {
            console.log(`Updated found assignment ${assignments[0].id} to ready_for_pickup`);
          }
        }
      }
      
      // Now update the orders table to ensure synchronization
      const success = await updateOrderStatus(
        orderData.order_id, 
        OrderStatus.READY_FOR_PICKUP, 
        restaurantId, 
        { assignment_id: orderData.assignment_type === 'assignment' ? orderData.id : undefined },
        undefined,
        'restaurant'
      );
      
      if (!success) {
        console.warn('Order status update in orders table may have failed.');
        
        // Fallback direct update if the service call fails
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({ 
            status: OrderStatus.READY_FOR_PICKUP,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderData.order_id);
        
        if (orderUpdateError) {
          console.error('Fallback order update failed:', orderUpdateError);
          throw orderUpdateError;
        }
        
        console.log(`Direct update of order ${orderData.order_id} to ready_for_pickup`);
      }
      
      // Add an order history record for this status change
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', restaurantId)
        .single();
        
      const restaurantName = restaurant?.name || 'Unknown Restaurant';
      
      await supabase.from('order_history').insert({
        order_id: orderData.order_id,
        previous_status: orderData.order.status,
        status: OrderStatus.READY_FOR_PICKUP,
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        changed_by_type: 'restaurant',
        details: { 
          marked_ready: true, 
          assignment_id: orderData.assignment_type === 'assignment' ? orderData.id : null 
        }
      });
      
      toast({
        title: "Order Ready for Pickup",
        description: "The order has been marked as ready for pickup.",
      });
      
      // Update the orders list
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error updating order status',
        description: 'Could not update the order status. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Orders in Preparation</h2>
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
              <p className="text-lg font-medium">No orders in preparation</p>
              <p className="text-sm">Accepted orders will appear here for preparation.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((orderData) => {
            const order = orderData.order;
            const statusText = order.status === 'restaurant_accepted' ? 'Accepted' : 'Preparing';
            const statusColor = order.status === 'restaurant_accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            
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
                        {formatDistanceToNow(new Date(orderData.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                      {statusText}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{order.customer_name}</span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Preparation Progress</span>
                        <span>{orderData.progress}%</span>
                      </div>
                      <Progress value={orderData.progress} className="h-2" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Items</h4>
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
                
                <CardFooter className="pt-2">
                  <Button 
                    className="w-full bg-quantum-cyan hover:bg-quantum-cyan/80"
                    onClick={() => markAsReady(orderData)}
                    disabled={orderData.progress < 50} // Prevent marking as ready too soon
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Mark as Ready for Pickup
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

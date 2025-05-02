
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Clock, Calendar, Search, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { OrderStatus } from '@/types/restaurant';
import { Order, OrderItem } from '@/types/order';

interface OrderHistoryListProps {
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
}

export const OrderHistoryList: React.FC<OrderHistoryListProps> = ({ restaurantId }) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    
    try {
      // Fetch completed assignments for the restaurant
      const { data: assignments, error } = await supabase
        .from('restaurant_assignments')
        .select(`
          *
        `)
        .eq('restaurant_id', restaurantId)
        .in('status', ['delivered', 'cancelled', 'picked_up', 'on_the_way'])
        .order('created_at', { ascending: false })
        .limit(50);
      
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
        
        // Create a properly typed Order object - handling latitude and longitude correctly
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
          order: order
        });
      }
      
      setOrders(enhancedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error fetching order history',
        description: 'Could not load your order history. Please try again later.',
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
  }, [restaurantId]);
  
  // Filter orders based on search term
  const filteredOrders = orders.filter(orderData => {
    const order = orderData.order;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (order.formatted_order_id && order.formatted_order_id.toLowerCase().includes(searchLower)) ||
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.delivery_address.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower)
    );
  });
  
  // Helper function to get status badge color
  const getStatusBadgeStyle = (status: string) => {
    switch(status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'on_the_way':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'picked_up':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  
  // Helper function to format status text
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <h2 className="text-xl font-medium">Order History</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search orders..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              {searchTerm ? (
                <p className="text-lg font-medium">No orders match your search</p>
              ) : (
                <>
                  <p className="text-lg font-medium">No order history yet</p>
                  <p className="text-sm">Completed orders will appear here.</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((orderData) => {
                  const order = orderData.order;
                  const orderDate = new Date(orderData.created_at);
                  
                  return (
                    <tr key={orderData.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        #{order.formatted_order_id || order.id.substring(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {order.customer_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col">
                          <span>{format(orderDate, 'MMM d, yyyy')}</span>
                          <span className="text-xs">{format(orderDate, 'h:mm a')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(orderData.status)}`}>
                          {formatStatus(orderData.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

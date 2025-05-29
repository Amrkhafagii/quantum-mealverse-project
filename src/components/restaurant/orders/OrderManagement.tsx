
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle, XCircle, Users, ChefHat } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { EnhancedOrderPreparation } from './preparation/EnhancedOrderPreparation';

interface OrderManagementProps {
  restaurantId: string;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ restaurantId }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const queryClient = useQueryClient();

  // Fetch pending orders (new orders waiting for restaurant acceptance)
  const { data: pendingOrders = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-orders', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('restaurant_id', restaurantId)
        .in('status', ['pending', 'restaurant_assigned'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch accepted orders that are in preparation
  const { data: preparationOrders = [], isLoading: preparationLoading } = useQuery({
    queryKey: ['preparation-orders', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          order_preparation_stages(*)
        `)
        .eq('restaurant_id', restaurantId)
        .in('status', ['restaurant_accepted', 'preparing'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 3000, // Refresh every 3 seconds for active preparation
  });

  // Fetch orders ready for pickup
  const { data: readyOrders = [], isLoading: readyLoading } = useQuery({
    queryKey: ['ready-orders', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'ready_for_pickup')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Accept order mutation
  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'restaurant_accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
      queryClient.invalidateQueries({ queryKey: ['preparation-orders'] });
      toast.success('Order accepted successfully!');
      // Automatically switch to preparation tab
      setActiveTab('preparation');
    },
    onError: (error) => {
      toast.error('Failed to accept order');
      console.error('Error accepting order:', error);
    },
  });

  // Reject order mutation
  const rejectOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'restaurant_rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
      toast.success('Order rejected');
    },
    onError: (error) => {
      toast.error('Failed to reject order');
      console.error('Error rejecting order:', error);
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getOrderAge = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}h ${diffMinutes % 60}m ago`;
    }
  };

  const PendingOrderCard = ({ order }: { order: any }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Order #{order.formatted_order_id || order.id.substring(0, 8)}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {getOrderAge(order.created_at)} • {formatCurrency(order.total)}
            </p>
          </div>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="font-medium">{order.customer_name}</p>
            <p className="text-sm text-gray-600">{order.delivery_address}</p>
            <p className="text-sm text-gray-600">{order.customer_phone}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Order Items:</h4>
            <div className="space-y-1">
              {order.order_items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>{formatCurrency(item.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800"><strong>Notes:</strong> {order.notes}</p>
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => acceptOrderMutation.mutate(order.id)}
              disabled={acceptOrderMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Accept Order
            </Button>
            <Button 
              onClick={() => rejectOrderMutation.mutate(order.id)}
              disabled={rejectOrderMutation.isPending}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ReadyOrderCard = ({ order }: { order: any }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Order #{order.formatted_order_id || order.id.substring(0, 8)}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {getOrderAge(order.created_at)} • {formatCurrency(order.total)}
            </p>
          </div>
          <Badge className="bg-green-100 text-green-800">
            Ready for Pickup
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="font-medium">{order.customer_name}</p>
            <p className="text-sm text-gray-600">{order.delivery_address}</p>
            <p className="text-sm text-gray-600">{order.customer_phone}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Order Items:</h4>
            <div className="space-y-1">
              {order.order_items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>{formatCurrency(item.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            <Users className="h-4 w-4 mr-2" />
            Pending Orders
            {pendingOrders.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs px-1 py-0">
                {pendingOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preparation" className="relative">
            <ChefHat className="h-4 w-4 mr-2" />
            In Preparation
            {preparationOrders.length > 0 && (
              <Badge className="ml-2 bg-blue-500 text-white text-xs px-1 py-0">
                {preparationOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ready" className="relative">
            <CheckCircle className="h-4 w-4 mr-2" />
            Ready for Pickup
            {readyOrders.length > 0 && (
              <Badge className="ml-2 bg-green-500 text-white text-xs px-1 py-0">
                {readyOrders.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading pending orders...</p>
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pending orders</h3>
              <p className="text-gray-600">New orders will appear here when customers place them.</p>
            </div>
          ) : (
            pendingOrders.map((order) => (
              <PendingOrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>

        <TabsContent value="preparation" className="space-y-4">
          {preparationLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading preparation orders...</p>
            </div>
          ) : preparationOrders.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders in preparation</h3>
              <p className="text-gray-600">Accepted orders will appear here for preparation management.</p>
            </div>
          ) : (
            preparationOrders.map((order) => (
              <EnhancedOrderPreparation key={order.id} order={order} />
            ))
          )}
        </TabsContent>

        <TabsContent value="ready" className="space-y-4">
          {readyLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading ready orders...</p>
            </div>
          ) : readyOrders.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders ready</h3>
              <p className="text-gray-600">Completed orders will appear here when ready for pickup.</p>
            </div>
          ) : (
            readyOrders.map((order) => (
              <ReadyOrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderManagement;

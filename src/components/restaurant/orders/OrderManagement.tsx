
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Phone, User } from 'lucide-react';
import { EnhancedOrderPreparation } from './preparation/EnhancedOrderPreparation';
import { PreparationIntegrationService } from '@/services/preparation/preparationIntegrationService';

interface Order {
  id: string;
  formatted_order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  total: number;
  status: string;
  created_at: string;
  notes?: string;
  order_items?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface OrderManagementProps {
  restaurantId: string;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ restaurantId }) => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]);
  const [preparationOrders, setPreparationOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription for orders
    const channel = supabase
      .channel('order_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      // Fetch orders with restaurant assignments
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            name,
            quantity,
            price
          )
        `)
        .in('id', 
          await supabase
            .from('restaurant_assignments')
            .select('order_id')
            .eq('restaurant_id', restaurantId)
            .then(({ data }) => data?.map(a => a.order_id) || [])
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (orders) {
        // Categorize orders by status
        setPendingOrders(orders.filter(order => order.status === 'pending'));
        setAcceptedOrders(orders.filter(order => order.status === 'restaurant_accepted'));
        setPreparationOrders(orders.filter(order => 
          ['preparing', 'ready_for_pickup'].includes(order.status)
        ));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      // Update order status to restaurant_accepted
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'restaurant_accepted' })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Initialize preparation tracking
      await PreparationIntegrationService.initializePreparationTracking(orderId, restaurantId);

      toast({
        title: "Success",
        description: "Order accepted successfully",
        variant: "default"
      });

      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: "Error",
        description: "Failed to accept order",
        variant: "destructive"
      });
    }
  };

  const handleStartPreparation = async (orderId: string) => {
    try {
      await PreparationIntegrationService.startPreparation(orderId);
      
      toast({
        title: "Success",
        description: "Preparation started",
        variant: "default"
      });

      fetchOrders();
    } catch (error) {
      console.error('Error starting preparation:', error);
      toast({
        title: "Error",
        description: "Failed to start preparation",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'restaurant_accepted': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'ready_for_pickup': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const OrderCard: React.FC<{ order: Order; showActions?: boolean; actionType?: string }> = ({ 
    order, 
    showActions = false, 
    actionType 
  }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Order #{order.formatted_order_id}</span>
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace('_', ' ')}
              </Badge>
            </CardTitle>
            <CardDescription>
              <Clock className="inline h-4 w-4 mr-1" />
              {formatTime(order.created_at)} • ${order.total.toFixed(2)}
            </CardDescription>
          </div>
          {showActions && (
            <div className="space-x-2">
              {actionType === 'accept' && (
                <Button onClick={() => handleAcceptOrder(order.id)}>
                  Accept Order
                </Button>
              )}
              {actionType === 'start' && (
                <Button onClick={() => handleStartPreparation(order.id)}>
                  Start Preparation
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{order.customer_name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{order.customer_phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{order.delivery_address}</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Order Items</h4>
            <div className="space-y-1">
              {order.order_items?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            {order.notes && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">Note: {order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending Assignments ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted Orders ({acceptedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="preparation">
            Preparation ({preparationOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pending Order Assignments</h2>
            <Badge variant="outline">{pendingOrders.length} orders</Badge>
          </div>
          
          {pendingOrders.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-gray-500">No pending orders</p>
              </CardContent>
            </Card>
          ) : (
            pendingOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                showActions={true} 
                actionType="accept" 
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Accepted Orders</h2>
            <Badge variant="outline">{acceptedOrders.length} orders</Badge>
          </div>
          
          {acceptedOrders.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-gray-500">No accepted orders</p>
              </CardContent>
            </Card>
          ) : (
            acceptedOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                showActions={true} 
                actionType="start" 
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="preparation" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Orders in Preparation</h2>
            <Badge variant="outline">{preparationOrders.length} orders</Badge>
          </div>
          
          {preparationOrders.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-gray-500">No orders in preparation</p>
              </CardContent>
            </Card>
          ) : (
            preparationOrders.map(order => (
              <EnhancedOrderPreparation key={order.id} order={order} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderManagement;


import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderAssignmentCard } from './OrderAssignmentCard';
import { EnhancedOrderPreparation } from './preparation/EnhancedOrderPreparation';
import { orderAssignmentService } from '@/services/orders/orderAssignmentService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, RefreshCw, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const OrderManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<any[]>([]);
  const [preparationOrders, setPreparationOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      getRestaurantId();
    }
  }, [user?.id]);

  useEffect(() => {
    if (restaurantId) {
      loadOrders();
      
      // Set up real-time subscription for new assignments
      const subscription = supabase
        .channel('restaurant_assignments')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'restaurant_assignments',
            filter: `restaurant_id=eq.${restaurantId}`
          },
          () => {
            console.log('Assignment change detected, refreshing orders...');
            loadOrders();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [restaurantId]);

  const getRestaurantId = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error getting restaurant ID:', error);
        return;
      }

      setRestaurantId(data?.id);
    } catch (error) {
      console.error('Error in getRestaurantId:', error);
    }
  };

  const loadOrders = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);

      // Load pending assignments
      const pendingData = await orderAssignmentService.getRestaurantPendingAssignments(restaurantId);
      setPendingAssignments(pendingData);

      // Load accepted orders (restaurant_accepted status)
      const { data: acceptedData, error: acceptedError } = await supabase
        .from('restaurant_assignments')
        .select(`
          *,
          orders!restaurant_assignments_order_id_fkey(
            id,
            customer_name,
            customer_phone,
            delivery_address,
            total,
            status,
            created_at,
            order_items(*)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'accepted')
        .eq('orders.status', 'restaurant_accepted')
        .order('created_at', { ascending: false })
        .limit(10);

      if (acceptedError) {
        console.error('Error loading accepted orders:', acceptedError);
      } else {
        setAcceptedOrders(acceptedData || []);
      }

      // Load orders in preparation (preparing status)
      const { data: preparationData, error: preparationError } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_phone,
          customer_email,
          delivery_address,
          total,
          status,
          created_at,
          formatted_order_id,
          notes,
          order_items(
            id,
            name,
            quantity,
            price
          )
        `)
        .eq('restaurant_id', restaurantId)
        .in('status', ['preparing', 'ready_for_pickup'])
        .order('created_at', { ascending: false });

      if (preparationError) {
        console.error('Error loading preparation orders:', preparationError);
      } else {
        setPreparationOrders(preparationData || []);
      }

    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: 'Error Loading Orders',
        description: 'Failed to load restaurant orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
  };

  const handleAssignmentResponse = async () => {
    // Reload orders after any assignment response
    await loadOrders();
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // Initialize preparation stages when order moves to preparing
      if (newStatus === 'preparing' && restaurantId) {
        console.log('Initializing preparation stages for order:', orderId);
        const { error: stagesError } = await supabase.rpc('create_default_preparation_stages', {
          p_order_id: orderId,
          p_restaurant_id: restaurantId
        });

        if (stagesError) {
          console.error('Error creating preparation stages:', stagesError);
        }
      }

      // Reload orders to reflect changes
      await loadOrders();
    } catch (error) {
      console.error('Error handling order status change:', error);
    }
  };

  if (!restaurantId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Restaurant Not Found</h3>
          <p className="text-gray-500">No restaurant profile found for your account.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending Assignments
            {pendingAssignments.length > 0 && (
              <Badge variant="secondary">{pendingAssignments.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex items-center gap-2">
            Accepted Orders
            {acceptedOrders.length > 0 && (
              <Badge variant="secondary">{acceptedOrders.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preparation" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Preparation
            {preparationOrders.length > 0 && (
              <Badge variant="secondary">{preparationOrders.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading pending assignments...</p>
              </CardContent>
            </Card>
          ) : pendingAssignments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium mb-2">No Pending Assignments</h3>
                <p className="text-gray-500">
                  New order assignments will appear here when available.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingAssignments.map((assignment) => (
                <OrderAssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onResponse={handleAssignmentResponse}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading accepted orders...</p>
              </CardContent>
            </Card>
          ) : acceptedOrders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium mb-2">No Accepted Orders</h3>
                <p className="text-gray-500">
                  Orders you accept will appear here. Click "Start Preparing" to move them to the Preparation tab.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {acceptedOrders.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Order #{assignment.orders.formatted_order_id || assignment.orders.id.slice(-8)}
                      <Button
                        onClick={() => handleOrderStatusChange(assignment.orders.id, 'preparing')}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <ChefHat className="h-4 w-4 mr-2" />
                        Start Preparing
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Customer:</strong> {assignment.orders.customer_name}</p>
                      <p><strong>Phone:</strong> {assignment.orders.customer_phone}</p>
                      <p><strong>Total:</strong> ${assignment.orders.total.toFixed(2)}</p>
                      <p><strong>Items:</strong> {assignment.orders.order_items?.length || 0}</p>
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Order Items:</h4>
                        <div className="space-y-1">
                          {assignment.orders.order_items?.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                              <span>{item.quantity}x {item.name}</span>
                              <span>${item.price?.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preparation" className="mt-6">
          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading preparation orders...</p>
              </CardContent>
            </Card>
          ) : preparationOrders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Orders in Preparation</h3>
                <p className="text-gray-500">
                  Orders that are being prepared will appear here with detailed stage management.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {preparationOrders.map((order) => (
                <EnhancedOrderPreparation
                  key={order.id}
                  order={order}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderManagement;

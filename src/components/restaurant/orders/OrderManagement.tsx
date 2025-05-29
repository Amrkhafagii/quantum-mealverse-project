
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRestaurantOrders } from '@/hooks/useRestaurantOrders';
import { useDashboardStages } from '@/hooks/dashboard/useDashboardStages';
import { OrderStagesDashboard } from '@/components/restaurant/dashboard/OrderStagesDashboard';
import { Package, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import ErrorBoundary from '@/components/ErrorBoundary';

interface OrderManagementProps {
  restaurantId: string;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ restaurantId }) => {
  const [activeTab, setActiveTab] = useState('stages');
  
  console.log('OrderManagement - Component mounted with restaurantId:', restaurantId);

  const { 
    orders, 
    loading: ordersLoading, 
    error: ordersError, 
    refetch: refetchOrders,
    updateOrderStatus 
  } = useRestaurantOrders(restaurantId);

  const {
    orders: stageOrders,
    isLoading: stagesLoading,
    advanceStage,
    updateStageNotes,
    refetch: refetchStages
  } = useDashboardStages(restaurantId);

  console.log('OrderManagement - Orders data:', { orders, ordersLoading, ordersError });
  console.log('OrderManagement - Stages data:', { stageOrders, stagesLoading });

  useEffect(() => {
    console.log('OrderManagement - useEffect triggered, restaurantId:', restaurantId);
    if (!restaurantId) {
      console.error('OrderManagement - No restaurantId provided');
    }
  }, [restaurantId]);

  const handleRefresh = () => {
    console.log('OrderManagement - Manual refresh triggered');
    if (activeTab === 'stages') {
      refetchStages();
    } else {
      refetchOrders();
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'ready': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  if (!restaurantId) {
    console.error('OrderManagement - No restaurantId provided to component');
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Error: No restaurant ID provided</p>
        </CardContent>
      </Card>
    );
  }

  if (ordersError) {
    console.error('OrderManagement - Orders error:', ordersError);
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h3>
          <p className="text-red-600 mb-4">{ordersError.message || 'Failed to load orders'}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary fallback={
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Component Error</h3>
          <p className="text-red-600">There was an error in the order management component.</p>
        </CardContent>
      </Card>
    }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Orders</h2>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={ordersLoading || stagesLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(ordersLoading || stagesLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            Restaurant ID: {restaurantId}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stages">Order Stages</TabsTrigger>
            <TabsTrigger value="list">Order List</TabsTrigger>
          </TabsList>

          <TabsContent value="stages" className="space-y-4">
            {stagesLoading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading order stages...</p>
                </CardContent>
              </Card>
            ) : (
              <ErrorBoundary>
                <OrderStagesDashboard restaurantId={restaurantId} />
              </ErrorBoundary>
            )}
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            {ordersLoading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading orders...</p>
                </CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-gray-600">Orders will appear here when customers place them.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Order #{order.id.substring(0, 8)}
                        </CardTitle>
                        <Badge className={`${getStatusBadgeColor(order.status)} text-white`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Customer</p>
                            <p className="text-gray-600">{order.customer_name}</p>
                            <p className="text-gray-600">{order.customer_phone}</p>
                          </div>
                          <div>
                            <p className="font-medium">Order Details</p>
                            <p className="text-gray-600">Total: EGP {order.total}</p>
                            <p className="text-gray-600">
                              {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-sm">Delivery Address</p>
                          <p className="text-gray-600 text-sm">{order.delivery_address}</p>
                        </div>

                        {order.order_items && order.order_items.length > 0 && (
                          <div>
                            <p className="font-medium text-sm mb-2">Items</p>
                            <div className="space-y-1">
                              {order.order_items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span>EGP {item.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2 pt-3">
                          {order.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {order.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Start Preparing
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                            >
                              Mark Ready
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};

export default OrderManagement;

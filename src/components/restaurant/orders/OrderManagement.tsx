
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRestaurantOrders } from '@/hooks/useRestaurantOrders';
import { format } from 'date-fns';
import { Clock, Package, AlertCircle, RefreshCw, Bell } from 'lucide-react';
import { OrderStagesDashboard } from '@/components/restaurant/dashboard/OrderStagesDashboard';
import { PendingAssignmentsList } from './PendingAssignmentsList';
import { OrderWithContext } from './OrderWithContext';
import { EnhancedOrderPreparation } from './preparation/EnhancedOrderPreparation';
import ErrorBoundary from '@/components/ErrorBoundary';

interface OrderManagementProps {
  restaurantId: string;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ restaurantId }) => {
  console.log('OrderManagement - Component mounted with restaurantId:', restaurantId);
  
  const { orders, loading, error, refetch } = useRestaurantOrders(restaurantId);
  const [activeTab, setActiveTab] = useState('assignments');

  console.log('OrderManagement - Hook data:', { orders, loading, error });

  if (loading) {
    console.log('OrderManagement - Showing loading state');
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('OrderManagement - Error loading orders:', error);
    const errorMessage = typeof error === 'string' ? error : 'Unknown error occurred';
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h3>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  console.log('OrderManagement - Orders loaded:', orders?.length || 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
      case 'preparing':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const activeOrders = orders?.filter(order => 
    !['delivered', 'cancelled'].includes(order.status)
  ) || [];

  const completedOrders = orders?.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  ) || [];

  return (
    <ErrorBoundary fallback={
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Component Error</h3>
          <p className="text-red-600">There was an error displaying the order management interface.</p>
        </CardContent>
      </Card>
    }>
      <div className="space-y-6">
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assignments">
              <Bell className="h-4 w-4 mr-2" />
              Pending Assignments
            </TabsTrigger>
            <TabsTrigger value="stages">Order Stages</TabsTrigger>
            <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            <PendingAssignmentsList restaurantId={restaurantId} />
          </TabsContent>

          <TabsContent value="stages" className="space-y-4">
            <OrderStagesDashboard restaurantId={restaurantId} />
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Orders</h3>
                  <p className="text-gray-600">New orders will appear here when customers place them.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <OrderWithContext
                    key={order.id}
                    order={order}
                    restaurantId={restaurantId}
                    onAssignmentUpdate={refetch}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              Order #{order.id.substring(0, 8)}
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                              {format(new Date(order.created_at!), 'MMM dd, yyyy at h:mm a')}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {formatStatus(order.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>Customer:</strong> {order.customer_name}</p>
                          <p><strong>Phone:</strong> {order.customer_phone}</p>
                          <p><strong>Address:</strong> {order.delivery_address}</p>
                          <p><strong>Total:</strong> EGP {order.total}</p>
                        </div>
                        {order.status === 'preparing' && (
                          <div className="mt-4">
                            <EnhancedOrderPreparation />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </OrderWithContext>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Completed Orders</h3>
                  <p className="text-gray-600">Completed orders will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Order #{order.id.substring(0, 8)}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {format(new Date(order.created_at!), 'MMM dd, yyyy at h:mm a')}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {formatStatus(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Customer:</strong> {order.customer_name}</p>
                        <p><strong>Total:</strong> EGP {order.total}</p>
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

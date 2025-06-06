
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, DollarSign } from 'lucide-react';
import { fetchRestaurantOrders, updateOrderStatus, type RestaurantOrder } from '@/services/restaurant/orderService';
import { OrderStatus } from '@/types/webhook';
import { toast } from '@/hooks/use-toast';

interface LiveOrdersListProps {
  restaurantId: string;
  onOrderSelect?: (orderId: string) => void;
}

export const LiveOrdersList: React.FC<LiveOrdersListProps> = ({
  restaurantId,
  onOrderSelect
}) => {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [restaurantId]);

  const loadOrders = async () => {
    try {
      const data = await fetchRestaurantOrders(restaurantId);
      // Filter for new/pending orders
      const liveOrders = data.filter(order => 
        ['pending', 'restaurant_assigned', 'restaurant_accepted'].includes(order.status)
      );
      setOrders(liveOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    setUpdating(orderId);
    try {
      const success = await updateOrderStatus(orderId, OrderStatus.RESTAURANT_ACCEPTED, restaurantId);
      if (success) {
        toast({
          title: 'Order Accepted',
          description: 'Order has been accepted successfully',
        });
        await loadOrders();
      }
    } catch (error) {
      console.error('Error accepting order:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleStartPreparation = async (orderId: string) => {
    setUpdating(orderId);
    try {
      const success = await updateOrderStatus(orderId, OrderStatus.PREPARING, restaurantId);
      if (success) {
        toast({
          title: 'Preparation Started',
          description: 'Order preparation has been started',
        });
        await loadOrders();
        onOrderSelect?.(orderId);
      }
    } catch (error) {
      console.error('Error starting preparation:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'restaurant_assigned':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'restaurant_accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6">
          <div className="text-center">Loading orders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-quantum-cyan">Live Orders</h2>
      {orders.length === 0 ? (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="pt-6">
            <div className="text-center text-gray-400">
              No new orders at this time
            </div>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-quantum-cyan">
                  Order #{order.formatted_order_id || order.id.slice(0, 8)}
                </CardTitle>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Customer</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Delivery Address</p>
                <p className="text-sm">{order.delivery_address}</p>
              </div>

              {order.order_items && order.order_items.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Items ({order.order_items.length})</p>
                  <div className="space-y-1">
                    {order.order_items.map((item, index) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x Item #{item.meal_id.slice(0, 8)}</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(order.created_at).toLocaleTimeString()}
                </div>
                <div className="flex space-x-2">
                  {order.status === 'restaurant_assigned' && (
                    <Button
                      size="sm"
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={updating === order.id}
                    >
                      Accept Order
                    </Button>
                  )}
                  {order.status === 'restaurant_accepted' && (
                    <Button
                      size="sm"
                      onClick={() => handleStartPreparation(order.id)}
                      disabled={updating === order.id}
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Start Preparation
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

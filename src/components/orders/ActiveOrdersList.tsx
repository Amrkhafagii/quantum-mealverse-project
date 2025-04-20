
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Package, CreditCard, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { OrderStatusBadge } from './OrderStatusBadge';
import { checkAssignmentStatus } from '@/services/orders/webhookService';
import { useQuery } from '@tanstack/react-query';

interface ActiveOrdersListProps {
  orders: any[];
  selectedOrderId: string | null;
  onOrderSelect: (orderId: string) => void;
}

export const ActiveOrdersList: React.FC<ActiveOrdersListProps> = ({ 
  orders, 
  selectedOrderId, 
  onOrderSelect 
}) => {
  const navigate = useNavigate();
  
  // Fetch assignment status for all awaiting_restaurant orders
  const awaitingRestaurantOrders = orders.filter(order => 
    order.status === 'awaiting_restaurant'
  ).map(order => order.id);
  
  // Use React Query to fetch all assignment statuses in parallel
  const assignmentStatusQueries = useQuery({
    queryKey: ['assignment-statuses', awaitingRestaurantOrders],
    queryFn: async () => {
      if (awaitingRestaurantOrders.length === 0) return {};
      
      const results: Record<string, any> = {};
      
      await Promise.all(
        awaitingRestaurantOrders.map(async (orderId) => {
          try {
            const status = await checkAssignmentStatus(orderId);
            results[orderId] = status;
          } catch (error) {
            console.error(`Error fetching assignment status for order ${orderId}:`, error);
          }
        })
      );
      
      return results;
    },
    enabled: awaitingRestaurantOrders.length > 0,
    refetchInterval: 10000 // Refetch every 10 seconds
  });
  
  const assignmentStatuses = assignmentStatusQueries.data || {};
  
  if (!orders.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">You don't have any active orders at the moment.</div>
          <Button onClick={() => navigate('/customer')}>Order Meals</Button>
        </CardContent>
      </Card>
    );
  }
  
  const handleSelectOrder = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onOrderSelect(orderId);
  };
  
  return (
    <>
      <h2 className="text-2xl font-bold text-quantum-cyan">Active Orders</h2>
      {orders.map((order) => {
        const orderAssignmentStatus = assignmentStatuses[order.id];
        
        return (
          <Card 
            key={order.id}
            className={`cursor-pointer transition-all hover:border-quantum-cyan ${
              selectedOrderId === order.id ? 'border-quantum-cyan border-2' : ''
            }`}
            onClick={() => onOrderSelect(order.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  Order #{order.formatted_order_id || order.id.substring(0, 8)}
                </CardTitle>
                <OrderStatusBadge status={order.status} />
              </div>
              <CardDescription>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
                </div>
                
                {order.status === 'awaiting_restaurant' && orderAssignmentStatus?.restaurant_name && (
                  <div className="flex items-center gap-1 mt-1 text-quantum-cyan">
                    <Building className="h-3 w-3" />
                    <span>{orderAssignmentStatus.restaurant_name}</span>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-quantum-cyan" />
                  <span>{order.order_items?.length || 0} items</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-quantum-cyan" />
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => handleSelectOrder(order.id, e)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
};

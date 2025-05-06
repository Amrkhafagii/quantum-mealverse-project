
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { RestaurantOrder, OrderStatus } from '@/types/restaurant';
import { getRestaurantOrders, updateOrderStatus } from '@/services/restaurant/orderService';
import { useAuth } from '@/hooks/useAuth';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/types/database';

interface LiveOrdersListProps {
  statusFilter?: OrderStatus[];
}

export const LiveOrdersList: React.FC<LiveOrdersListProps> = ({ statusFilter }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [acceptingOrderId, setAcceptingOrderId] = React.useState<string | null>(null);
  
  const { data: orders, isLoading, error, refetch: refreshOrders } = useQuery({
    queryKey: ['restaurant-orders', user?.id, statusFilter],
    queryFn: () => {
      if (!user?.id) return Promise.resolve([]);
      return getRestaurantOrders(user.id, statusFilter);
    },
    enabled: !!user?.id,
  });

  const handleAcceptOrder = async (order: RestaurantOrder, assignmentId?: string) => {
    setAcceptingOrderId(order.id);
    try {
      console.log(`Accepting order ${order.id} with assignment ${assignmentId || 'none'}`);
      
      // Get restaurant name for the order history
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', user?.id)
        .single();
        
      const restaurantName = restaurant?.name || 'Unknown Restaurant';
      
      if (assignmentId) {
        // Update the restaurant_assignment status to 'accepted'
        const { error } = await supabase
          .from('restaurant_assignments')
          .update({ 
            status: 'accepted',
            updated_at: new Date().toISOString() 
          })
          .eq('id', assignmentId);
        
        if (error) {
          console.error('Failed to update assignment status:', error);
          toast.error('Failed to accept order. Please try again.');
          setAcceptingOrderId(null);
          return;
        }

        // Add order history entry
        await supabase.from('order_history').insert({
          order_id: order.id,
          previous_status: order.status,
          status: 'restaurant_accepted',
          restaurant_id: user?.id,
          restaurant_name: restaurantName,
          changed_by_type: 'restaurant',
          details: { assignment_id: assignmentId } as Json
        });

        // Update order status to reflect acceptance
        const { error: orderError } = await supabase
          .from('orders')
          .update({ 
            status: 'restaurant_accepted',
            restaurant_id: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);
          
        if (orderError) {
          console.error('Failed to update order status:', orderError);
          toast.error('Order accepted but status update failed.');
        }
      } else {
        // Direct acceptance without an assignment
        const success = await updateOrderStatus(
          order.id,
          OrderStatus.RESTAURANT_ACCEPTED,
          user?.id || '',
          { direct_accept: true }
        );
        
        if (!success) {
          toast.error('Failed to accept order. Please try again.');
          setAcceptingOrderId(null);
          return;
        }
      }
      
      // Cancel other pending assignments
      if (assignmentId) {
        const { error } = await supabase
          .from('restaurant_assignments')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString() 
          })
          .eq('order_id', order.id)
          .eq('status', 'pending')
          .neq('id', assignmentId);
          
        if (error) {
          console.error('Failed to cancel other assignments:', error);
        }
      }
      
      // Refresh the orders
      refreshOrders();
      toast.success('Order accepted successfully!');
    } catch (e) {
      console.error('Error accepting order:', e);
      toast.error('Failed to accept order. Please try again.');
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const handleRejectOrder = async (order: RestaurantOrder, assignmentId?: string) => {
    try {
      // Get restaurant name for the order history
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', user?.id)
        .single();
        
      const restaurantName = restaurant?.name || 'Unknown Restaurant';
      
      // Update the restaurant_assignment status to 'rejected'
      if (assignmentId) {
        const { error } = await supabase
          .from('restaurant_assignments')
          .update({ 
            status: 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', assignmentId);
        
        if (error) {
          console.error('Failed to update assignment status:', error);
          toast.error('Failed to reject order. Please try again.');
          return;
        }
        
        // Add order history entry
        await supabase.from('order_history').insert({
          order_id: order.id,
          previous_status: order.status,
          status: 'restaurant_rejected',
          restaurant_id: user?.id,
          restaurant_name: restaurantName,
          changed_by_type: 'restaurant',
          details: { assignment_id: assignmentId } as Json
        });
      }
      
      // Update order status to reflect rejection
      const success = await updateOrderStatus(
        order.id,
        OrderStatus.RESTAURANT_REJECTED,
        user?.id || '',
        { assignment_id: assignmentId }
      );
      
      if (!success) {
        toast.error('Failed to reject order. Please try again.');
        return;
      }
      
      refreshOrders();
      toast.success('Order rejected successfully!');
    } catch (e) {
      console.error('Error rejecting order:', e);
      toast.error('Failed to reject order. Please try again.');
    }
  };

  if (isLoading) return <p>Loading orders...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="space-y-4">
      {orders?.length === 0 ? (
        <p>No orders found with the selected filters.</p>
      ) : (
        orders?.map((order) => (
          <div key={order.id} className="bg-white rounded-md shadow-sm p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Order #{order.formatted_order_id || order.id.substring(0, 8)}</h3>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-gray-500">
              Customer: {order.customer_name} - {order.delivery_address}, {order.city}
            </p>
            <Separator className="my-2" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-md font-semibold">Order Items:</h4>
                <ul>
                  {order.order_items.map((item) => (
                    <li key={item.id} className="text-sm">
                      {item.name} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-md font-semibold">Order Total:</h4>
                <p className="text-sm">${order.total.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  Created At: {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              {order.status === OrderStatus.AWAITING_RESTAURANT && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => handleRejectOrder(order)}
                  >
                    Reject
                  </Button>
                  <LoadingButton
                    loading={acceptingOrderId === order.id}
                    onClick={() => handleAcceptOrder(order)}
                  >
                    Accept
                  </LoadingButton>
                </>
              )}
              {order.status === OrderStatus.RESTAURANT_ASSIGNED && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => handleRejectOrder(order, (order as any).restaurant_assignment_id)}
                  >
                    Reject
                  </Button>
                  <LoadingButton
                    loading={acceptingOrderId === order.id}
                    onClick={() => handleAcceptOrder(order, (order as any).restaurant_assignment_id)}
                  >
                    Accept
                  </LoadingButton>
                </>
              )}
              {order.status === OrderStatus.PENDING && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => handleRejectOrder(order)}
                  >
                    Reject
                  </Button>
                  <LoadingButton
                    loading={acceptingOrderId === order.id}
                    onClick={() => handleAcceptOrder(order)}
                  >
                    Accept
                  </LoadingButton>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

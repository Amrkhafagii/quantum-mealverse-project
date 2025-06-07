
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface OrdersHistoryListProps {
  userId: string;
}

export const OrdersHistoryList: React.FC<OrdersHistoryListProps> = ({ userId }) => {
  const navigate = useNavigate();
  
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
  
  const getStatusColor = React.useCallback((status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'processing': return 'bg-blue-500 hover:bg-blue-600';
      case 'on_the_way': return 'bg-purple-500 hover:bg-purple-600';
      case 'delivered': return 'bg-green-500 hover:bg-green-600';
      case 'cancelled': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  }, []);
  
  const viewOrderDetails = React.useCallback((orderId: string) => {
    navigate(`/orders/${orderId}`);
  }, [navigate]);
  
  if (isLoading) {
    return <div className="text-center py-4">Loading your orders...</div>;
  }
  
  if (error) {
    return <div className="text-center py-4 text-red-500">Error loading orders</div>;
  }
  
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="mb-4">You haven't placed any orders yet.</p>
        <Button onClick={() => navigate('/customer')}>Browse Meals</Button>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                #{order.id.substring(0, 8)}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => viewOrderDetails(order.id)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

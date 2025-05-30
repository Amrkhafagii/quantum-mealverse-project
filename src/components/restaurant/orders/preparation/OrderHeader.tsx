
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Order } from '@/types/order';

interface OrderHeaderProps {
  order: Order;
  overallProgress: number;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({ order, overallProgress }) => {
  const getOrderAge = () => {
    try {
      return formatDistanceToNow(new Date(order.created_at!), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-blue-500';
      case 'ready_for_pickup': return 'bg-green-500';
      case 'restaurant_accepted': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Order #{order.formatted_order_id || order.id?.slice(0, 8)}</span>
              <Badge className={getStatusColor(order.status)}>
                {order.status?.replace('_', ' ')}
              </Badge>
            </CardTitle>
            <CardDescription>
              Received {getOrderAge()} • ${order.total?.toFixed(2)}
            </CardDescription>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {overallProgress || 0}%
            </div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

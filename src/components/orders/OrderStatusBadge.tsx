
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'awaiting_restaurant':
        return 'bg-blue-400 hover:bg-blue-500';
      case 'accepted':
        return 'bg-green-400 hover:bg-green-500';
      case 'preparing':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'ready_for_pickup':
        return 'bg-purple-400 hover:bg-purple-500';
      case 'on_the_way':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'delivered':
        return 'bg-green-500 hover:bg-green-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      case 'no_restaurant_accepted':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'rejected':
        return 'bg-red-400 hover:bg-red-500';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
};

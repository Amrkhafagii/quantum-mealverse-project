
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from '@/types/webhook';

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: OrderStatus | string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-500 hover:bg-yellow-600';
      case OrderStatus.AWAITING_RESTAURANT:
        return 'bg-blue-400 hover:bg-blue-500';
      case OrderStatus.RESTAURANT_ACCEPTED:
      case OrderStatus.RESTAURANT_ASSIGNED:
      case 'accepted':
        return 'bg-green-400 hover:bg-green-500';
      case OrderStatus.PREPARING:
      case 'preparing':
        return 'bg-blue-500 hover:bg-blue-600';
      case OrderStatus.READY_FOR_PICKUP:
      case 'ready':
        return 'bg-purple-400 hover:bg-purple-500';
      case OrderStatus.ON_THE_WAY:
      case 'delivering':
        return 'bg-purple-500 hover:bg-purple-600';
      case OrderStatus.DELIVERED:
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case OrderStatus.CANCELLED:
        return 'bg-red-500 hover:bg-red-600';
      case OrderStatus.NO_RESTAURANT_ACCEPTED:
        return 'bg-gray-500 hover:bg-gray-600';
      case OrderStatus.RESTAURANT_REJECTED:
      case 'rejected':
        return 'bg-red-400 hover:bg-red-500';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getDisplayStatus = (status: string) => {
    // Convert to display format
    return status.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Badge className={getStatusColor(status)}>
      {getDisplayStatus(status)}
    </Badge>
  );
};

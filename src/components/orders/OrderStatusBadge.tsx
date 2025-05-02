
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from '@/types/webhook';
import { mapToCanonicalStatus } from '@/utils/orderStatus';
import { Clock, CheckCircle2, XCircle, CookingPot, PackageCheck, Truck } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  showIcon?: boolean;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ 
  status,
  showIcon = false
}) => {
  // Always convert to canonical status first
  const canonicalStatus = mapToCanonicalStatus(status as string);
  
  const getStatusColor = (status: OrderStatus | string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-500 hover:bg-yellow-600';
      case OrderStatus.AWAITING_RESTAURANT:
        return 'bg-blue-400 hover:bg-blue-500';
      case OrderStatus.RESTAURANT_ACCEPTED:
      case OrderStatus.RESTAURANT_ASSIGNED:
        return 'bg-green-400 hover:bg-green-500';
      case OrderStatus.PREPARING:
        return 'bg-blue-500 hover:bg-blue-600';
      case OrderStatus.READY_FOR_PICKUP:
        return 'bg-purple-400 hover:bg-purple-500';
      case OrderStatus.ON_THE_WAY:
        return 'bg-purple-500 hover:bg-purple-600';
      case OrderStatus.DELIVERED:
        return 'bg-green-500 hover:bg-green-600';
      case OrderStatus.CANCELLED:
        return 'bg-red-500 hover:bg-red-600';
      case OrderStatus.NO_RESTAURANT_ACCEPTED:
        return 'bg-gray-500 hover:bg-gray-600';
      case OrderStatus.RESTAURANT_REJECTED:
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
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
      case OrderStatus.AWAITING_RESTAURANT:
        return <Clock className="h-4 w-4 mr-1" />;
      case OrderStatus.RESTAURANT_ACCEPTED:
      case OrderStatus.RESTAURANT_ASSIGNED:
        return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case OrderStatus.PREPARING:
        return <CookingPot className="h-4 w-4 mr-1" />;
      case OrderStatus.READY_FOR_PICKUP:
        return <PackageCheck className="h-4 w-4 mr-1" />;
      case OrderStatus.ON_THE_WAY:
        return <Truck className="h-4 w-4 mr-1" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case OrderStatus.CANCELLED:
      case OrderStatus.RESTAURANT_REJECTED:
      case OrderStatus.NO_RESTAURANT_ACCEPTED:
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <Badge className={`flex items-center ${getStatusColor(canonicalStatus)}`}>
      {showIcon && getStatusIcon(canonicalStatus)}
      <span>{getDisplayStatus(canonicalStatus)}</span>
    </Badge>
  );
};

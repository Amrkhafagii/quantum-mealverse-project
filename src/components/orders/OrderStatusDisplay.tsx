
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, PackageCheck, Truck } from 'lucide-react';
import { OrderTimer } from './status/OrderTimer';

interface OrderStatusDisplayProps {
  status: 'pending' | 'preparing' | 'enRoute' | 'delivered' | 'canceled';
  estimatedTime: Date;
}

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({ status, estimatedTime }) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          icon: Clock,
          description: 'Your order has been placed and is awaiting confirmation.',
        };
      case 'preparing':
        return {
          label: 'Preparing',
          icon: Clock,
          description: 'Your order is being prepared by the restaurant.',
        };
      case 'enRoute':
        return {
          label: 'En Route',
          icon: Truck,
          description: 'Your order is on its way!',
        };
      case 'delivered':
        return {
          label: 'Delivered',
          icon: PackageCheck,
          description: 'Your order has been delivered. Enjoy!',
        };
      case 'canceled':
        return {
          label: 'Canceled',
          icon: PackageCheck,
          description: 'Your order has been canceled.',
        };
      default:
        return {
          label: 'Unknown',
          icon: Clock,
          description: 'Order status is unknown.',
        };
    }
  };

  const statusDetails = getStatusDetails();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <statusDetails.icon className="h-4 w-4" />
          <span>Order Status: {statusDetails.label}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{statusDetails.description}</p>
        
        {status === 'enRoute' && (
          <div className="mt-4">
            <p className="text-sm">
              Estimated Delivery Time:
            </p>
            <OrderTimer startTime={estimatedTime} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

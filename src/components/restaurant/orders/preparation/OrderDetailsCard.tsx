
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerInformation } from './CustomerInformation';
import { OrderItemsDisplay } from './OrderItemsDisplay';
import { Order } from '@/types/order';

interface OrderDetailsCardProps {
  order: Order;
}

export const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({ order }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomerInformation order={order} />
          <OrderItemsDisplay order={order} />
        </div>
      </CardContent>
    </Card>
  );
};

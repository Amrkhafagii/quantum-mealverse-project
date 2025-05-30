
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderTimer } from './OrderTimer';

interface OrderStatusDisplayProps {
  orderId: string;
  status?: string;
  estimatedTime?: string;
}

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({
  orderId,
  status = 'pending',
  estimatedTime
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Order Status
          <Badge variant="outline">{status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Order ID:</span>
            <span className="font-mono text-sm">{orderId}</span>
          </div>
          
          {estimatedTime && (
            <div className="flex justify-between items-center">
              <span>Estimated Time:</span>
              <span>{estimatedTime}</span>
            </div>
          )}
          
          <OrderTimer
            orderId={orderId}
            startTime={new Date()}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatusDisplay;

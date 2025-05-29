
import React from 'react';
import { UnifiedOrderTracker } from './unified/UnifiedOrderTracker';
import { useOrderData } from '@/hooks/useOrderData';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface OrderTrackerProps {
  orderId: string;
}

const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId }) => {
  const { data: order, isLoading, error } = useOrderData(orderId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        </CardContent>
      </Card>
    );
  }

  if (error || !order) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500">
            {error instanceof Error ? error.message : 'Failed to load order'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Use unified tracker for consistent experience across all order types
  return <UnifiedOrderTracker orderId={orderId} />;
};

export default OrderTracker;

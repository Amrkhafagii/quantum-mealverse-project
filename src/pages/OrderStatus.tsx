
import React from 'react';
import { useParams } from 'react-router-dom';
import { OrderTracker } from '@/components/orders/OrderTracker';
import { useOrderData } from '@/hooks/useOrderData';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';

const OrderStatus = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrderData(id || '');

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-quantum-cyan">Order Status</h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBadge variant="small" />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        </div>
      ) : !id ? (
        <div className="text-center p-12">
          <p className="text-muted-foreground">No order ID provided</p>
          <Button asChild className="mt-4">
            <Link to="/orders">View Your Orders</Link>
          </Button>
        </div>
      ) : (
        <OrderTracker orderId={id} />
      )}
    </div>
  );
};

export default OrderStatus;

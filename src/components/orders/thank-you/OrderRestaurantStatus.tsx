import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Order } from '@/types/order';
import { Store, Clock, Timer, X, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OrderTimer } from '../status/OrderTimer';
import { toast } from '@/hooks/use-toast';

interface OrderRestaurantStatusProps {
  order: Order;
  onStatusChange?: (status: string) => void;
  onCloseModal?: () => void;
}

export const OrderRestaurantStatus: React.FC<OrderRestaurantStatusProps> = ({
  order,
  onStatusChange,
  onCloseModal
}) => {
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [timerExpiryDate, setTimerExpiryDate] = useState<Date | null>(null);
  
  const initialTimerDuration = 60 * 5; // 5 minutes
  
  useEffect(() => {
    // Set initial expiry date
    const initialExpiry = new Date(order.updated_at);
    initialExpiry.setSeconds(initialExpiry.getSeconds() + initialTimerDuration);
    setTimerExpiryDate(initialExpiry);
    
    // Check if timer has already expired on mount
    if (new Date() > initialExpiry) {
      setIsTimerExpired(true);
    }
    
    // Setup interval to check expiry every second
    const intervalId = setInterval(() => {
      if (timerExpiryDate && new Date() > timerExpiryDate) {
        setIsTimerExpired(true);
        clearInterval(intervalId);
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [order.updated_at, initialTimerDuration, timerExpiryDate]);
  
  const handleTimerExpire = () => {
    setIsTimerExpired(true);
  };
  
  const handleExtendTimer = () => {
    const extendedExpiry = new Date();
    extendedExpiry.setSeconds(extendedExpiry.getSeconds() + initialTimerDuration);
    setTimerExpiryDate(extendedExpiry);
    setIsTimerExpired(false);
    
    toast({
      title: "Timer Extended",
      description: "You have extended the restaurant's response time",
    });
  };
  
  const handleCancelOrder = async () => {
    if (onStatusChange) {
      onStatusChange('cancelled');
    }
    
    toast({
      title: "Order Cancelled",
      description: "Your order has been cancelled",
    });
    
    if (onCloseModal) {
      onCloseModal();
    }
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Store className="mr-2 h-5 w-5 text-quantum-cyan" /> 
            Restaurant Status
          </div>
          {(!isTimerExpired && order.status === 'pending') && (
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
              <Clock className="mr-1 h-3 w-3" /> Awaiting Response
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {order.restaurant?.name || 'Restaurant'} needs to confirm your order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {order.status === 'pending' && (
            <>
              {isTimerExpired ? (
                <div className="bg-amber-500/20 rounded-md p-3 text-amber-200">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="mr-2 h-5 w-5 text-amber-400" />
                    <span className="font-medium">Restaurant Response Time Exceeded</span>
                  </div>
                  <p className="text-sm opacity-80">
                    The restaurant hasn't responded to your order yet. You can choose to wait longer or try another restaurant.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-amber-500/50 text-amber-200 hover:bg-amber-500/20"
                      onClick={handleExtendTimer}
                    >
                      <Timer className="mr-1 h-4 w-4" />
                      Wait Longer
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                      onClick={handleCancelOrder}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Cancel Order
                    </Button>
                  </div>
                </div>
              ) : (
                <OrderTimer 
                  updatedAt={order.updated_at} 
                  expiresAt={timerExpiryDate} 
                  orderId={order.id}
                  onTimerExpire={handleTimerExpire} 
                />
              )}
            </>
          )}
          
          {order.status === 'confirmed' && (
            <div className="bg-green-500/10 rounded-md p-3 text-green-300">
              <div className="flex items-center mb-2">
                <Clock className="mr-2 h-5 w-5 text-green-400" />
                <span className="font-medium">Order Confirmed</span>
              </div>
              <p className="text-sm opacity-80">
                Your order has been confirmed and is being prepared.
              </p>
            </div>
          )}
          
          {order.status === 'preparing' && (
            <div className="bg-blue-500/10 rounded-md p-3 text-blue-300">
              <div className="flex items-center mb-2">
                <Clock className="mr-2 h-5 w-5 text-blue-400" />
                <span className="font-medium">Preparing Order</span>
              </div>
              <p className="text-sm opacity-80">
                Your order is being prepared by the restaurant.
              </p>
            </div>
          )}
          
          {order.status === 'ready' && (
            <div className="bg-purple-500/10 rounded-md p-3 text-purple-300">
              <div className="flex items-center mb-2">
                <Clock className="mr-2 h-5 w-5 text-purple-400" />
                <span className="font-medium">Order Ready</span>
              </div>
              <p className="text-sm opacity-80">
                Your order is ready for pickup or is awaiting delivery.
              </p>
            </div>
          )}
          
          {order.status === 'out_for_delivery' && (
            <div className="bg-orange-500/10 rounded-md p-3 text-orange-300">
              <div className="flex items-center mb-2">
                <Clock className="mr-2 h-5 w-5 text-orange-400" />
                <span className="font-medium">Out for Delivery</span>
              </div>
              <p className="text-sm opacity-80">
                Your order is out for delivery.
              </p>
            </div>
          )}
          
          {order.status === 'delivered' && (
            <div className="bg-green-500/10 rounded-md p-3 text-green-300">
              <div className="flex items-center mb-2">
                <Clock className="mr-2 h-5 w-5 text-green-400" />
                <span className="font-medium">Delivered</span>
              </div>
              <p className="text-sm opacity-80">
                Your order has been delivered.
              </p>
            </div>
          )}
          
          {order.status === 'cancelled' && (
            <div className="bg-red-500/10 rounded-md p-3 text-red-300">
              <div className="flex items-center mb-2">
                <Clock className="mr-2 h-5 w-5 text-red-400" />
                <span className="font-medium">Cancelled</span>
              </div>
              <p className="text-sm opacity-80">
                This order has been cancelled.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

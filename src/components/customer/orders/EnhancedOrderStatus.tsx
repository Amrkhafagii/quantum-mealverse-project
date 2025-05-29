
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Phone, User, Package } from 'lucide-react';
import { CustomerPreparationTracker } from '../preparation/CustomerPreparationTracker';
import { useCustomerPreparationUpdates } from '@/hooks/useCustomerPreparationUpdates';
import { Order } from '@/types/order';

interface EnhancedOrderStatusProps {
  order: Order;
}

export const EnhancedOrderStatus: React.FC<EnhancedOrderStatusProps> = ({ order }) => {
  useCustomerPreparationUpdates(order.id || '');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'restaurant_accepted':
      case 'preparing':
        return 'bg-blue-500 text-white';
      case 'ready_for_pickup':
        return 'bg-green-500 text-white';
      case 'on_the_way':
        return 'bg-purple-500 text-white';
      case 'delivered':
        return 'bg-emerald-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order has been placed and is waiting for restaurant confirmation';
      case 'restaurant_accepted':
        return 'Great! The restaurant has accepted your order and will start preparing it soon';
      case 'preparing':
        return 'Your order is being prepared with care by our chefs';
      case 'ready_for_pickup':
        return 'Your order is ready! The delivery driver will pick it up soon';
      case 'on_the_way':
        return 'Your order is on its way to you!';
      case 'delivered':
        return 'Your order has been delivered. Enjoy your meal!';
      case 'cancelled':
        return 'Your order has been cancelled';
      default:
        return 'Order status update';
    }
  };

  const showPreparationTracker = ['restaurant_accepted', 'preparing', 'ready_for_pickup'].includes(order.status);

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Order #{order.formatted_order_id || order.id?.slice(0, 8)}</span>
            </CardTitle>
            <Badge className={getStatusColor(order.status)}>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
            <p className="text-blue-900 font-medium">{getStatusMessage(order.status)}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Delivery Information</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{order.customer_name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{order.customer_phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{order.delivery_address}</span>
                </div>
              </div>
            </div>
            
            {/* Order Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Order Summary</h4>
              <div className="space-y-2">
                {order.order_items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {order.notes && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Special Instructions:</strong> {order.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preparation Tracker */}
      {showPreparationTracker && (
        <CustomerPreparationTracker orderId={order.id || ''} />
      )}

      {/* Quick Actions */}
      {(order.status === 'on_the_way' || order.status === 'delivered') && (
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Contact Driver
              </Button>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Track Delivery
              </Button>
              {order.status === 'delivered' && (
                <Button variant="outline" size="sm">
                  Rate Order
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

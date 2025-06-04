import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, Package, CheckCircle, Truck } from 'lucide-react';
import { useUnifiedOrderStatus } from '@/hooks/useUnifiedOrderStatus';
import { format } from 'date-fns';

interface UnifiedOrderTrackerProps {
  orderId: string;
}

export const UnifiedOrderTracker: React.FC<UnifiedOrderTrackerProps> = ({ orderId }) => {
  const { orderData, loading, error } = useUnifiedOrderStatus(orderId);

  if (loading.initial) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !orderData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500">
            {error ? error.message : 'Order not found'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'awaiting_restaurant':
        return <Clock className="h-5 w-5" />;
      case 'restaurant_assigned':
      case 'restaurant_accepted':
        return <User className="h-5 w-5" />;
      case 'preparing':
        return <Package className="h-5 w-5" />;
      case 'ready_for_pickup':
      case 'picked_up':
        return <CheckCircle className="h-5 w-5" />;
      case 'on_the_way':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'awaiting_restaurant':
        return 'bg-yellow-500';
      case 'restaurant_assigned':
      case 'restaurant_accepted':
      case 'preparing':
        return 'bg-blue-500';
      case 'ready_for_pickup':
      case 'picked_up':
      case 'on_the_way':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getAssignmentTypeLabel = (assignmentSource: string) => {
    return assignmentSource === 'nutrition_generated' ? 'Nutrition Plan' : 'Traditional Order';
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">
                Order #{orderData.formatted_order_id || orderData.id.substring(0, 8)}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  {getAssignmentTypeLabel(orderData.assignment_source)}
                </Badge>
                <Badge className={`${getStatusColor(orderData.status)} text-white`}>
                  {formatStatus(orderData.status)}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Placed on {format(new Date(orderData.created_at), 'MMM dd, yyyy')}
              </p>
              <p className="text-sm text-gray-600">
                at {format(new Date(orderData.created_at), 'h:mm a')}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>{orderData.customer_name}</span>
            </div>
            
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
              <span className="text-sm">{orderData.delivery_address}</span>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-medium">Total Amount</span>
              <span className="text-lg font-bold text-green-600">
                EGP {orderData.total}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderData.statusHistory && orderData.statusHistory.length > 0 ? (
              orderData.statusHistory
                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((historyItem: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${getStatusColor(historyItem.status)} text-white`}>
                      {getStatusIcon(historyItem.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{formatStatus(historyItem.status)}</h4>
                          {historyItem.restaurant_name && (
                            <p className="text-sm text-gray-600">
                              Restaurant: {historyItem.restaurant_name}
                            </p>
                          )}
                          {historyItem.details?.assignment_source && (
                            <p className="text-xs text-blue-600">
                              {getAssignmentTypeLabel(historyItem.details.assignment_source)}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(historyItem.created_at), 'MMM dd, h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${getStatusColor(orderData.status)} text-white`}>
                  {getStatusIcon(orderData.status)}
                </div>
                <div>
                  <h4 className="font-medium">{formatStatus(orderData.status)}</h4>
                  <p className="text-xs text-blue-600">
                    {getAssignmentTypeLabel(orderData.assignment_source)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

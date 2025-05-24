
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OrderRestaurantStatusProps {
  status: string;
  restaurantName?: string;
  assignmentStatus?: any;
  isCancelling: boolean;
  onCancel: () => void;
  orderId: string;
}

export const OrderRestaurantStatus: React.FC<OrderRestaurantStatusProps> = ({
  status,
  restaurantName,
  assignmentStatus,
  isCancelling,
  onCancel,
  orderId
}) => {
  const getStatusContent = () => {
    switch (status) {
      case 'pending':
      case 'awaiting_restaurant':
        if (assignmentStatus?.restaurant_name) {
          return {
            icon: <CheckCircle className="w-8 h-8 text-green-500" />,
            title: "Restaurant Found!",
            description: `${assignmentStatus.restaurant_name} will prepare your order`,
            color: "border-green-500/20 bg-green-500/10",
            showActions: false
          };
        }
        
        if (assignmentStatus?.error || assignmentStatus?.status === 'no_restaurants_available') {
          return {
            icon: <AlertCircle className="w-8 h-8 text-yellow-500" />,
            title: "Looking for Restaurants",
            description: "We're having trouble finding available restaurants in your area. Our team is working to resolve this.",
            color: "border-yellow-500/20 bg-yellow-500/10",
            showActions: true
          };
        }
        
        return {
          icon: <Loader2 className="w-8 h-8 text-quantum-cyan animate-spin" />,
          title: "Finding Your Restaurant",
          description: "We're looking for the best restaurant to prepare your order...",
          color: "border-quantum-cyan/20 bg-quantum-cyan/10",
          showActions: true
        };
        
      case 'no_restaurant_accepted':
        return {
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          title: "Restaurant Assignment Issue",
          description: "We're having difficulty assigning your order to a restaurant. Please contact support for assistance.",
          color: "border-red-500/20 bg-red-500/10",
          showActions: true
        };
        
      default:
        if (restaurantName) {
          return {
            icon: <CheckCircle className="w-8 h-8 text-green-500" />,
            title: "Restaurant Assigned",
            description: `${restaurantName} is preparing your order`,
            color: "border-green-500/20 bg-green-500/10",
            showActions: false
          };
        }
        
        return {
          icon: <Clock className="w-8 h-8 text-blue-500" />,
          title: "Order Processing",
          description: "Your order is being processed",
          color: "border-blue-500/20 bg-blue-500/10",
          showActions: false
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <Card className={`${statusContent.color} border-2`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {statusContent.icon}
          <div>
            <h3 className="text-lg font-semibold">{statusContent.title}</h3>
            <Badge variant="outline" className="mt-1">
              Order #{orderId.substring(0, 8)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 mb-4">{statusContent.description}</p>
        
        {statusContent.showActions && (
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isCancelling}
              className="border-red-500/50 text-red-300 hover:bg-red-500/20"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Order'
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-quantum-cyan/50 text-quantum-cyan hover:bg-quantum-cyan/20"
            >
              Refresh Status
            </Button>
          </div>
        )}
        
        {status === 'no_restaurant_accepted' && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>What happens next?</strong> Our team will manually assign your order to a restaurant and contact you with an update within 15 minutes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

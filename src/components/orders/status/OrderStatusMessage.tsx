
import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, Search } from 'lucide-react';
import { useOrderAssignmentStatus } from '@/hooks/useOrderAssignmentStatus';

interface OrderStatusMessageProps {
  status: string;
  order?: any;
}

export const OrderStatusMessage: React.FC<OrderStatusMessageProps> = ({ status, order }) => {
  const { assignmentStatus, isWaitingForRestaurant, hasAcceptedRestaurant } = useOrderAssignmentStatus(order?.id);

  const getStatusConfig = () => {
    // Handle the new multi-restaurant assignment statuses
    if (isWaitingForRestaurant) {
      return {
        icon: <Search className="h-6 w-6 text-blue-500 animate-pulse" />,
        title: "Finding Restaurant",
        message: `We're contacting ${assignmentStatus?.assignmentCount || 0} nearby restaurants for your order. Please wait while restaurants review your request.`,
        bgColor: "bg-blue-50",
        textColor: "text-blue-800"
      };
    }

    if (hasAcceptedRestaurant) {
      return {
        icon: <CheckCircle className="h-6 w-6 text-green-500" />,
        title: "Restaurant Confirmed",
        message: `Great! ${assignmentStatus?.restaurantName} has accepted your order and is now preparing your food.`,
        bgColor: "bg-green-50",
        textColor: "text-green-800"
      };
    }

    // Handle traditional statuses
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-6 w-6 text-yellow-500" />,
          title: "Order Received",
          message: "Your order has been received and is being processed.",
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-800"
        };

      case 'confirmed':
      case 'restaurant_accepted':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          title: "Order Confirmed",
          message: "Your order has been confirmed and the restaurant is preparing your food.",
          bgColor: "bg-green-50",
          textColor: "text-green-800"
        };

      case 'preparing':
        return {
          icon: <Clock className="h-6 w-6 text-blue-500" />,
          title: "Preparing Your Order",
          message: "The restaurant is currently preparing your delicious meal.",
          bgColor: "bg-blue-50",
          textColor: "text-blue-800"
        };

      case 'ready':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          title: "Order Ready",
          message: "Your order is ready and waiting for pickup by our delivery driver.",
          bgColor: "bg-green-50",
          textColor: "text-green-800"
        };

      case 'in_transit':
      case 'out_for_delivery':
        return {
          icon: <Clock className="h-6 w-6 text-blue-500" />,
          title: "On the Way",
          message: "Your order is on its way to you! The driver will arrive soon.",
          bgColor: "bg-blue-50",
          textColor: "text-blue-800"
        };

      case 'delivered':
      case 'completed':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          title: "Order Delivered",
          message: "Your order has been successfully delivered. Enjoy your meal!",
          bgColor: "bg-green-50",
          textColor: "text-green-800"
        };

      case 'no_restaurant_accepted':
        return {
          icon: <XCircle className="h-6 w-6 text-red-500" />,
          title: "No Restaurant Available",
          message: "Unfortunately, no restaurants in your area are available to fulfill your order right now. Please try again later.",
          bgColor: "bg-red-50",
          textColor: "text-red-800"
        };

      case 'no_restaurant_available':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-orange-500" />,
          title: "No Restaurants in Area",
          message: "We couldn't find any restaurants in your delivery area. Please check your address or try a different location.",
          bgColor: "bg-orange-50",
          textColor: "text-orange-800"
        };

      case 'cancelled':
        return {
          icon: <XCircle className="h-6 w-6 text-red-500" />,
          title: "Order Cancelled",
          message: "Your order has been cancelled.",
          bgColor: "bg-red-50",
          textColor: "text-red-800"
        };

      default:
        return {
          icon: <Clock className="h-6 w-6 text-gray-500" />,
          title: "Processing Order",
          message: "Your order is being processed.",
          bgColor: "bg-gray-50",
          textColor: "text-gray-800"
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`rounded-lg p-4 ${config.bgColor} border`}>
      <div className="flex items-start space-x-3">
        {config.icon}
        <div className="flex-1">
          <h3 className={`font-semibold ${config.textColor}`}>
            {config.title}
          </h3>
          <p className={`mt-1 text-sm ${config.textColor}`}>
            {config.message}
          </p>
          
          {/* Show assignment details when waiting for restaurant */}
          {isWaitingForRestaurant && assignmentStatus && (
            <div className="mt-2 text-xs text-blue-600">
              {assignmentStatus.pendingCount > 0 && (
                <div>• {assignmentStatus.pendingCount} restaurants reviewing</div>
              )}
              {assignmentStatus.rejectedCount > 0 && (
                <div>• {assignmentStatus.rejectedCount} restaurants declined</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

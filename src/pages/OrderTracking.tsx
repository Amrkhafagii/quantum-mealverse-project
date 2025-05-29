
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import OrderTracker from '@/components/orders/OrderTracker';
import { useOrderData } from '@/hooks/useOrderData';
import { useRealtimeLocation } from '@/hooks/useRealtimeLocation';

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: order, isLoading } = useOrderData(orderId || '');
  const { latestLocation } = useRealtimeLocation({ 
    assignmentId: orderId || '' 
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!orderId) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500">No order ID provided</p>
            <Button 
              onClick={() => navigate('/orders')} 
              className="mt-4"
            >
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleContactDriver = () => {
    if (order?.delivery_user_id) {
      // Navigate to communication interface or open phone
      console.log('Contacting driver for order:', orderId);
    }
  };

  const handleBackToOrders = () => {
    navigate('/orders');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={handleBackToOrders}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
        
        {order?.delivery_user_id && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleContactDriver}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Driver
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleContactDriver}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        )}
      </div>

      {/* Order Tracker - Only pass orderId */}
      <OrderTracker orderId={orderId} />

      {/* Driver Location Info */}
      {latestLocation && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Last updated: {new Date(latestLocation.timestamp).toLocaleTimeString()}
            </p>
            {latestLocation.accuracy && (
              <p className="text-xs text-gray-500">
                Accuracy: ±{Math.round(latestLocation.accuracy)}m
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderTracking;

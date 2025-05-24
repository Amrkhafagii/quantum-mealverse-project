
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Phone, MessageCircle, MapPin, Clock, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useOrderData } from '@/hooks/useOrderData';
import { useInterval } from '@/hooks/use-interval';
import { useRealtimeLocation } from '@/hooks/useRealtimeLocation';
import { useDeliveryStatusSync } from '@/hooks/useDeliveryStatusSync';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { OrderStatusDisplay } from '@/components/orders/status/OrderStatusDisplay';
import OrderLocationMap from '@/components/orders/OrderLocationMap';
import OrderTracker from '@/components/orders/OrderTracker';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [estimatedTime, setEstimatedTime] = useState<string>('Calculating...');
  
  const { data: order, isLoading, error, refetch } = useOrderData(id || '');
  const { sync: syncStatus, isSyncing } = useDeliveryStatusSync(id || '');
  
  // Real-time location tracking for delivery
  const { latestLocation, isSubscribed } = useRealtimeLocation({
    assignmentId: order?.delivery_assignment?.id,
    onLocationUpdate: (location) => {
      console.log('Driver location updated:', location);
    }
  });

  // Poll for order updates
  useInterval(() => {
    if (order && !['delivered', 'cancelled'].includes(order.status)) {
      refetch();
    }
  }, 10000); // Poll every 10 seconds

  // Calculate estimated delivery time
  useEffect(() => {
    if (!order) return;
    
    const statusTimeMap: Record<string, number> = {
      'pending': 45,
      'confirmed': 35,
      'preparing': 25,
      'ready': 15,
      'picked_up': 10,
      'on_the_way': 5,
      'delivered': 0,
      'cancelled': 0
    };
    
    const minutes = statusTimeMap[order.status] || 0;
    if (minutes === 0) {
      setEstimatedTime(order.status === 'delivered' ? 'Delivered' : 'N/A');
    } else {
      setEstimatedTime(`${minutes} minutes`);
    }
  }, [order?.status]);

  // Handle contact actions
  const handleContactSupport = () => {
    toast({
      title: "Contact Support",
      description: "Redirecting to support chat...",
    });
  };

  const handleCallDelivery = () => {
    if (order?.delivery_assignment?.delivery_user?.phone) {
      window.open(`tel:${order.delivery_assignment.delivery_user.phone}`);
    } else {
      toast({
        title: "Driver contact unavailable",
        description: "Driver contact information is not available yet.",
        variant: "destructive"
      });
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-quantum-black to-quantum-darkBlue text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-quantum-cyan" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Render error state
  if (error || !id || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-quantum-black to-quantum-darkBlue text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
                <p className="mb-6">We couldn't find the order you're looking for.</p>
                <Button asChild>
                  <Link to="/orders">View Your Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const showMap = order && ['preparing', 'ready', 'picked_up', 'on_the_way'].includes(order.status);
  const showDriverInfo = order?.delivery_assignment && ['picked_up', 'on_the_way'].includes(order.status);

  return (
    <div className="min-h-screen bg-quantum-black text-white flex flex-col">
      <div className="relative w-full flex-grow">
        <ParticleBackground />
        <Navbar />
        
        <main className="container mx-auto px-4 py-24 relative z-10">
          {/* Back navigation */}
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/orders">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Track Order</h1>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Order Header */}
            <Card className="holographic-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      Order #{order.formatted_order_id || id.substring(0, 8)}
                    </CardTitle>
                    <p className="text-gray-400 mt-1">
                      Placed on {format(new Date(order.created_at!), 'MMM dd, yyyy at h:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-quantum-cyan" />
                      <span className="text-sm">ETA: {estimatedTime}</span>
                    </div>
                    {isSyncing && (
                      <Badge variant="outline" className="text-xs">
                        Syncing...
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <OrderStatusDisplay order={order} />
              </CardContent>
            </Card>

            {/* Live Tracking Map */}
            {showMap && (
              <Card className="holographic-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-quantum-cyan" />
                    Live Tracking
                    {isSubscribed && (
                      <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400">
                        Live
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-quantum-cyan/20">
                    <OrderTracker
                      order={order}
                      driverLocation={latestLocation}
                      onContactDriver={handleCallDelivery}
                      orderId={id}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Driver Information */}
            {showDriverInfo && (
              <Card className="holographic-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-quantum-cyan" />
                    Your Driver
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {order.delivery_assignment?.delivery_user?.first_name || 'Driver'} 
                        {order.delivery_assignment?.delivery_user?.last_name && 
                          ` ${order.delivery_assignment.delivery_user.last_name}`
                        }
                      </p>
                      <p className="text-sm text-gray-400">
                        {order.delivery_assignment?.delivery_vehicle?.type || 'Vehicle'} • 
                        Rating: {order.delivery_assignment?.delivery_user?.average_rating || 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCallDelivery}>
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleContactSupport}>
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Details Summary */}
            <Card className="holographic-card">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Delivery Address:</span>
                    <span className="text-right">{order.delivery_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Method:</span>
                    <span>{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total:</span>
                    <span className="font-medium">EGP {order.total}</span>
                  </div>
                  {order.notes && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Notes:</span>
                      <span className="text-right">{order.notes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="holographic-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-medium mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Contact our support team if you have any questions about your order.
                  </p>
                  <Button variant="outline" onClick={handleContactSupport}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderTracking;

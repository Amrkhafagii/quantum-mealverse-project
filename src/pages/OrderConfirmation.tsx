import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Share2, Download, Printer, CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useOrderData } from '@/hooks/useOrderData';
import { useInterval } from '@/hooks/use-interval';
import { checkAssignmentStatus } from '@/services/orders/webhookService';
import { cancelOrder } from '@/services/orders/orderService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { OrderHeader } from '@/components/orders/thank-you/OrderHeader';
import OrderStatusDisplay from '@/components/orders/OrderStatusDisplay'; // Fixed import
import { OrderItemsList } from '@/components/orders/OrderItemsList';
import { OrderRestaurantStatus } from '@/components/orders/thank-you/OrderRestaurantStatus';
import { ActionButtons } from '@/components/orders/thank-you/ActionButtons';
import { OrderDetailsGrid } from '@/components/orders/OrderDetailsGrid';
import OrderLocationMap from '@/components/orders/OrderLocationMap';
import { format } from 'date-fns';

// Create proper interface for components with className prop
interface ComponentProps {
  className?: string;
}

const OrderProgressSteps: React.FC<ComponentProps> = ({ className }) => (
  <div className={className}>
    {/* Progress steps content */}
  </div>
);

const PaymentStatusMessage: React.FC<ComponentProps> = ({ className }) => (
  <div className={className}>
    {/* Payment status message content */}
  </div>
);

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState<any>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const { data: order, isLoading, error, refetch } = useOrderData(id || '');

  // Check assignment status on initial load
  useEffect(() => {
    if (id && order && ['pending', 'awaiting_restaurant'].includes(order.status)) {
      checkAssignmentStatus(id)
        .then(status => {
          setAssignmentStatus(status);
        })
        .catch(err => console.error('Error checking assignment status:', err));
    }
  }, [id, order?.status]);

  // Poll for updates if order is in a pending state
  useInterval(() => {
    if (order && ['pending', 'awaiting_restaurant'].includes(order.status)) {
      checkAssignmentStatus(id!)
        .then(status => {
          setAssignmentStatus(status);
          refetch();
        })
        .catch(err => console.error('Error polling assignment status:', err));
    }
  }, 5000);

  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (!id || isCancelling) return;
    
    setIsCancelling(true);
    try {
      await cancelOrder(id);
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully."
      });
      refetch();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle order sharing
  const handleShareOrder = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Order',
          text: `Check out my order #${order?.formatted_order_id || id?.substring(0, 8)}`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Order link copied to clipboard"
      });
    }
  };

  // Handle receipt download
  const handleDownloadReceipt = () => {
    // This is a placeholder - would typically generate a PDF receipt
    toast({
        title: "Receipt downloaded",
        description: "Your receipt has been downloaded"
    });
  };

  // Handle printing
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
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
  if (error || !id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-quantum-black to-quantum-darkBlue text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
                <p className="mb-6">We couldn't find the order information you're looking for.</p>
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

  // Calculate if we should show the map
  const showMap = order && ['preparing', 'ready_for_pickup', 'picked_up', 'on_the_way'].includes(order.status);

  // Determine estimated delivery/pickup time
  const getEstimatedTime = () => {
    if (!order) return 'Unknown';
    
    if (order.status === 'pending' || order.status === 'awaiting_restaurant') {
      return 'Pending restaurant assignment';
    }
    
    // This would be replaced with actual estimated times from the backend
    const baseTimeMap: Record<string, number> = {
      'accepted': 30,
      'processing': 25,
      'preparing': 20,
      'ready': 15,
      'delivering': 10,
      'completed': 0
    };
    
    const estimatedMinutes = baseTimeMap[order.status] || 0;
    
    if (estimatedMinutes === 0) return 'Delivered';
    return `~${estimatedMinutes} minutes`;
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white flex flex-col">
      <div className="relative w-full flex-grow">
        <ParticleBackground />
        <Navbar />
        
        <main className="container mx-auto px-4 py-24 relative z-10">
          {/* Back navigation */}
          <div className="flex items-center gap-2 mb-6 print:hidden">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/orders">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Order Confirmation</h1>
          </div>

          {/* Print only header */}
          <div className="hidden print:block mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Order Receipt</h1>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
            <p className="text-gray-500">Thank you for your order!</p>
          </div>
          
          {/* Order confirmation card */}
          <Card className="max-w-4xl mx-auto holographic-card print:shadow-none print:border-0">
            <CardHeader className="print:pb-2">
              {/* Order confirmation header with success icon */}
              <OrderHeader 
                orderId={id}
                formattedOrderId={order?.formatted_order_id}
              />
            </CardHeader>
            
            <CardContent className="space-y-8 print:space-y-4">
              {/* Restaurant assignment status for pending orders */}
              {order && ['pending', 'awaiting_restaurant'].includes(order.status) && (
                <OrderRestaurantStatus
                  status={order.status}
                  restaurantName={assignmentStatus?.restaurant_name}
                  assignmentStatus={assignmentStatus}
                  isCancelling={isCancelling}
                  onCancel={handleCancelOrder}
                  orderId={id}
                />
              )}
              
              {/* Show location map for delivery orders in progress */}
              {showMap && order?.latitude && order?.longitude && (
                <div className="print:hidden">
                  <h3 className="text-lg font-semibold mb-3">Order Tracking</h3>
                  <div className="rounded-lg overflow-hidden border border-quantum-cyan/20">
                    <OrderLocationMap order={order} />
                  </div>
                </div>
              )}
              
              {/* Order details with estimated time */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Order Details</h3>
                  <div className="bg-quantum-cyan/20 px-3 py-1 rounded-full text-quantum-cyan text-sm">
                    ETA: {getEstimatedTime()}
                  </div>
                </div>
                
                <OrderDetailsGrid order={order} />
              </div>
              
              {/* Order items and totals */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                {order?.order_items && (
                  <OrderItemsList 
                    items={order.order_items}
                    subtotal={order.subtotal}
                    deliveryFee={order.delivery_fee}
                    total={order.total}
                  />
                )}
              </div>
            </CardContent>
            
            {/* Action buttons */}
            <CardFooter className="pt-0 pb-6 flex-col space-y-4 print:hidden">
              <ActionButtons 
                orderId={id}
                onTrackOrder={(orderId) => navigate(`/track-order/${orderId}`)}
                onContinueShopping={() => navigate('/customer')}
              />
              
              {/* Additional actions (share, download, print) */}
              <div className="flex flex-wrap justify-center gap-3 w-full mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShareOrder}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" /> Share
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadReceipt}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" /> Receipt
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" /> {isPrinting ? 'Printing...' : 'Print'}
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {/* Schema data for search engines */}
          {order && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "OrderConfirmation",
                "orderNumber": order.formatted_order_id || id,
                "orderDate": order.created_at,
                "orderStatus": order.status,
                "totalPrice": {
                  "@type": "MonetaryAmount",
                  "currency": "EGP",
                  "value": order.total
                }
              })
            }} />
          )}
        </main>
      </div>
      
      <Footer />
      
      {/* Print-specific styles */}
      <style>
        {`
          @media print {
            @page { margin: 0.5in; }
            body { background: white; color: black; }
            .holographic-card { box-shadow: none; background: white; }
          }
        `}
      </style>
    </div>
  );
};

export default OrderConfirmation;

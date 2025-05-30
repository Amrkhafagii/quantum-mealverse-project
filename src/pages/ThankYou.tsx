import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Card } from "@/components/ui/card";
import { OrderHeader } from '@/components/orders/thank-you/OrderHeader';
import { OrderRestaurantStatus } from '@/components/orders/thank-you/OrderRestaurantStatus';
import { OrderSummary } from '@/components/orders/thank-you/OrderSummary';
import { ActionButtons } from '@/components/orders/thank-you/ActionButtons';
import { useToast } from '@/hooks/use-toast';
import { useInterval } from '@/hooks/use-interval';
import { cancelOrder } from '@/services/orders/orderService';
import { checkAssignmentStatus } from '@/services/orders/webhookService';
import { supabase } from '@/integrations/supabase/client';
import OrderStatusDisplay from '@/components/orders/OrderStatusDisplay';

const ThankYou = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [assignmentStatus, setAssignmentStatus] = React.useState<any>(null);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId || isCancelling) return;
    
    setIsCancelling(true);
    try {
      await cancelOrder(orderId);
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully."
      });
      fetchOrderDetails();
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

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }
    fetchOrderDetails();
  }, [orderId, navigate]);

  useInterval(() => {
    if (order && ['pending', 'awaiting_restaurant'].includes(order.status)) {
      checkAssignmentStatus(orderId!)
        .then(status => {
          setAssignmentStatus(status);
          fetchOrderDetails();
        })
        .catch(err => console.error('Error checking assignment status:', err));
    }
  }, 5000);

  if (!orderId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-quantum-black via-quantum-darkBlue to-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
        <Card className="holographic-card p-12 max-w-3xl mx-auto space-y-8">
          {loading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Loading order details...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <OrderHeader 
                orderId={orderId}
                formattedOrderId={order?.formatted_order_id}
              />

              {order && ['pending', 'awaiting_restaurant'].includes(order.status) && (
                <OrderRestaurantStatus
                  status={order.status}
                  restaurantName={assignmentStatus?.restaurant_name}
                  assignmentStatus={assignmentStatus}
                  isCancelling={isCancelling}
                  onCancel={handleCancelOrder}
                  orderId={orderId}
                />
              )}

              <OrderSummary order={order} />

              <ActionButtons
                orderId={orderId}
                onTrackOrder={(id) => navigate(`/orders/${id}`)}
                onContinueShopping={() => navigate('/customer')}
              />
            </div>
          )}
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default ThankYou;

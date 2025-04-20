
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building, Check, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';
import { checkAssignmentStatus } from '@/integrations/webhook';
import { useInterval } from '@/hooks/use-interval';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import { CircularTimer } from '@/components/orders/status/CircularTimer';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { cancelOrder } from '@/services/orders/orderService';

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isCancelling, setIsCancelling] = React.useState(false);

  const [assignmentStatus, setAssignmentStatus] = React.useState<{
    status: string;
    assigned_restaurant_id?: string;
    restaurant_name?: string;
    assignment_id?: string;
    expires_at?: string;
    attempt_count: number;
  } | null>(null);

  const { timeLeft, totalTime } = useCountdownTimer(assignmentStatus?.expires_at);

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
      fetchOrderDetails(); // Refresh order data after cancellation
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

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  if (!orderId) {
    useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }

  // Calculate the progress based on the attempt count
  const getProgressValue = () => {
    if (!assignmentStatus) return 33.33;
    const { attempt_count } = assignmentStatus;
    return ((3 - attempt_count + 1) / 3) * 100;
  };

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
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-12 h-12 text-green-500" />
                </div>
                
                <h1 className="text-4xl font-bold text-quantum-cyan mb-2 neon-text">Order Confirmed!</h1>
                <p className="text-2xl mb-2">Order #{order?.formatted_order_id || orderId.substring(0, 8)}</p>
                
                <p className="text-gray-400">
                  We're looking for the perfect restaurant to prepare your order.
                  You can track the progress below.
                </p>
              </div>

              {order && ['pending', 'awaiting_restaurant'].includes(order.status) && (
                <div className="space-y-6 py-4">
                  {assignmentStatus?.restaurant_name && (
                    <div className="flex items-center justify-center gap-2 text-quantum-cyan">
                      <Building className="h-5 w-5" />
                      <span className="text-lg">{assignmentStatus.restaurant_name}</span>
                    </div>
                  )}

                  <div className="max-w-md mx-auto space-y-6">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-2 text-gray-300">
                        <Clock className="h-5 w-5" />
                        <span>Waiting for confirmation from Restaurant...</span>
                      </div>
                      <div className="flex justify-between w-full text-sm mb-2">
                        <span></span>
                        <span>Attempt {assignmentStatus?.attempt_count || 1} of 3</span>
                      </div>
                      
                      {assignmentStatus?.expires_at && (
                        <div className="mb-4">
                          <CircularTimer timeLeft={timeLeft} totalTime={totalTime} />
                        </div>
                      )}

                      <Progress 
                        value={getProgressValue()} 
                        className="h-2 w-full bg-gradient-to-r from-quantum-cyan to-quantum-purple" 
                      />
                    </div>

                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      onClick={handleCancelOrder}
                      disabled={isCancelling}
                    >
                      {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-800">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Delivery Details</h3>
                  <div className="space-y-2 text-gray-300">
                    <p>{order?.delivery_address}</p>
                    <p>{order?.city}</p>
                    <p>{order?.customer_phone}</p>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-xl font-semibold mb-2">Delivery Method</h3>
                    <p className="text-gray-300">{order?.delivery_method}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal:</span>
                      <span>{order?.subtotal.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Delivery:</span>
                      <span>{order?.delivery_fee.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between text-xl font-semibold text-quantum-cyan pt-2">
                      <span>Total:</span>
                      <span>{order?.total.toFixed(2)} EGP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <Button 
                  onClick={() => navigate(`/orders/${orderId}`)}
                  className="w-full"
                >
                  Track Your Order
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/customer')}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default ThankYou;

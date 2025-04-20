
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Clock, Building, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';
import { checkAssignmentStatus } from '@/integrations/webhook';
import { useInterval } from '@/hooks/use-interval';
import { OrderStatusDisplay } from '@/components/orders/OrderStatusDisplay';
import { OrderDetailsDisplay } from '@/components/orders/OrderDetailsDisplay';
import { CircularTimer } from '@/components/orders/status/CircularTimer';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import { Progress } from "@/components/ui/progress";

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [assignmentStatus, setAssignmentStatus] = React.useState<{
    status: string;
    assigned_restaurant_id?: string;
    restaurant_name?: string;
    assignment_id?: string;
    expires_at?: string;
    attempt_count: number;
  } | null>(null);

  const { timeLeft, totalTime, formattedTime } = useCountdownTimer(assignmentStatus?.expires_at);

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

  // Check assignment status more frequently (every 5 seconds)
  useInterval(() => {
    if (order && ['pending', 'awaiting_restaurant'].includes(order.status)) {
      checkAssignmentStatus(orderId!)
        .then(status => {
          setAssignmentStatus(status);
          fetchOrderDetails(); // Always refetch order details
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
    
    return (
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
          <Card className="holographic-card p-12 max-w-3xl mx-auto">
            <p className="text-center">Redirecting to home page...</p>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
        <Card className="holographic-card p-12 max-w-3xl mx-auto">
          {loading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Loading order details...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-12 h-12 text-green-500" />
                </div>
                
                <h1 className="text-4xl font-bold text-quantum-cyan mb-4 neon-text">Order Confirmed!</h1>
                <p className="text-xl mb-2">Order #{order?.formatted_order_id || orderId.substring(0, 8)}</p>
                
                {order && ['pending', 'awaiting_restaurant'].includes(order.status) && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400">
                      We're looking for the perfect restaurant to prepare your order.
                      You can track the progress below.
                    </p>
                    
                    {assignmentStatus?.restaurant_name && (
                      <div className="flex items-center justify-center gap-2 text-quantum-cyan">
                        <Building className="h-4 w-4" />
                        <span>{assignmentStatus.restaurant_name}</span>
                      </div>
                    )}
                    
                    {assignmentStatus?.expires_at && (
                      <div className="max-w-md mx-auto">
                        <div className="flex justify-center mb-4">
                          <CircularTimer timeLeft={timeLeft} totalTime={totalTime} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Restaurant response time:</span>
                            </div>
                            <span>{formattedTime}</span>
                          </div>
                          <Progress value={(timeLeft / totalTime) * 100} className="h-2" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {order && (
                <>
                  <div className="border-t border-b border-gray-800 py-6">
                    <OrderStatusDisplay 
                      order={order} 
                      assignmentStatus={assignmentStatus} 
                      onOrderUpdate={fetchOrderDetails}
                    />
                  </div>
                  <OrderDetailsDisplay order={order} />
                </>
              )}

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

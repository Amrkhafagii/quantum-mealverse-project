import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';
import { checkAssignmentStatus } from '@/integrations/webhook';
import { useInterval } from '@/hooks/use-interval';

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignmentStatus, setAssignmentStatus] = useState<{
    status: string;
    assigned_restaurant_id?: string;
    attempt_count: number;
    expires_at?: string;
  } | null>(null);

  useEffect(() => {
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

  useInterval(() => {
    if (order && ['pending', 'awaiting_restaurant'].includes(order.status)) {
      checkAssignmentStatus(orderId)
        .then(status => {
          setAssignmentStatus(status);
          
          if (status.status !== 'awaiting_response') {
            refetch();
          }
        })
        .catch(err => console.error('Error checking assignment status:', err));
    }
  }, 10000);

  const renderOrderStatus = () => {
    if (!order) return null;
    
    let statusMessage = '';
    let statusDetails = '';
    
    switch (order.status) {
      case 'pending':
        statusMessage = 'Finding a restaurant to fulfill your order...';
        if (assignmentStatus?.attempt_count) {
          statusDetails = `Attempt ${assignmentStatus.attempt_count} of 3`;
        }
        break;
      case 'awaiting_restaurant':
        statusMessage = 'A restaurant is reviewing your order...';
        if (assignmentStatus?.expires_at) {
          const expiresAt = new Date(assignmentStatus.expires_at);
          const timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
          statusDetails = `Restaurant has ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')} to respond`;
        }
        break;
      case 'processing':
        statusMessage = 'Your order is being prepared!';
        break;
      case 'on_the_way':
        statusMessage = 'Your order is on the way to you!';
        break;
      case 'delivered':
        statusMessage = 'Your order has been delivered. Enjoy!';
        break;
      case 'cancelled':
        statusMessage = 'Your order has been cancelled.';
        break;
      case 'assignment_failed':
        statusMessage = 'We couldn\'t find a restaurant for your order right now.';
        statusDetails = 'Please try again in a few minutes.';
        break;
      case 'no_restaurants_available':
        statusMessage = 'No restaurants available in your area.';
        statusDetails = 'Please try a different delivery address or try again later.';
        break;
      default:
        statusMessage = `Order Status: ${order.status}`;
    }
    
    return (
      <div className="space-y-2">
        <p className="text-lg">{statusMessage}</p>
        {statusDetails && <p className="text-sm text-gray-400">{statusDetails}</p>}
        {assignmentStatus?.attempt_count > 0 && order.status !== 'processing' && (
          <p className="text-sm text-gray-400">
            Assignment attempt: {assignmentStatus.attempt_count} of 3
          </p>
        )}
      </div>
    );
  };

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
                <p className="text-xl mb-6">Order #{orderId}</p>
              </div>

              {order && (
                <div className="space-y-4 border-t border-quantum-cyan/20 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Delivery Details</h3>
                      <p className="text-sm text-gray-300">{order.customer_name}</p>
                      <p className="text-sm text-gray-300">{order.delivery_address}</p>
                      <p className="text-sm text-gray-300">{order.city}</p>
                      <p className="text-sm text-gray-300">{order.customer_phone}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Order Summary</h3>
                      <p className="text-sm text-gray-300">Subtotal: {order.subtotal.toFixed(2)} EGP</p>
                      <p className="text-sm text-gray-300">Delivery: {order.delivery_fee.toFixed(2)} EGP</p>
                      <p className="text-sm font-semibold text-quantum-cyan">Total: {order.total.toFixed(2)} EGP</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Delivery Method</h3>
                    <p className="text-sm text-gray-300 capitalize">{order.delivery_method}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Payment Method</h3>
                    <p className="text-sm text-gray-300 capitalize">{order.payment_method}</p>
                  </div>

                  {order.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Notes</h3>
                      <p className="text-sm text-gray-300">{order.notes}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4 pt-6">
                <Button className="cyber-button w-full" onClick={() => navigate('/customer')}>
                  Continue Shopping
                </Button>
                
                <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                  Return to Home
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

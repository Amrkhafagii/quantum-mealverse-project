
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
import { OrderStatusDisplay } from '@/components/orders/OrderStatusDisplay';
import { OrderDetailsDisplay } from '@/components/orders/OrderDetailsDisplay';

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignmentStatus, setAssignmentStatus] = useState<{
    status: string;
    assigned_restaurant_id?: string;
    assignment_id?: string;
    expires_at?: string;
    attempt_count: number;
  } | null>(null);

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

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // Check assignment status initially
  useEffect(() => {
    if (orderId && order && ['pending', 'awaiting_restaurant'].includes(order.status)) {
      checkAssignmentStatus(orderId)
        .then(status => setAssignmentStatus(status))
        .catch(err => console.error('Error checking initial assignment status:', err));
    }
  }, [orderId, order]);

  // Poll for updates more frequently (every 5 seconds) to catch restaurant changes faster
  useInterval(() => {
    if (order && ['pending', 'awaiting_restaurant'].includes(order.status)) {
      checkAssignmentStatus(orderId!)
        .then(status => {
          setAssignmentStatus(status);
          
          // Always refetch to ensure we have the latest order data
          // This ensures we catch transitions between restaurants
          fetchOrderDetails();
        })
        .catch(err => console.error('Error checking assignment status:', err));
    }
  }, 5000);

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
                  <p className="text-sm text-gray-400">
                    We're looking for the perfect restaurant to prepare your order.
                    You can track the progress below.
                  </p>
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
                  onClick={() => navigate('/orders')} 
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


import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Order } from '@/types/order';
import { OrderStatusDisplay } from '@/components/orders/status/OrderStatusDisplay';

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      setLoading(true);
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

        if (error) {
          console.error('Error fetching order:', error);
          toast({
            title: "Error",
            description: "Failed to load order details.",
            variant: "destructive",
          });
        } else {
          setOrder(data);
          clearCart();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, clearCart, toast]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!orderId) {
    return <Navigate to="/customer" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-quantum-black via-quantum-darkBlue to-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {loading ? (
            <Card className="holographic-card p-8">
              <div className="flex items-center justify-center">
                <Clock className="h-8 w-8 animate-spin mr-3" />
                <span className="text-lg">Loading order details...</span>
              </div>
            </Card>
          ) : !order ? (
            <Card className="holographic-card p-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-400 mb-4">Order Not Found</h1>
                <p className="text-gray-300 mb-6">
                  We couldn't find the order you're looking for.
                </p>
                <Button onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <Card className="holographic-card p-8">
                <div className="text-center mb-6">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-quantum-cyan mb-2">
                    Order Confirmed!
                  </h1>
                  <p className="text-gray-300">
                    Order #{order.formatted_order_id || order.id}
                  </p>
                </div>

                <OrderStatusDisplay order={order} />
              </Card>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;

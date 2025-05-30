
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OrderStatusDisplay } from '@/components/orders/status/OrderStatusDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';

interface Order {
  id: string;
  status: string;
  created_at: string;
  estimated_delivery_time?: string;
}

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data as Order;
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-quantum-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
          <Card className="max-w-md mx-auto bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="text-center text-red-400">Order Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-400">
                We couldn't find an order with ID: {orderId}
              </p>
            </CardContent>
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
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Order Confirmation</h1>
          
          <Card className="mb-6 bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="text-center text-green-400">
                Order Placed Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-300 mb-4">
                Thank you for your order. We'll prepare your meal with care.
              </p>
              <div className="text-center">
                <span className="text-quantum-cyan font-mono">Order #{orderId}</span>
              </div>
            </CardContent>
          </Card>

          <OrderStatusDisplay
            orderId={orderId!}
            status={order.status}
            estimatedTime={order.estimated_delivery_time}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;

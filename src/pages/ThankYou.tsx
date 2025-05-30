
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { OrderStatusDisplay } from '@/components/orders/status/OrderStatusDisplay';

const ThankYou = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="mb-8 bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <CardTitle className="text-3xl text-green-400">
                Thank You!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-lg mb-6">
                Your order has been confirmed and our quantum chefs are preparing your meal with care.
              </p>
              {orderId && (
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-2">Order Number:</p>
                  <p className="text-quantum-cyan font-mono text-xl">#{orderId}</p>
                </div>
              )}
              <p className="text-gray-400">
                You'll receive updates about your order status via email and notifications.
              </p>
            </CardContent>
          </Card>

          {orderId && (
            <OrderStatusDisplay
              orderId={orderId}
              status="confirmed"
              estimatedTime="30-45 minutes"
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ThankYou;

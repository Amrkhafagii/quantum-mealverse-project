
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from 'lucide-react';

const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
        <Card className="holographic-card p-12 max-w-3xl mx-auto text-center">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-500" />
          </div>
          
          <h1 className="text-4xl font-bold text-quantum-cyan mb-4 neon-text">Order Confirmed!</h1>
          
          {orderId && (
            <p className="text-xl mb-6">
              Your order #{orderId} has been received and is being processed.
            </p>
          )}
          
          <p className="mb-8 text-gray-300">
            Thank you for your order! We've sent a confirmation to your email address.
            You will receive another notification when your order is ready.
          </p>
          
          <div className="space-y-4">
            <Button className="cyber-button w-full" onClick={() => navigate('/customer')}>
              Continue Shopping
            </Button>
            
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </div>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default ThankYou;

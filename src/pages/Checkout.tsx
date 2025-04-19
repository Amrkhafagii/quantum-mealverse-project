
import React from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { CheckoutAuthForm } from '@/components/CheckoutAuthForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { DeliveryForm } from '@/components/checkout/DeliveryForm';
import { EmptyCartMessage } from '@/components/checkout/EmptyCartMessage';
import { AuthOptions } from '@/components/checkout/AuthOptions';
import { useCheckout } from '@/hooks/useCheckout';

const Checkout = () => {
  const {
    items,
    isSubmitting,
    loggedInUser,
    hasDeliveryInfo,
    defaultValues,
    showLoginPrompt,
    handleAuthSubmit,
    handleSubmit
  } = useCheckout();

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
        <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Checkout</h1>
        
        {items.length === 0 ? (
          <EmptyCartMessage />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {showLoginPrompt ? (
                <AuthOptions />
              ) : (
                <>
                  {!loggedInUser && (
                    <CheckoutAuthForm 
                      onSubmit={handleAuthSubmit}
                      email={loggedInUser?.email}
                      showPassword={!loggedInUser && !hasDeliveryInfo}
                    />
                  )}
                  
                  {(loggedInUser || hasDeliveryInfo) && (
                    <DeliveryForm
                      onSubmit={handleSubmit}
                      defaultValues={defaultValues}
                      isSubmitting={isSubmitting}
                    />
                  )}
                </>
              )}
            </div>
            
            <div>
              <OrderSummary />
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;

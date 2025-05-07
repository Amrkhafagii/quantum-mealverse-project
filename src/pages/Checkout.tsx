
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
import { Loader2, WifiOff } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ConnectionStateIndicator } from '@/components/ui/ConnectionStateIndicator';

const Checkout = () => {
  const {
    items,
    isSubmitting,
    loggedInUser,
    hasDeliveryInfo,
    defaultValues,
    showLoginPrompt,
    isLoadingUserData,
    handleAuthSubmit,
    handleSubmit
  } = useCheckout();
  
  const { isOnline } = useConnectionStatus();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-quantum-cyan neon-text">Checkout</h1>
          <ConnectionStateIndicator showText={true} />
        </div>
        
        {!isOnline && (
          <div className="bg-amber-900/20 border border-amber-500/30 text-amber-200 px-4 py-3 rounded-md mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center">
              <WifiOff className="h-5 w-5 mr-2" />
              <p className="text-amber-200">You are currently offline. Checkout is not available.</p>
            </div>
            <Button 
              variant="outline" 
              className="border-amber-500/50 text-amber-200 hover:bg-amber-900/30"
              onClick={() => navigate(-1)}
            >
              Return to previous page
            </Button>
          </div>
        )}
        
        {items.length === 0 ? (
          <EmptyCartMessage />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {isLoadingUserData ? (
                <div className="holographic-card p-6 flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
                  <span className="ml-2">Loading your information...</span>
                </div>
              ) : showLoginPrompt ? (
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
                      disabled={!isOnline}
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

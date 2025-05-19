
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { AuthCheck } from '@/components/orders/AuthCheck';
import { OrdersHeader } from '@/components/orders/OrdersHeader';
import { OrdersContent } from '@/components/orders/OrdersContent';
import { useOrdersSync } from '@/hooks/orders/useOrdersSync';
import { useOrderSession } from '@/hooks/orders/useOrderSession';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const navigate = useNavigate();
  const { session, isLoading: sessionLoading } = useOrderSession();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { pendingActionsCount, handleSync, isSyncing } = useOrdersSync();
  
  // URL management
  useEffect(() => {
    // Extract order ID from URL if present
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 2 && pathParts[1] === 'orders') {
      setSelectedOrderId(pathParts[2]);
    }
  }, []);
  
  // Only update URL when selectedOrderId changes and it's different from the URL parameter
  useEffect(() => {
    if (selectedOrderId) {
      navigate(`/orders/${selectedOrderId}`, { replace: true });
    }
  }, [selectedOrderId, navigate]);

  if (!session) {
    return (
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12 relative z-10 flex flex-col items-center justify-center">
          <AuthCheck />
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
        <OrdersHeader 
          pendingActionsCount={pendingActionsCount}
          handleSync={handleSync}
          isSyncing={isSyncing}
        />
        
        <OrdersContent 
          userId={session.user?.id}
          selectedOrderId={selectedOrderId}
          onOrderSelect={setSelectedOrderId}
          isSessionLoading={sessionLoading}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Orders;

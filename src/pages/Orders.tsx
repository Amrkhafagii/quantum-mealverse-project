
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import { OrderTracker } from '@/components/orders/OrderTracker';
import { AuthCheck } from '@/components/orders/AuthCheck';
import { EmptyOrdersState } from '@/components/orders/EmptyOrdersState';
import { ActiveOrdersList } from '@/components/orders/ActiveOrdersList';
import { PastOrdersList } from '@/components/orders/PastOrdersList';
import { NoActiveOrdersDisplay } from '@/components/orders/NoActiveOrdersDisplay';
import { SelectOrderPrompt } from '@/components/orders/SelectOrderPrompt';

const Orders = () => {
  const { id: orderIdParam } = useParams();
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orderIdParam || null);
  
  // Only update URL when selectedOrderId changes and it's different from the URL parameter
  useEffect(() => {
    if (selectedOrderId && selectedOrderId !== orderIdParam) {
      navigate(`/orders/${selectedOrderId}`, { replace: true });
    }
  }, [selectedOrderId, orderIdParam, navigate]);
  
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['active-orders', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      try {
        // Fix the "not.in" syntax issue by using "not" with individual "eq" filters
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', session.user.id)
          .not('status', 'eq', 'delivered')
          .not('status', 'eq', 'cancelled')
          .not('status', 'eq', 'rejected')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching active orders:', error);
          throw error;
        }
        
        console.log('Active orders fetched:', data);
        return data || [];
      } catch (error) {
        console.error('Error in active orders query:', error);
        return [];
      }
    },
    enabled: !!session?.user?.id,
    refetchInterval: 10000, // Refresh every 10 seconds to catch status updates
    staleTime: 5000, // Prevent unnecessary refetches
  });
  
  const { data: pastOrders } = useQuery({
    queryKey: ['past-orders', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .in('status', ['delivered', 'cancelled', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id,
    staleTime: 30000, // Past orders don't change as frequently
  });

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
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12 relative z-10 flex flex-col items-center justify-center">
          <div className="text-2xl text-quantum-cyan">Loading your orders...</div>
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
        <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Track Your Orders</h1>
        
        {(!orders || orders.length === 0) && (!pastOrders || pastOrders.length === 0) ? (
          <EmptyOrdersState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <ActiveOrdersList 
                orders={orders || []} 
                selectedOrderId={selectedOrderId}
                onOrderSelect={setSelectedOrderId}
              />
              <PastOrdersList 
                orders={pastOrders || []} 
                onOrderSelect={setSelectedOrderId} 
              />
            </div>
            
            <div className="lg:col-span-2">
              {selectedOrderId ? (
                <OrderTracker orderId={selectedOrderId} />
              ) : (
                orders && orders.length > 0 ? (
                  <SelectOrderPrompt />
                ) : (
                  <NoActiveOrdersDisplay />
                )
              )}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Orders;

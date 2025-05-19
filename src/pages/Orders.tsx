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
import { UserSettings } from '@/components/profile/UserSettings';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { syncPendingActions } from '@/services/sync/syncService';
import { getActiveOrders, getPendingActions } from '@/utils/offlineStorage';
import { ConnectionStateIndicator } from '@/components/ui/ConnectionStateIndicator';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Orders = () => {
  const { id: orderIdParam } = useParams();
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orderIdParam || null);
  const { isOnline } = useConnectionStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActionsCount, setPendingActionsCount] = useState(0);
  
  // Update pending actions count
  useEffect(() => {
    const checkPendingActions = async () => {
      try {
        const pendingActions = await getPendingActions();
        setPendingActionsCount(pendingActions.length);
      } catch (error) {
        console.error("Error checking pending actions:", error);
        setPendingActionsCount(0);
      }
    };
    
    checkPendingActions();
    const intervalId = setInterval(() => {
      checkPendingActions();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Sync pending actions when coming back online
  useEffect(() => {
    if (isOnline) {
      const performSync = async () => {
        await syncPendingActions();
        // Update pending actions count after sync
        try {
          const pendingActions = await getPendingActions();
          setPendingActionsCount(pendingActions.length);
        } catch (error) {
          console.error("Error getting pending actions:", error);
          setPendingActionsCount(0);
        }
      };
      
      performSync();
    }
  }, [isOnline]);
  
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
  
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['active-orders', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      if (!isOnline) {
        // When offline, use cached orders
        try {
          const cachedOrders = await getActiveOrders();
          return cachedOrders.filter(order => 
            !['delivered', 'cancelled', 'rejected'].includes(order.status)
          );
        } catch (error) {
          console.error("Error filtering cached orders:", error);
          return [];
        }
      }
      
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
        
        // Store active orders for offline access
        if (data && data.length > 0) {
          data.forEach(order => {
            import('@/utils/offlineStorage').then(({ storeActiveOrder }) => {
              storeActiveOrder(order);
            });
          });
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in active orders query:', error);
        
        // If online fetch failed, try to use cached data
        try {
          const cachedOrders = await getActiveOrders();
          return cachedOrders.filter(order => 
            !['delivered', 'cancelled', 'rejected'].includes(order.status)
          );
        } catch (cacheError) {
          console.error("Error retrieving from cache:", cacheError);
          return [];
        }
      }
    },
    enabled: !!session?.user?.id,
    refetchInterval: isOnline ? 10000 : false, // Only refresh every 10 seconds when online
    staleTime: 5000, // Prevent unnecessary refetches
  });
  
  const { data: pastOrders } = useQuery({
    queryKey: ['past-orders', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      if (!isOnline) {
        // When offline, use cached orders for past orders
        try {
          const cachedOrders = await getActiveOrders();
          return cachedOrders.filter(order => 
            ['delivered', 'cancelled', 'rejected'].includes(order.status)
          ).slice(0, 5);
        } catch (error) {
          console.error("Error filtering past orders from cache:", error);
          return [];
        }
      }
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', session.user.id)
          .in('status', ['delivered', 'cancelled', 'rejected'])
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        // Store past orders for offline access too
        if (data && data.length > 0) {
          data.forEach(order => {
            import('@/utils/offlineStorage').then(({ storeActiveOrder }) => {
              storeActiveOrder(order);
            });
          });
        }
        
        return data || [];
      } catch (error) {
        console.error('Error fetching past orders:', error);
        
        // If online fetch failed, use cached data
        try {
          const cachedOrders = await getActiveOrders();
          return cachedOrders.filter(order => 
            ['delivered', 'cancelled', 'rejected'].includes(order.status)
          ).slice(0, 5);
        } catch (cacheError) {
          console.error("Error retrieving past orders from cache:", cacheError);
          return [];
        }
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 30000, // Past orders don't change as frequently
  });

  const handleSync = async () => {
    setIsSyncing(true);
    await syncPendingActions();
    if (isOnline) {
      await refetch();
    }
    // Update pending actions count after sync
    try {
      const pendingActions = await getPendingActions();
      setPendingActionsCount(pendingActions.length);
    } catch (error) {
      console.error("Error getting pending actions count:", error);
      setPendingActionsCount(0);
    }
    setTimeout(() => setIsSyncing(false), 1000);
  };

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
  
  if (isLoading && isOnline) {
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
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-bold text-quantum-cyan neon-text">Track Your Orders</h1>
            <ConnectionStateIndicator showText={true} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex items-center gap-1 text-quantum-cyan hover:bg-quantum-cyan/20"
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync</span>
              {pendingActionsCount > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {pendingActionsCount}
                </Badge>
              )}
            </Button>
            <UserSettings />
          </div>
        </div>
        
        {!isOnline && (
          <div className="bg-amber-900/20 border border-amber-500/30 text-amber-200 px-4 py-3 rounded-md mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
              <p>You are currently offline. Limited functionality available.</p>
            </div>
            {pendingActionsCount > 0 && (
              <Badge variant="outline" className="border-amber-500/50 text-amber-200">
                {pendingActionsCount} pending {pendingActionsCount === 1 ? 'action' : 'actions'}
              </Badge>
            )}
          </div>
        )}
        
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

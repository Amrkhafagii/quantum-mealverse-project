
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types/restaurant';
import { LiveOrdersList } from './LiveOrdersList';
import { OrderPreparation } from './OrderPreparation';
import { ReadyForPickupList } from './ReadyForPickupList';
import { OrderHistoryList } from './OrderHistoryList';

export const OrderDashboard: React.FC = () => {
  const { restaurant } = useRestaurantAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('new');
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to order status changes
  useEffect(() => {
    if (!restaurant?.id) return;
    
    setIsLoading(true);
    
    // Count new orders initially
    supabase
      .from('restaurant_assignments')
      .select('*', { count: 'exact' })
      .eq('restaurant_id', restaurant.id)
      .eq('status', 'pending')
      .then(({ count, error }) => {
        if (error) {
          console.error('Error fetching new order count:', error);
        } else {
          setNewOrderCount(count || 0);
        }
        setIsLoading(false);
      });
    
    // Set up real-time subscription for restaurant assignments
    const channel = supabase
      .channel('restaurant_orders_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'restaurant_assignments',
          filter: `restaurant_id=eq.${restaurant.id}`
        }, 
        (payload) => {
          console.log('New order assignment:', payload);
          if (payload.new && payload.new.status === 'pending') {
            setNewOrderCount(prev => prev + 1);
            
            toast({
              title: "New Order Received!",
              description: "You have a new order waiting for acceptance.",
              duration: 5000,
            });
          }
        })
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'restaurant_assignments',
          filter: `restaurant_id=eq.${restaurant.id}`
        }, 
        (payload) => {
          console.log('Order assignment updated:', payload);
          
          // If status changes from pending to something else, decrement counter
          if (payload.old && payload.old.status === 'pending' && 
              payload.new && payload.new.status !== 'pending') {
            setNewOrderCount(prev => Math.max(0, prev - 1));
          }
        })
      .subscribe();
      
    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant?.id, toast]);
  
  if (!restaurant) {
    return (
      <Card className="w-full">
        <CardContent className="py-10">
          <div className="text-center">
            Please log in as a restaurant to view orders.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-quantum-cyan">Orders Dashboard</h1>
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-quantum-cyan" />
          ) : newOrderCount > 0 ? (
            <Badge variant="default" className="bg-quantum-cyan animate-pulse">
              <Bell className="h-4 w-4 mr-1" /> {newOrderCount} new
            </Badge>
          ) : null}
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="new" className="relative">
            New Orders
            {newOrderCount > 0 && (
              <span className="absolute top-0 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-quantum-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-quantum-cyan"></span>
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="preparing">Preparing</TabsTrigger>
          <TabsTrigger value="ready">Ready for Pickup</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new" className="space-y-4">
          <LiveOrdersList restaurantId={restaurant.id} onOrderAccepted={() => setNewOrderCount(prev => Math.max(0, prev - 1))} />
        </TabsContent>
        
        <TabsContent value="preparing" className="space-y-4">
          <OrderPreparation restaurantId={restaurant.id} />
        </TabsContent>
        
        <TabsContent value="ready" className="space-y-4">
          <ReadyForPickupList restaurantId={restaurant.id} />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <OrderHistoryList restaurantId={restaurant.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

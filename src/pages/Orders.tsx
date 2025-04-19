
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, Calendar, CreditCard, MapPin, Phone } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { OrderTracker } from '@/components/orders/OrderTracker';

const Orders = () => {
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
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
      
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', session.user.id)
        .not('status', 'eq', 'delivered')
        .not('status', 'eq', 'cancelled')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id,
  });
  
  const { data: pastOrders } = useQuery({
    queryKey: ['past-orders', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .or('status.eq.delivered,status.eq.cancelled')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id,
  });
  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      'pending': { color: 'bg-yellow-500 hover:bg-yellow-600', label: 'Pending' },
      'processing': { color: 'bg-blue-500 hover:bg-blue-600', label: 'Processing' },
      'on_the_way': { color: 'bg-purple-500 hover:bg-purple-600', label: 'On The Way' },
      'delivered': { color: 'bg-green-500 hover:bg-green-600', label: 'Delivered' },
      'cancelled': { color: 'bg-red-500 hover:bg-red-600', label: 'Cancelled' }
    };
    
    const statusInfo = statusMap[status] || { color: 'bg-gray-500', label: status };
    
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };
  
  if (!session) {
    return (
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        
        <main className="container mx-auto px-4 pt-24 pb-12 relative z-10 flex flex-col items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                You need to be logged in to view your orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                Login to Your Account
              </Button>
            </CardContent>
          </Card>
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
          <div className="text-center py-12">
            <h2 className="text-2xl mb-4">You haven't placed any orders yet</h2>
            <Button onClick={() => navigate('/customer')}>Browse Meals</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              {orders && orders.length > 0 ? (
                <>
                  <h2 className="text-2xl font-bold text-quantum-cyan">Active Orders</h2>
                  {orders.map((order) => (
                    <Card 
                      key={order.id}
                      className={`cursor-pointer transition-all hover:border-quantum-cyan ${
                        selectedOrderId === order.id ? 'border-quantum-cyan border-2' : ''
                      }`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">
                            Order #{order.id.substring(0, 8)}
                          </CardTitle>
                          {getStatusBadge(order.status)}
                        </div>
                        <CardDescription>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-quantum-cyan" />
                            <span>{order.order_items.length} items</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-quantum-cyan" />
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-end mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/orders/${order.id}`);
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Active Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">You don't have any active orders at the moment.</p>
                    <Button onClick={() => navigate('/customer')}>Order Meals</Button>
                  </CardContent>
                </Card>
              )}
              
              {pastOrders && pastOrders.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold text-quantum-cyan mt-8">Past Orders</h2>
                  {pastOrders.map((order) => (
                    <Card key={order.id} className="hover:border-quantum-cyan/50 transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">
                            Order #{order.id.substring(0, 8)}
                          </CardTitle>
                          {getStatusBadge(order.status)}
                        </div>
                        <CardDescription>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span>${order.total.toFixed(2)}</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="flex justify-center mt-4">
                    <Button variant="ghost" onClick={() => navigate('/profile?tab=orders')}>
                      View All Orders
                    </Button>
                  </div>
                </>
              )}
            </div>
            
            <div className="lg:col-span-2">
              {selectedOrderId ? (
                <OrderTracker orderId={selectedOrderId} />
              ) : (
                orders && orders.length > 0 ? (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-16">
                      <Package className="h-16 w-16 mx-auto mb-4 text-quantum-cyan" />
                      <h3 className="text-xl font-bold mb-2">Select an order to track</h3>
                      <p className="text-gray-400">
                        Click on one of your active orders to view its current status and tracking information.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-16">
                      <Package className="h-16 w-16 mx-auto mb-4 text-quantum-cyan" />
                      <h3 className="text-xl font-bold mb-2">No Active Orders to Track</h3>
                      <p className="text-gray-400 mb-4">
                        When you place an order, you'll be able to track it here in real-time.
                      </p>
                      <Button onClick={() => navigate('/customer')}>
                        Browse Meals
                      </Button>
                    </CardContent>
                  </Card>
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


import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useOrderHistory } from '@/hooks/useOrderHistory';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, MapPin, Clock, ChefHat } from 'lucide-react';
import { format } from 'date-fns';
import { NotificationCenter } from '@/components/customer/NotificationCenter';

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { orders, loading, error, refresh } = useOrderHistory(user?.id);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
      case 'preparing':
        return 'bg-blue-500';
      case 'ready':
      case 'picked_up':
      case 'on_the_way':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-quantum-black to-quantum-darkBlue text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white flex flex-col">
      <div className="relative w-full flex-grow">
        <ParticleBackground />
        <Navbar />
        
        <main className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-quantum-cyan">Your Orders</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Orders List */}
              <div className="lg:col-span-2 space-y-4">
                {error && (
                  <Card className="holographic-card border-red-500/30">
                    <CardContent className="p-4">
                      <p className="text-red-400">Error loading orders: {error.message}</p>
                      <Button onClick={refresh} className="mt-2" variant="outline">
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {orders.length === 0 && !loading && (
                  <Card className="holographic-card">
                    <CardContent className="p-8 text-center">
                      <ChefHat className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                      <p className="text-gray-400 mb-4">Start exploring our restaurants and place your first order!</p>
                      <Button onClick={() => navigate('/')} className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black">
                        Browse Restaurants
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {orders.map((order) => (
                  <Card 
                    key={order.id} 
                    className={`holographic-card cursor-pointer transition-all ${
                      selectedOrder === order.id ? 'border-quantum-cyan' : ''
                    }`}
                    onClick={() => setSelectedOrder(order.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Order #{order.formatted_order_id || order.id.substring(0, 8)}
                          </CardTitle>
                          <p className="text-sm text-gray-400 mt-1">
                            {format(new Date(order.created_at!), 'MMM dd, yyyy at h:mm a')}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {formatStatus(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-quantum-cyan" />
                          <span className="text-sm">{order.delivery_address}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-quantum-cyan" />
                          <span className="text-sm">
                            Total: EGP {order.total}
                          </span>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/order-confirmation/${order.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          
                          {['picked_up', 'on_the_way'].includes(order.status) && (
                            <Button 
                              size="sm"
                              className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/order-confirmation/${order.id}`);
                              }}
                            >
                              <MapPin className="h-4 w-4 mr-1" />
                              Track Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Notification Center */}
              <div className="lg:col-span-1">
                <NotificationCenter />
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Orders;

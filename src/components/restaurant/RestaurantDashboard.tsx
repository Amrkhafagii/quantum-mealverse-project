
import React, { useState, useEffect } from 'react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ClipboardList, PieChart, Clock, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { RestaurantOrder, OrderStatus } from '@/types/restaurant';
import { Skeleton } from '@/components/ui/skeleton';

export const RestaurantDashboard = () => {
  const { restaurant } = useRestaurantAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [recentOrders, setRecentOrders] = useState<RestaurantOrder[]>([]);
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurant) {
      loadDashboardData();
    }
  }, [restaurant]);

  const loadDashboardData = async () => {
    if (!restaurant) return;
    
    try {
      setLoading(true);
      
      // Fetch recent orders
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (orderError) throw orderError;
      
      // Transform orders data
      const transformedOrders = orders.map(order => ({
        ...order,
        order_items: order.order_items || []
      })) as RestaurantOrder[];
      
      setRecentOrders(transformedOrders);
      
      // Get order stats for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayOrdersData, error: todayError } = await supabase
        .from('orders')
        .select('id, total, status')
        .eq('restaurant_id', restaurant.id)
        .gte('created_at', today.toISOString());
        
      if (todayError) throw todayError;
      
      // Calculate stats
      const pendingOrders = todayOrdersData ? todayOrdersData.filter(order => 
        [OrderStatus.PENDING, OrderStatus.AWAITING_RESTAURANT, OrderStatus.RESTAURANT_ASSIGNED, OrderStatus.RESTAURANT_ACCEPTED].includes(order.status as OrderStatus)
      ).length : 0;
      
      const completedOrders = todayOrdersData ? todayOrdersData.filter(order => 
        order.status === OrderStatus.DELIVERED
      ).length : 0;
      
      const totalRevenue = todayOrdersData ? todayOrdersData.reduce((sum, order) => sum + (order.total || 0), 0) : 0;
      
      setStats({
        todayOrders: todayOrdersData ? todayOrdersData.length : 0,
        pendingOrders,
        completedOrders,
        totalRevenue
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.RESTAURANT_ACCEPTED:
        return "bg-green-500/20 text-green-500";
      case OrderStatus.PREPARING:
        return "bg-blue-500/20 text-blue-500";
      case OrderStatus.READY_FOR_PICKUP:
        return "bg-purple-500/20 text-purple-500";
      case OrderStatus.ON_THE_WAY:
        return "bg-yellow-500/20 text-yellow-500";
      case OrderStatus.DELIVERED:
        return "bg-green-700/20 text-green-700";
      case OrderStatus.CANCELLED:
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  if (!restaurant) {
    return <div>No restaurant found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-quantum-cyan">Dashboard</h1>
        <div className="text-sm text-gray-400">{new Date().toLocaleDateString()}</div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Today's Orders Card */}
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Today's Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-20 bg-quantum-cyan/10" />
                ) : (
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold">{stats.todayOrders}</div>
                    <div className="text-sm text-gray-400">orders</div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Pending Orders Card */}
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-20 bg-quantum-cyan/10" />
                ) : (
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold">{stats.pendingOrders}</div>
                    <div className="text-sm text-gray-400">orders</div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Completed Orders Card */}
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Completed Today</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-20 bg-quantum-cyan/10" />
                ) : (
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold">{stats.completedOrders}</div>
                    <div className="text-sm text-gray-400">orders</div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Today's Revenue Card */}
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Today's Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-32 bg-quantum-cyan/10" />
                ) : (
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Orders */}
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>The latest orders for your restaurant</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => navigate('/restaurant/orders')}>
                View All <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-quantum-cyan/10" />
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-quantum-darkBlue/50 rounded-md border border-quantum-cyan/10">
                      <div className="flex flex-col">
                        <div className="font-medium">{order.formatted_order_id || `Order #${order.id.slice(0, 6)}`}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(order.created_at).toLocaleString(undefined, { 
                            hour: 'numeric', 
                            minute: 'numeric',
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold">${order.total.toFixed(2)}</div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getOrderStatusColor(order.status as OrderStatus)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No orders found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <div className="py-8 text-center">
            <Button onClick={() => navigate('/restaurant/orders')} className="bg-quantum-cyan hover:bg-quantum-cyan/80">
              Go to Orders Management
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View detailed performance analytics for your restaurant</CardDescription>
            </CardHeader>
            <CardContent className="py-10 text-center">
              <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">Analytics Dashboard Coming Soon</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                We're building a comprehensive analytics dashboard to help you gain insights into your restaurant's performance.
              </p>
            </CardContent>
            <CardFooter className="border-t border-quantum-cyan/10 pt-4 flex justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Coming soon</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Q2 2025</span>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Clock, ArrowDownUp, Loader2, ClipboardList } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RestaurantOrder, OrderStatus } from '@/types/restaurant';

export const OrderManagement = () => {
  const { restaurant } = useRestaurantAuth();
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (restaurant) {
      loadOrders();
    }
  }, [restaurant, activeTab]);

  const loadOrders = async () => {
    if (!restaurant) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('restaurant_id', restaurant.id);
        
      // Filter based on active tab
      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }
      
      // Sort by newest first
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform orders data
      const transformedOrders = data.map(order => ({
        ...order,
        order_items: order.order_items || []
      })) as RestaurantOrder[];
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
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

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.formatted_order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-quantum-cyan">Orders</h1>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search orders..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Sort
          </Button>
          <Button variant="outline" size="sm" onClick={() => loadOrders()}>
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value={OrderStatus.RESTAURANT_ACCEPTED}>New</TabsTrigger>
          <TabsTrigger value={OrderStatus.PREPARING}>Preparing</TabsTrigger>
          <TabsTrigger value={OrderStatus.READY_FOR_PICKUP}>Ready</TabsTrigger>
          <TabsTrigger value={OrderStatus.ON_THE_WAY}>On the Way</TabsTrigger>
          <TabsTrigger value={OrderStatus.DELIVERED}>Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' ? 'All Orders' : activeTab.replace(/_/g, ' ')}
              </CardTitle>
              <CardDescription>
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="p-4 rounded-md border border-quantum-cyan/10 bg-quantum-darkBlue/50 hover:bg-quantum-darkBlue/70 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold">
                            {order.formatted_order_id || `Order #${order.id.slice(0, 6)}`}
                          </h3>
                          <div className="text-sm text-gray-400">
                            {new Date(order.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded text-sm font-medium ${getOrderStatusColor(order.status as OrderStatus)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </div>
                      </div>
                      
                      <div className="flex justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium">{order.customer_name}</p>
                          <p className="text-xs text-gray-400">{order.customer_phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">
                            {order.delivery_method === 'delivery' ? 'Delivery' : 'Pickup'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-400">{order.delivery_address}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs"
                          >
                            View Details
                          </Button>
                          
                          {(order.status === OrderStatus.RESTAURANT_ACCEPTED || order.status === OrderStatus.PREPARING) && (
                            <Button 
                              size="sm" 
                              className="text-xs bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
                            >
                              Next Status
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No orders found</p>
                  <p className="text-sm mt-2">
                    {searchTerm ? "Try adjusting your search" : "You don't have any orders in this category yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderManagement;

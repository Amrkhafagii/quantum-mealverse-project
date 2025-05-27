
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Loader2, ChefHat, TrendingUp, Clock, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { restaurantAnalyticsService, type AnalyticsSummary } from '@/services/restaurantAnalyticsService';
import { useToast } from '@/components/ui/use-toast';

// Lazy load components for better performance
const OrderManagement = lazy(() => import('./orders/OrderManagement'));
const RestaurantAnalytics = lazy(() => import('./analytics/RestaurantAnalytics'));

export const RestaurantDashboard = () => {
  const { restaurant, isLoading } = useRestaurantAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (restaurant?.id) {
      loadAnalyticsSummary();
    }
  }, [restaurant?.id]);

  const loadAnalyticsSummary = async () => {
    if (!restaurant?.id) return;

    try {
      setLoadingAnalytics(true);
      const data = await restaurantAnalyticsService.getAnalyticsSummary(restaurant.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics summary:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard analytics",
        variant: "destructive",
      });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  console.log('RestaurantDashboard - Restaurant data:', restaurant);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        <span className="ml-2 text-quantum-cyan">Loading dashboard...</span>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <ChefHat className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Restaurant information not available</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Restaurant Info Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Restaurant</p>
                <p className="text-lg font-bold text-blue-600">{restaurant.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-lg font-bold text-green-600 capitalize">
                  {restaurant.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-lg font-bold text-orange-600">
                  {loadingAnalytics ? '...' : analytics?.todayOrders || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Menu Items</p>
                <p className="text-lg font-bold text-purple-600">
                  {loadingAnalytics ? '...' : analytics?.totalMenuItems || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Order Management Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Management</h2>
        <Suspense fallback={
          <Card className="p-6">
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
              <span className="ml-2 text-quantum-cyan">Loading orders...</span>
            </div>
          </Card>
        }>
          <OrderManagement />
        </Suspense>
      </section>
      
      {/* Analytics Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Analytics Overview</h2>
        <Suspense fallback={
          <Card className="p-6">
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
              <span className="ml-2 text-quantum-cyan">Loading analytics...</span>
            </div>
          </Card>
        }>
          <RestaurantAnalytics />
        </Suspense>
      </section>
    </div>
  );
};

export default RestaurantDashboard;

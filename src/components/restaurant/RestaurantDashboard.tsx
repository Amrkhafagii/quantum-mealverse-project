import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Loader2, ChefHat, TrendingUp, Clock, Package, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { restaurantAnalyticsService, type AnalyticsSummary } from '@/services/restaurantAnalyticsService';
import { useToast } from '@/components/ui/use-toast';
import { PreparationAnalyticsDashboard } from './analytics/PreparationAnalyticsDashboard';

// Lazy load components for better performance
const OrderManagement = lazy(() => import('./orders/OrderManagement'));
const RestaurantAnalytics = lazy(() => import('./analytics/RestaurantAnalytics'));

export const RestaurantDashboard = () => {
  const { restaurant, isLoading } = useRestaurantAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

        {!loadingAnalytics && analytics && (
          <>
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                    <p className="text-lg font-bold text-purple-600">{analytics.todayOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-orange-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Weekly Revenue</p>
                    <p className="text-lg font-bold text-orange-600">${analytics.weeklyRevenue.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChefHat },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'preparation', label: 'Preparation Analytics', icon: Clock },
            { id: 'analytics', label: 'Business Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            {!loadingAnalytics && analytics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${analytics.averageOrderValue.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.orderCompletionRate.toFixed(1)}%</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.customerSatisfactionScore.toFixed(1)}/5</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your restaurant operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setActiveTab('orders')}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Package className="h-4 w-4" />
                    <span>Manage Orders</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('preparation')}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Clock className="h-4 w-4" />
                    <span>View Preparation Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'orders' && (
          <Suspense fallback={
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
            </div>
          }>
            <OrderManagement />
          </Suspense>
        )}

        {activeTab === 'preparation' && (
          <Suspense fallback={
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
            </div>
          }>
            <PreparationAnalyticsDashboard />
          </Suspense>
        )}

        {activeTab === 'analytics' && (
          <Suspense fallback={
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
            </div>
          }>
            <RestaurantAnalytics />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;

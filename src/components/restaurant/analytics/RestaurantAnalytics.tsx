
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, DollarSign, Clock, Star } from 'lucide-react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { restaurantAnalyticsService, type AnalyticsSummary } from '@/services/restaurantAnalyticsService';
import { useToast } from '@/components/ui/use-toast';

export const RestaurantAnalytics = () => {
  const { restaurant } = useRestaurantAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurant?.id) {
      loadAnalytics();
    }
  }, [restaurant?.id]);

  const loadAnalytics = async () => {
    if (!restaurant?.id) return;

    try {
      setLoading(true);
      const data = await restaurantAnalyticsService.getAnalyticsSummary(restaurant.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        <span className="ml-2 text-quantum-cyan">Loading analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Analytics data will appear once you start receiving orders.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.todayOrders}</div>
          <p className="text-xs text-muted-foreground">
            Orders received today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${analytics.weeklyRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Revenue from last 7 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${analytics.averageOrderValue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Average value per order
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalMenuItems}</div>
          <p className="text-xs text-muted-foreground">
            Total menu items
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Order Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.orderCompletionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Percentage of orders completed successfully
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.customerSatisfactionScore.toFixed(1)}/5</div>
          <p className="text-xs text-muted-foreground">
            Average customer rating
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantAnalytics;

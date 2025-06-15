
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Star, Clock, Target } from 'lucide-react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { performanceService } from '@/services/performance/performanceService';

export const PerformanceDashboard = () => {
  const { restaurant } = useRestaurantAuth();
  const [loading, setLoading] = useState(true);
  const [todayMetrics, setTodayMetrics] = useState<any>(null);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [peakHours, setPeakHours] = useState<Array<{ hour: string; orders: number }>>([]);

  useEffect(() => {
    const loadPerformanceData = async () => {
      if (!restaurant?.id) return;
      
      try {
        setLoading(true);
        const [today, weekly, peaks] = await Promise.all([
          performanceService.getTodayMetrics(restaurant.id),
          performanceService.getWeeklySummary(restaurant.id),
          performanceService.getPeakHoursAnalysis(restaurant.id)
        ]);

        setTodayMetrics(today);
        setWeeklySummary(weekly);
        
        // Handle peak hours data more carefully
        console.log('Raw peak hours data:', peaks);
        
        if (peaks && typeof peaks === 'object') {
          let processedPeakHours = [];
          
          if (Array.isArray(peaks)) {
            // If it's already an array, process each item
            processedPeakHours = peaks.map(item => ({
              hour: typeof item.hour === 'object' ? String(item.hour) : String(item.hour || 'Unknown'),
              orders: typeof item.orders === 'object' ? Number((item.orders as any)?.count || (item.orders as any)?.value || 0) : Number(item.orders || 0)
            }));
          } else if (peaks.peak_hours && Array.isArray(peaks.peak_hours)) {
            // If peak_hours is nested in the response
            processedPeakHours = peaks.peak_hours.map((item: any) => ({
              hour: typeof item.hour === 'object' ? String(item.hour) : String(item.hour || 'Unknown'),
              orders: typeof item.orders === 'object' ? Number((item.orders as any)?.count || (item.orders as any)?.value || 0) : Number(item.orders || 0)
            }));
          } else {
            // Convert object to array format
            processedPeakHours = Object.entries(peaks).map(([hour, orderData]) => {
              let orderCount = 0;
              
              if (typeof orderData === 'object' && orderData !== null) {
                // Safe property access with type assertion
                const dataObj = orderData as any;
                orderCount = Number(dataObj.orders || dataObj.count || dataObj.value || 0);
              } else {
                orderCount = Number(orderData || 0);
              }
              
              return {
                hour: String(hour),
                orders: orderCount
              };
            });
          }
          
          console.log('Processed peak hours:', processedPeakHours);
          setPeakHours(processedPeakHours);
        } else {
          console.log('No valid peak hours data found');
          setPeakHours([]);
        }
      } catch (error) {
        console.error('Error loading performance data:', error);
        setPeakHours([]);
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceData();
  }, [restaurant?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Today's Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-3xl font-bold">{todayMetrics?.total_orders || 0}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(todayMetrics?.total_revenue || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-3xl font-bold">{todayMetrics?.average_rating?.toFixed(1) || '0.0'}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Prep Time</p>
                <p className="text-3xl font-bold">{todayMetrics?.average_preparation_time || 0}m</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{weeklySummary?.total_orders || 0}</div>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Growth rate data coming soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Weekly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(weeklySummary?.total_revenue || 0)}</div>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Growth rate data coming soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{weeklySummary?.customer_satisfaction || 0}%</div>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Above average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Hours</CardTitle>
        </CardHeader>
        <CardContent>
          {peakHours.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No peak hours data available</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {peakHours
                .sort((a, b) => {
                  const hourA = typeof a.hour === 'string' ? parseInt(a.hour.split(':')[0]) : parseInt(String(a.hour)) || 0;
                  const hourB = typeof b.hour === 'string' ? parseInt(b.hour.split(':')[0]) : parseInt(String(b.hour)) || 0;
                  return hourA - hourB;
                })
                .map((item, index) => {
                  // Ensure we're only rendering primitive values
                  const hourDisplay = String(item.hour || 'N/A');
                  const ordersDisplay = Number(item.orders || 0);
                  
                  return (
                    <div key={`${hourDisplay}-${index}`} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">{hourDisplay}</p>
                      <p className="text-lg font-bold text-blue-600">{ordersDisplay}</p>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

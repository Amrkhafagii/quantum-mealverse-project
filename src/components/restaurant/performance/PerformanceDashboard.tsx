import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Star, Clock, Target } from 'lucide-react';
import { performanceService } from '@/services/performance/performanceService';
import { RestaurantPerformanceMetrics } from '@/types/notifications';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';

export const PerformanceDashboard: React.FC = () => {
  const { restaurant } = useRestaurantAuth();
  const [todayMetrics, setTodayMetrics] = useState<RestaurantPerformanceMetrics | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [peakHours, setPeakHours] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurant?.id) return;

    const loadPerformanceData = async () => {
      try {
        const [today, weekly, peaks] = await Promise.all([
          performanceService.getTodayMetrics(restaurant.id),
          performanceService.getWeeklySummary(restaurant.id),
          performanceService.getPeakHoursAnalysis(restaurant.id)
        ]);

        setTodayMetrics(today);
        setWeeklySummary(weekly);
        setPeakHours(peaks);
      } catch (error) {
        console.error('Error loading performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceData();
  }, [restaurant?.id]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: number;
    color: string;
  }> = ({ title, value, icon, trend, color }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {trend !== undefined && (
              <div className="flex items-center mt-1">
                {trend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('-600', '-100')}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Today's Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Today's Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Orders Today"
            value={todayMetrics?.total_orders || 0}
            icon={<Target className="h-6 w-6" />}
            color="text-blue-600"
          />
          <MetricCard
            title="Revenue Today"
            value={formatCurrency(todayMetrics?.total_revenue || 0)}
            icon={<DollarSign className="h-6 w-6" />}
            color="text-green-600"
          />
          <MetricCard
            title="Average Rating"
            value={todayMetrics?.average_rating?.toFixed(1) || '0.0'}
            icon={<Star className="h-6 w-6" />}
            color="text-yellow-600"
          />
          <MetricCard
            title="Avg Prep Time"
            value={`${todayMetrics?.average_preparation_time || 0} min`}
            icon={<Clock className="h-6 w-6" />}
            color="text-purple-600"
          />
        </div>
      </div>

      {/* Weekly Summary */}
      <div>
        <h2 className="text-xl font-semibold mb-4">This Week's Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Orders"
            value={weeklySummary?.totalOrders || 0}
            icon={<Target className="h-6 w-6" />}
            color="text-blue-600"
          />
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(weeklySummary?.totalRevenue || 0)}
            icon={<DollarSign className="h-6 w-6" />}
            color="text-green-600"
          />
          <MetricCard
            title="Average Rating"
            value={weeklySummary?.averageRating?.toFixed(1) || '0.0'}
            icon={<Star className="h-6 w-6" />}
            color="text-yellow-600"
          />
          <MetricCard
            title="Completion Rate"
            value={`${weeklySummary?.completionRate?.toFixed(1) || 0}%`}
            icon={<TrendingUp className="h-6 w-6" />}
            color="text-purple-600"
          />
        </div>
      </div>

      {/* Peak Hours Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Hours Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(peakHours).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No order data available for peak hours analysis</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(peakHours)
                .sort(([a], [b]) => parseInt(a.split(':')[0]) - parseInt(b.split(':')[0]))
                .map(([hour, count]) => (
                  <div key={hour} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">{hour}</p>
                    <p className="text-lg font-bold text-blue-600">{count}</p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

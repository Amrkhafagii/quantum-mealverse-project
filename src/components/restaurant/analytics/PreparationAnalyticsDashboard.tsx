
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Activity,
  Timer
} from 'lucide-react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { PreparationAnalyticsService, type PreparationAnalytics, type PreparationTrends } from '@/services/preparation/preparationAnalyticsService';
import { toast } from '@/components/ui/use-toast';

export const PreparationAnalyticsDashboard: React.FC = () => {
  const { restaurant } = useRestaurantAuth();
  const [analytics, setAnalytics] = useState<PreparationAnalytics | null>(null);
  const [trends, setTrends] = useState<PreparationTrends | null>(null);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurant?.id) {
      loadAnalytics();
      loadRealTimeData();
      
      // Refresh real-time data every 30 seconds
      const interval = setInterval(loadRealTimeData, 30000);
      return () => clearInterval(interval);
    }
  }, [restaurant?.id, timeRange]);

  const loadAnalytics = async () => {
    if (!restaurant?.id) return;

    try {
      setLoading(true);
      const [analyticsData, trendsData] = await Promise.all([
        PreparationAnalyticsService.getPreparationAnalytics(restaurant.id, timeRange),
        PreparationAnalyticsService.getPreparationTrends(restaurant.id)
      ]);
      
      setAnalytics(analyticsData);
      setTrends(trendsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load preparation analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    if (!restaurant?.id) return;

    try {
      const data = await PreparationAnalyticsService.getRealTimePerformance(restaurant.id);
      setRealTimeData(data);
    } catch (error) {
      console.error('Error loading real-time data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No preparation data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Preparation Analytics</h2>
        <div className="flex space-x-2">
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stages">Stage Analysis</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Prep Time</p>
                    <p className="text-2xl font-bold">{analytics.averagePreparationTime.toFixed(1)}m</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">On-time Rate</p>
                    <p className="text-2xl font-bold">{analytics.performanceMetrics.onTimeDeliveryRate.toFixed(1)}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Satisfaction</p>
                    <p className="text-2xl font-bold">{analytics.performanceMetrics.customerSatisfactionScore.toFixed(1)}/5</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stage Completion Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Stage Completion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.stageCompletionRates).map(([stage, rate]) => (
                  <div key={stage} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="capitalize">{stage.replace('_', ' ')}</span>
                      <span className="font-medium">{rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={rate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages" className="space-y-4">
          {/* Stage Efficiency */}
          <Card>
            <CardHeader>
              <CardTitle>Stage Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analytics.performanceMetrics.stageEfficiency).map(([stage, efficiency]) => (
                  <div key={stage} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium capitalize">{stage.replace('_', ' ')}</h4>
                      <Badge variant={efficiency >= 80 ? 'default' : efficiency >= 60 ? 'secondary' : 'destructive'}>
                        {efficiency.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={efficiency} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.peakHours.slice(0, 8).map((hour) => (
                  <div key={hour.hour} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{hour.hour}:00</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {hour.orderCount} orders
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">
                        {hour.averageTime.toFixed(1)} min avg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Identified Bottlenecks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.bottlenecks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">No significant bottlenecks detected!</p>
                  <p className="text-sm text-gray-400">All stages are performing within expected ranges.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.bottlenecks.map((bottleneck, index) => (
                    <div key={index} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium capitalize text-orange-900">
                          {bottleneck.stage.replace('_', ' ')}
                        </h4>
                        <Badge variant="destructive">
                          +{bottleneck.variance.toFixed(1)}% over target
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Average Time:</span>
                          <span className="ml-2 font-medium">{bottleneck.averageTime.toFixed(1)} min</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Expected Time:</span>
                          <span className="ml-2 font-medium">{bottleneck.expectedTime.toFixed(1)} min</span>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-white rounded border">
                        <p className="text-xs text-gray-600">
                          <strong>Recommendation:</strong> Review {bottleneck.stage.replace('_', ' ')} process 
                          for optimization opportunities. Consider additional training or equipment upgrades.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          {realTimeData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Orders</p>
                        <p className="text-2xl font-bold">{realTimeData.activeOrders}</p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Stages</p>
                        <p className="text-2xl font-bold">{realTimeData.activeStages}</p>
                      </div>
                      <Timer className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Stage Time</p>
                        <p className="text-2xl font-bold">
                          {Object.values(realTimeData.averageTimePerStage).length > 0
                            ? (Object.values(realTimeData.averageTimePerStage).reduce((a: any, b: any) => a + b, 0) / 
                               Object.values(realTimeData.averageTimePerStage).length).toFixed(1)
                            : '0'}m
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Current Stage Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(realTimeData.averageTimePerStage).map(([stage, time]) => (
                      <div key={stage} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="capitalize font-medium">{stage.replace('_', ' ')}</span>
                        <span className="text-sm">{(time as number).toFixed(1)} min elapsed</span>
                      </div>
                    ))}
                    {Object.keys(realTimeData.averageTimePerStage).length === 0 && (
                      <p className="text-center text-gray-500 py-4">No active stages currently</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

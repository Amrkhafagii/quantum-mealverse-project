
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Clock, CheckCircle, Users, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { usePreparationAnalytics } from '@/hooks/usePreparationAnalytics';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const PreparationAnalyticsDashboard: React.FC = () => {
  const { restaurant } = useRestaurantAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  
  const {
    analytics,
    trends,
    realTimeData,
    loading,
    error,
    refreshAnalytics,
    getBottleneckSeverity,
    getEfficiencyRating,
    getPerformanceInsights,
    isOnline
  } = usePreparationAnalytics(restaurant?.id, timeRange);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Error loading analytics: {error}</p>
          <Button onClick={refreshAnalytics} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <BarChart3 className="h-8 w-8 mx-auto mb-2" />
          <p>No preparation data available</p>
        </div>
      </Card>
    );
  }

  const insights = getPerformanceInsights();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Preparation Analytics</h2>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'quarter') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshAnalytics} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Prep Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.averagePreparationTime)} min</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performanceMetrics.onTimeDeliveryRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performanceMetrics.customerSatisfactionScore.toFixed(1)}/5</div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Data */}
      {realTimeData && (
        <Card>
          <CardHeader>
            <CardTitle>Real-time Kitchen Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{realTimeData.activeOrders}</div>
                <p className="text-sm text-gray-600">Active Orders</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{realTimeData.activeStages}</div>
                <p className="text-sm text-gray-600">Active Stages</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(realTimeData.averageTimePerStage || {}).length}
                </div>
                <p className="text-sm text-gray-600">Stages Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stages">Stage Analysis</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stage Completion Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Stage Completion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.stageCompletionRates).map(([stage, rate]) => (
                  <div key={stage} className="flex items-center justify-between">
                    <span className="capitalize">{stage.replace('_', ' ')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{rate.toFixed(1)}%</span>
                    </div>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.peakHours.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(hour) => `${hour}:00`}
                    formatter={(value, name) => [
                      name === 'orderCount' ? `${value} orders` : `${value} min`,
                      name === 'orderCount' ? 'Orders' : 'Avg Time'
                    ]}
                  />
                  <Bar dataKey="orderCount" fill="#8884d8" name="orderCount" />
                </BarChart>
              </ResponsiveContainer>
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
              <div className="space-y-4">
                {Object.entries(analytics.performanceMetrics.stageEfficiency).map(([stage, efficiency]) => (
                  <div key={stage} className="flex items-center justify-between">
                    <span className="capitalize">{stage.replace('_', ' ')}</span>
                    <Badge variant={getEfficiencyRating(efficiency) === 'excellent' ? 'default' : 
                                   getEfficiencyRating(efficiency) === 'good' ? 'secondary' : 'destructive'}>
                      {getEfficiencyRating(efficiency)} ({efficiency.toFixed(1)}%)
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-4">
          {/* Bottlenecks */}
          <Card>
            <CardHeader>
              <CardTitle>Identified Bottlenecks</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.bottlenecks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No significant bottlenecks detected</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.bottlenecks.map((bottleneck, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">
                          {bottleneck.stage.replace('_', ' ')}
                        </h4>
                        <Badge variant={
                          getBottleneckSeverity(bottleneck.variance) === 'high' ? 'destructive' :
                          getBottleneckSeverity(bottleneck.variance) === 'medium' ? 'secondary' : 'default'
                        }>
                          {getBottleneckSeverity(bottleneck.variance)} severity
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Expected:</span>
                          <p className="font-medium">{bottleneck.expectedTime} min</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Actual:</span>
                          <p className="font-medium">{bottleneck.averageTime.toFixed(1)} min</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Variance:</span>
                          <p className="font-medium text-red-600">+{bottleneck.variance.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Daily Completion Trend */}
          {trends && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Completion Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends.dailyCompletion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="completedOrders" 
                      stroke="#8884d8" 
                      name="Completed Orders"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="averageTime" 
                      stroke="#82ca9d" 
                      name="Avg Time (min)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Performance Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isOnline && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">You're offline. Data may not be up to date.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { PerformanceTrend } from '@/types/delivery-analytics';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface PerformanceChartProps {
  trends: PerformanceTrend[];
  loading: boolean;
  showDetailed?: boolean;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  trends, 
  loading, 
  showDetailed = false 
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [metric, setMetric] = useState<'earnings' | 'deliveries' | 'rating' | 'efficiency'>('earnings');

  if (loading) {
    return (
      <Card className="holographic-card">
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <Card className="holographic-card">
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            No performance data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = trends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    earnings: trend.earnings,
    deliveries: trend.deliveries,
    rating: trend.rating,
    efficiency: trend.efficiency
  }));

  const getMetricConfig = () => {
    switch (metric) {
      case 'earnings':
        return { 
          color: '#10b981', 
          label: 'Earnings ($)', 
          formatter: (value: number) => `$${value.toFixed(2)}` 
        };
      case 'deliveries':
        return { 
          color: '#3b82f6', 
          label: 'Deliveries', 
          formatter: (value: number) => value.toString() 
        };
      case 'rating':
        return { 
          color: '#f59e0b', 
          label: 'Rating', 
          formatter: (value: number) => value.toFixed(1) 
        };
      case 'efficiency':
        return { 
          color: '#8b5cf6', 
          label: 'Efficiency ($/delivery)', 
          formatter: (value: number) => `$${value.toFixed(2)}` 
        };
    }
  };

  const metricConfig = getMetricConfig();

  return (
    <Card className="holographic-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-quantum-cyan" />
            Performance Trends
          </CardTitle>
          <div className="flex items-center gap-2">
            {showDetailed && (
              <>
                <div className="flex rounded-lg border border-quantum-cyan/20 overflow-hidden">
                  {[
                    { key: 'earnings', label: 'Earnings' },
                    { key: 'deliveries', label: 'Deliveries' },
                    { key: 'rating', label: 'Rating' },
                    { key: 'efficiency', label: 'Efficiency' }
                  ].map(option => (
                    <Button
                      key={option.key}
                      variant={metric === option.key ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setMetric(option.key as any)}
                      className="rounded-none"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <div className="flex rounded-lg border border-quantum-cyan/20 overflow-hidden">
                  <Button
                    variant={chartType === 'line' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChartType('line')}
                    className="rounded-none"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === 'bar' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChartType('bar')}
                    className="rounded-none"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={metricConfig.formatter}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [metricConfig.formatter(value), metricConfig.label]}
                />
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke={metricConfig.color}
                  strokeWidth={2}
                  dot={{ fill: metricConfig.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: metricConfig.color, strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={metricConfig.formatter}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [metricConfig.formatter(value), metricConfig.label]}
                />
                <Bar
                  dataKey={metric}
                  fill={metricConfig.color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

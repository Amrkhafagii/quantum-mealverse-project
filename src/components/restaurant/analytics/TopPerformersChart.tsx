
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

interface TopPerformersChartProps {
  restaurantId: string;
  timeRange: 'week' | 'month' | 'year';
  data: Array<{
    name: string;
    value: number;
  }>;
  isLoading: boolean;
  title: string;
  description: string;
  dataKey?: string;
}

export const TopPerformersChart = ({ 
  data, 
  isLoading, 
  title, 
  description,
  dataKey = 'value'
}: TopPerformersChartProps) => {
  if (isLoading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64 text-gray-400">
          No data available for the selected period.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 5,
              right: 30,
              left: 100,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              type="number" 
              tick={{ fill: '#9ca3af' }} 
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#9ca3af' }} 
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1e293b',
                borderColor: '#3f88c5',
                color: '#fff'
              }}
            />
            <Bar dataKey={dataKey} fill="#3f88c5" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

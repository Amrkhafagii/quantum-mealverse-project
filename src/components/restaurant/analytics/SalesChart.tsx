
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, subDays, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface SalesChartProps {
  restaurantId: string;
  timeRange: 'week' | 'month' | 'year';
}

export const SalesChart: React.FC<SalesChartProps> = ({ restaurantId, timeRange }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    if (restaurantId) {
      fetchSalesData();
    }
  }, [restaurantId, timeRange]);
  
  const fetchSalesData = async () => {
    setLoading(true);
    
    try {
      // Calculate date range
      const today = new Date();
      let startDate;
      let groupByFormat: 'day' | 'week' | 'month' = 'day';
      
      switch(timeRange) {
        case 'week':
          startDate = subDays(today, 7);
          groupByFormat = 'day';
          break;
        case 'month':
          startDate = subDays(today, 30);
          groupByFormat = 'day';
          break;
        case 'year':
          startDate = subDays(today, 365);
          groupByFormat = 'month';
          break;
        default:
          startDate = subDays(today, 7);
      }
      
      // Format dates for Supabase query
      const startDateStr = startOfDay(startDate).toISOString();
      const endDateStr = endOfDay(today).toISOString();
      
      // Fetch orders for this restaurant in the date range
      const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, total, status')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .not('status', 'eq', 'cancelled');
        
      if (error) throw error;
      
      // Generate date intervals based on timeRange
      const interval = eachDayOfInterval({
        start: startDate,
        end: today
      });
      
      // Create empty data structure
      const dateFormat = timeRange === 'year' ? 'MMM yyyy' : 'MMM dd';
      const chartData = interval.map(date => ({
        date: format(date, dateFormat),
        revenue: 0,
      }));
      
      // Fill in data from orders
      if (orders && orders.length > 0) {
        orders.forEach(order => {
          const orderDate = parseISO(order.created_at);
          const dateStr = format(orderDate, dateFormat);
          
          // Find matching date in chartData
          const dataPoint = chartData.find(item => item.date === dateStr);
          if (dataPoint) {
            dataPoint.revenue += order.total || 0;
          }
        });
      }
      
      // If year view, aggregate by month
      if (timeRange === 'year') {
        const monthlyData: Record<string, number> = {};
        
        chartData.forEach(item => {
          if (!monthlyData[item.date]) {
            monthlyData[item.date] = 0;
          }
          monthlyData[item.date] += item.revenue;
        });
        
        const aggregatedData = Object.entries(monthlyData).map(([date, revenue]) => ({
          date,
          revenue
        }));
        
        setData(aggregatedData);
      } else {
        setData(chartData);
      }
      
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        No sales data available for the selected period.
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis 
          dataKey="date" 
          tick={{ fill: '#9ca3af' }}
        />
        <YAxis 
          tick={{ fill: '#9ca3af' }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} 
          contentStyle={{ 
            backgroundColor: '#1e293b',
            borderColor: '#3f88c5',
            color: '#fff'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          name="Revenue" 
          stroke="#3f88c5" 
          strokeWidth={2} 
          dot={{ r: 3 }} 
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

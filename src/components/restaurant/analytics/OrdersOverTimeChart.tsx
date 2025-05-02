
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, subDays, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface OrdersOverTimeChartProps {
  restaurantId: string;
  timeRange: 'week' | 'month' | 'year';
}

export const OrdersOverTimeChart: React.FC<OrdersOverTimeChartProps> = ({ restaurantId, timeRange }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    if (restaurantId) {
      fetchOrdersData();
    }
  }, [restaurantId, timeRange]);
  
  const fetchOrdersData = async () => {
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
        .select('created_at, status')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr);
        
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
        completed: 0,
        cancelled: 0,
        total: 0
      }));
      
      // Fill in data from orders
      if (orders && orders.length > 0) {
        orders.forEach(order => {
          const orderDate = parseISO(order.created_at);
          const dateStr = format(orderDate, dateFormat);
          
          // Find matching date in chartData
          const dataPoint = chartData.find(item => item.date === dateStr);
          if (dataPoint) {
            dataPoint.total += 1;
            
            if (order.status === 'delivered') {
              dataPoint.completed += 1;
            } else if (order.status === 'cancelled') {
              dataPoint.cancelled += 1;
            }
          }
        });
      }
      
      // If year view, aggregate by month
      if (timeRange === 'year') {
        const monthlyData: Record<string, {completed: number, cancelled: number, total: number}> = {};
        
        chartData.forEach(item => {
          if (!monthlyData[item.date]) {
            monthlyData[item.date] = {completed: 0, cancelled: 0, total: 0};
          }
          monthlyData[item.date].completed += item.completed;
          monthlyData[item.date].cancelled += item.cancelled;
          monthlyData[item.date].total += item.total;
        });
        
        const aggregatedData = Object.entries(monthlyData).map(([date, values]) => ({
          date,
          ...values
        }));
        
        setData(aggregatedData);
      } else {
        setData(chartData);
      }
      
    } catch (error) {
      console.error('Error fetching orders data:', error);
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
        No orders data available for the selected period.
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
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
        />
        <Tooltip 
          formatter={(value) => [value, '']}
          contentStyle={{ 
            backgroundColor: '#1e293b',
            borderColor: '#3f88c5',
            color: '#fff'
          }}
        />
        <Legend />
        <Bar dataKey="completed" name="Completed Orders" fill="#10b981" />
        <Bar dataKey="cancelled" name="Cancelled Orders" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
};

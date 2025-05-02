
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { Progress } from '@/components/ui/progress';

interface PopularItemsListProps {
  restaurantId: string;
  timeRange: 'week' | 'month' | 'year';
}

interface PopularItem {
  name: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

export const PopularItemsList: React.FC<PopularItemsListProps> = ({ restaurantId, timeRange }) => {
  const [loading, setLoading] = useState(true);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  
  useEffect(() => {
    if (restaurantId) {
      fetchPopularItems();
    }
  }, [restaurantId, timeRange]);
  
  const fetchPopularItems = async () => {
    setLoading(true);
    
    try {
      // Calculate date range
      const today = new Date();
      let startDate;
      
      switch(timeRange) {
        case 'week':
          startDate = subDays(today, 7);
          break;
        case 'month':
          startDate = subDays(today, 30);
          break;
        case 'year':
          startDate = subDays(today, 365);
          break;
        default:
          startDate = subDays(today, 7);
      }
      
      // Format dates for Supabase query
      const startDateStr = startOfDay(startDate).toISOString();
      const endDateStr = endOfDay(today).toISOString();
      
      // First get orders for this restaurant in the date range
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .not('status', 'eq', 'cancelled');
        
      if (ordersError) throw ordersError;
      
      if (!orders || orders.length === 0) {
        setPopularItems([]);
        setLoading(false);
        return;
      }
      
      // Get order IDs
      const orderIds = orders.map(order => order.id);
      
      // Fetch order items for these orders
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('name, quantity, price')
        .in('order_id', orderIds);
        
      if (itemsError) throw itemsError;
      
      if (!orderItems || orderItems.length === 0) {
        setPopularItems([]);
        setLoading(false);
        return;
      }
      
      // Aggregate items by name
      const itemsMap: Record<string, {quantity: number, revenue: number}> = {};
      
      orderItems.forEach(item => {
        if (!itemsMap[item.name]) {
          itemsMap[item.name] = {quantity: 0, revenue: 0};
        }
        
        itemsMap[item.name].quantity += item.quantity;
        itemsMap[item.name].revenue += item.price * item.quantity;
      });
      
      // Convert to array and sort by quantity
      let itemsArray = Object.entries(itemsMap).map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue,
        percentage: 0 // Will calculate after determining the max
      }));
      
      // Sort by quantity descending
      itemsArray = itemsArray.sort((a, b) => b.quantity - a.quantity);
      
      // Calculate percentage based on the most ordered item
      const maxQuantity = itemsArray[0]?.quantity || 0;
      
      if (maxQuantity > 0) {
        itemsArray = itemsArray.map(item => ({
          ...item,
          percentage: Math.round((item.quantity / maxQuantity) * 100)
        }));
      }
      
      // Take the top 10
      setPopularItems(itemsArray.slice(0, 10));
      
    } catch (error) {
      console.error('Error fetching popular items:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
      </div>
    );
  }
  
  if (popularItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No order data available for the selected period.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {popularItems.map((item, index) => (
        <div key={item.name} className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{index + 1}.</span>
              <span className="font-medium text-white">{item.name}</span>
            </div>
            <div className="text-sm text-gray-400">
              {item.quantity} ordered · ${item.revenue.toFixed(2)}
            </div>
          </div>
          <Progress value={item.percentage} className="h-2" />
        </div>
      ))}
    </div>
  );
};

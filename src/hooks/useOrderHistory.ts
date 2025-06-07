
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrderItem {
  id: string;
  meal_id: string;
  quantity: number;
  price: number;
  customizations?: any;
}

export interface Order {
  id: string;
  formatted_order_id?: string;
  customer_id: string;
  restaurant_id: string;
  status: string;
  total: number;
  delivery_address: string;
  customer_name?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
  order_items?: OrderItem[];
}

export function useOrderHistory(userId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = async () => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data as Order[]);
    } catch (err) {
      console.error('Error fetching order history:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders
  };
}


import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PendingAssignment {
  id: string;
  order_id: string;
  expires_at: string;
  assigned_at: string;
  order: {
    id: string;
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    total: number;
    created_at: string;
    status: string;
    order_items?: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
  };
}

export const usePendingAssignments = (restaurantId: string) => {
  const [assignments, setAssignments] = useState<PendingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (!restaurantId) return;
    
    try {
      setLoading(true);
      console.log('Fetching pending assignments for restaurant:', restaurantId);

      // Simplified query without deeply nested relationships to avoid ambiguity
      const { data, error: fetchError } = await supabase
        .from('restaurant_assignments')
        .select(`
          id,
          order_id,
          expires_at,
          created_at,
          orders!restaurant_assignments_order_id_fkey (
            id,
            customer_name,
            customer_phone,
            delivery_address,
            total,
            created_at,
            status
          )
        `)
        .or(`restaurant_id.eq.${restaurantId},restaurant_id.is.null`)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching assignments:', fetchError);
        setError(fetchError.message);
        return;
      }

      console.log('Fetched assignments:', data);

      // Transform the data and fetch order items separately to avoid ambiguity
      const transformedData = await Promise.all(
        (data || []).map(async (assignment) => {
          const orderData = assignment.orders as any;
          
          // Fetch order items separately to avoid nested query ambiguity
          const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('id, name, quantity, price')
            .eq('order_id', assignment.order_id);

          if (itemsError) {
            console.error('Error fetching order items for order:', assignment.order_id, itemsError);
          }

          return {
            id: assignment.id,
            order_id: assignment.order_id,
            expires_at: assignment.expires_at,
            assigned_at: assignment.created_at,
            order: {
              id: orderData?.id || assignment.order_id,
              customer_name: orderData?.customer_name || '',
              customer_phone: orderData?.customer_phone || '',
              delivery_address: orderData?.delivery_address || '',
              total: orderData?.total || 0,
              created_at: orderData?.created_at || '',
              status: orderData?.status || '',
              order_items: orderItems || []
            }
          };
        })
      );

      setAssignments(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error in fetchAssignments:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchAssignments();

    if (!restaurantId) return;

    // Set up real-time subscription for assignment changes
    const channel = supabase
      .channel(`restaurant_assignments_${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurant_assignments',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          console.log('Assignment update received, refreshing...');
          fetchAssignments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurant_assignments',
          filter: `restaurant_id=is.null`,
        },
        () => {
          console.log('New unassigned order received, refreshing...');
          fetchAssignments();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [restaurantId, fetchAssignments]);

  return {
    assignments,
    loading,
    error,
    refetch: fetchAssignments
  };
};

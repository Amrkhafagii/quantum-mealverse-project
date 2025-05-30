
import { useState, useEffect } from 'react';
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

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending assignments for restaurant:', restaurantId);

      const { data, error: fetchError } = await supabase
        .from('restaurant_assignments')
        .select(`
          id,
          order_id,
          expires_at,
          created_at,
          orders!inner (
            id,
            customer_name,
            customer_phone,
            delivery_address,
            total,
            created_at,
            status,
            order_items (
              id,
              name,
              quantity,
              price
            )
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching assignments:', fetchError);
        setError(fetchError.message);
        return;
      }

      console.log('Fetched assignments:', data);

      // Transform the data to match our interface
      const transformedData = (data || []).map(assignment => ({
        id: assignment.id,
        order_id: assignment.order_id,
        expires_at: assignment.expires_at,
        assigned_at: assignment.created_at,
        order: {
          ...assignment.orders,
          order_items: assignment.orders.order_items || []
        }
      }));

      setAssignments(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error in fetchAssignments:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!restaurantId) return;

    fetchAssignments();

    // Set up real-time subscription for new assignments
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
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [restaurantId]);

  return {
    assignments,
    loading,
    error,
    refetch: fetchAssignments
  };
};

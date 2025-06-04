
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PendingAssignment {
  id: string;
  order_id: string;
  expires_at: string;
  assigned_at: string;
  order: {
    id: string;
    user_id?: string;
    customer_name: string;
    customer_email?: string;
    customer_phone: string;
    delivery_address: string;
    city?: string;
    delivery_method?: string;
    payment_method?: string;
    delivery_fee?: number;
    subtotal?: number;
    total: number;
    created_at: string;
    updated_at?: string;
    status: string;
    latitude?: number;
    longitude?: number;
    formatted_order_id?: string;
    restaurant_id?: string;
    assignment_source?: string;
    notes?: string;
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

      // Use the new database function to avoid ambiguity issues
      const { data, error: fetchError } = await supabase
        .rpc('get_pending_restaurant_assignments', {
          p_restaurant_id: restaurantId
        });

      if (fetchError) {
        console.error('Error fetching assignments:', fetchError);
        setError(fetchError.message);
        return;
      }

      console.log('Fetched assignments via RPC:', data);

      // Transform the data from the RPC function to match our interface
      const transformedData = (data || []).map((row: any) => ({
        id: row.assignment_id,
        order_id: row.order_id,
        expires_at: row.expires_at,
        assigned_at: row.assigned_at,
        order: {
          id: row.order_id,
          user_id: row.user_id || '',
          customer_name: row.customer_name,
          customer_email: row.customer_email || '',
          customer_phone: row.customer_phone,
          delivery_address: row.delivery_address,
          city: row.city || '',
          delivery_method: row.delivery_method || 'delivery',
          payment_method: row.payment_method || 'card',
          delivery_fee: row.delivery_fee || 0,
          subtotal: row.subtotal || row.order_total || 0,
          total: row.order_total,
          created_at: row.order_created_at,
          updated_at: row.order_updated_at || row.order_created_at,
          status: row.order_status,
          latitude: row.latitude,
          longitude: row.longitude,
          formatted_order_id: row.formatted_order_id,
          restaurant_id: row.restaurant_id,
          assignment_source: row.assignment_source || 'unknown',
          notes: row.notes,
          order_items: row.order_items || []
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


import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UseRestaurantDataOptions {
  queryKey: string;
  tableName: string;
  restaurantId: string; // This is already UUID string
  selectFields?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
  onSuccess?: (data: any[]) => void;
  onError?: (error: Error) => void;
}

interface UseRestaurantDataReturn {
  data: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useRestaurantData({
  queryKey,
  tableName,
  restaurantId,
  selectFields = '*',
  filters = {},
  orderBy,
  limit,
  enabled = true,
  onSuccess,
  onError
}: UseRestaurantDataOptions): UseRestaurantDataReturn {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!enabled || !restaurantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching ${queryKey} for restaurant:`, restaurantId);

      // Build query dynamically using string interpolation to avoid type issues
      const queryBuilder = supabase.from(tableName as any);
      let query = queryBuilder
        .select(selectFields)
        .eq('restaurant_id', restaurantId); // restaurantId is already UUID string

      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data: fetchedData, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      console.log(`Successfully fetched ${queryKey}:`, fetchedData?.length || 0, 'items');
      
      setData(fetchedData || []);
      
      if (onSuccess) {
        onSuccess(fetchedData || []);
      }
    } catch (err) {
      console.error(`Error fetching ${queryKey}:`, err);
      const errorMessage = err instanceof Error ? err.message : `Failed to load ${queryKey}`;
      setError(errorMessage);
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    restaurantId,
    tableName,
    selectFields,
    JSON.stringify(filters),
    JSON.stringify(orderBy),
    limit,
    queryKey,
    onSuccess,
    onError,
    toast
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    refresh: fetchData
  };
}

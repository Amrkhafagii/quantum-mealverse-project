
import { supabase as originalSupabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Export the original client for when we need it
export { originalSupabase };

// Helper function for typesafe table access
export function fromTable<T extends keyof Database['public']['Tables']>(
  table: T
) {
  return originalSupabase.from(table) as any;
}

// Use the original client as the default export
export const supabase = originalSupabase;

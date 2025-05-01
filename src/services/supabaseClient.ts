
import { supabase as originalSupabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Create a typed client with our extended database type
export const supabase = originalSupabase as unknown as ReturnType<typeof originalSupabase.from<Database>>;

// Helper function to properly type our table access
export const fromTable = <T extends keyof Database['public']['Tables']>(
  table: T
) => {
  return originalSupabase.from(table) as any;
};

// Export the original client as well for cases where we need it
export { originalSupabase };

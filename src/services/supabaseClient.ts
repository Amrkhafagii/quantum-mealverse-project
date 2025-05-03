
import { supabase as originalSupabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { UserType } from '@/types/auth';

// Export the original client for when we need it
export { originalSupabase };

// Helper function for typesafe table access
export function fromTable<T extends keyof Database['public']['Tables']>(
  table: T
) {
  return originalSupabase.from(table);
}

// User type specific functions
export const userTypeService = {
  async getUserType(userId: string): Promise<UserType['type'] | null> {
    const { data, error } = await originalSupabase
      .from('user_types')
      .select('type')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error || !data) return null;
    return data.type as UserType['type'];
  },
  
  async updateUserType(userId: string, type: UserType['type']): Promise<boolean> {
    const { error } = await originalSupabase
      .from('user_types')
      .upsert({ 
        user_id: userId, 
        type 
      });
      
    return !error;
  }
};

// Use the original client as the default export
export const supabase = originalSupabase;

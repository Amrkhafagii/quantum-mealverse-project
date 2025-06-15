
import { supabase as originalSupabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { UserType } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

// Export the original client for when we need it
export { originalSupabase };

// Add error handling wrapper around Supabase calls
const handleSupabaseError = async <T>(promise: Promise<T>): Promise<T> => {
  try {
    return await promise;
  } catch (error: any) {
    console.error("Supabase Error:", error);
    toast({
      title: "Connection Error",
      description: error?.message || "A database error occurred",
      variant: "destructive"
    });
    throw error;
  }
};

// Helper function for typesafe table access
export function fromTable<T extends keyof Database['public']['Tables']>(
  table: T
) {
  return originalSupabase.from(table);
}

// User type specific functions
export const userTypeService = {
  async getUserType(userId: string): Promise<UserType['type'] | null> {
    try {
      const { data, error } = await originalSupabase
        .from('user_types')
        .select('type')
        .eq('user_types_user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error getting user type:", error);
        return null;
      }
      if (!data) return null;
      return data.type as UserType['type'];
    } catch (error) {
      console.error("Failed to get user type:", error);
      return null;
    }
  },
  
  async updateUserType(userId: string, type: UserType['type']): Promise<boolean> {
    try {
      const { error } = await originalSupabase
        .from('user_types')
        .upsert({ 
          user_types_user_id: userId, 
          type 
        });
      
      return !error;
    } catch (error) {
      console.error("Failed to update user type:", error);
      return false;
    }
  }
};

// Use the original client as the default export
export const supabase = originalSupabase;

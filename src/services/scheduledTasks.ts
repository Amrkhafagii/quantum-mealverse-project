
import { supabase } from '@/integrations/supabase/client';
import { SavedMealPlan } from '@/types/fitness';
import { Json } from '@/types/database';

/**
 * Process expired meal plans and deactivate them
 */
export const processExpiredMealPlans = async (): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    const now = new Date().toISOString();
    
    // Query for expired and active meal plans
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .select('*')
      .lt('expires_at', now)
      .eq('is_active', true);
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return { success: true, count: 0 };
    }
    
    // Update expired plans to inactive
    const { error: updateError } = await supabase
      .from('saved_meal_plans')
      .update({ is_active: false } as any)
      .lt('expires_at', now)
      .eq('is_active', true);
      
    if (updateError) throw updateError;
    
    return { success: true, count: data.length };
  } catch (error: any) {
    console.error('Error processing expired meal plans:', error);
    return { success: false, count: 0, error: error.message };
  }
};

/**
 * Check and update expired meal plans
 */
export const checkExpiredMealPlans = async (): Promise<{ success: boolean; updated: number; error?: string }> => {
  try {
    const now = new Date().toISOString();
    
    const { count, error } = await supabase
      .from('saved_meal_plans')
      .update({ is_active: false } as any)
      .lt('expires_at', now)
      .eq('is_active', true);
      
    if (error) throw error;
    
    return { success: true, updated: count || 0 };
  } catch (error: any) {
    return { success: false, updated: 0, error: error.message };
  }
};

/**
 * Check for plans that are going to expire soon
 */
export const checkSoonToExpirePlans = async (userId: string): Promise<{ success: boolean; expiringSoon: number; error?: string }> => {
  try {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    const { count, error } = await supabase
      .from('saved_meal_plans')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_active', true)
      .lt('expires_at', threeDaysLater.toISOString())
      .gt('expires_at', now.toISOString());
      
    if (error) throw error;
    
    return { success: true, expiringSoon: count || 0 };
  } catch (error: any) {
    return { success: false, expiringSoon: 0, error: error.message };
  }
};

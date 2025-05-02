
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/types/database';
import { SavedMealPlan } from '@/types/fitness';

/**
 * Marks expired meal plans as inactive
 */
export const processExpiredMealPlans = async (): Promise<{success: boolean, count: number, error?: string}> => {
  try {
    const now = new Date().toISOString();
    
    // Get all expired meal plans that are still active
    // @ts-ignore - Using expires_at and is_active which exist in DB but not in base type
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .select('*')
      .lt('expires_at', now)
      .eq('is_active', true);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return { success: true, count: 0 };
    }
    
    // Update all expired meal plans to inactive
    // @ts-ignore - Using expires_at and is_active which exist in DB but not in base type
    const { error: updateError } = await supabase
      .from('saved_meal_plans')
      .update({ 
        // @ts-ignore - Using is_active which exists in DB but not in base type
        is_active: false 
      })
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
 * Function to check and update expired meal plans
 * This would typically run on a server as a cron job,
 * but for now we'll call it on app load in designated places
 */
export const checkExpiredMealPlans = async (): Promise<{
  success: boolean;
  updated: number;
  error?: string;
}> => {
  try {
    const now = new Date().toISOString();
    
    // Update all expired meal plans
    // @ts-ignore - Using expires_at and is_active which exist in DB but not in base type
    const { data, error, count } = await supabase
      .from('saved_meal_plans')
      .update({ 
        // @ts-ignore - Using is_active which exists in DB but not in base type
        is_active: false 
      })
      .lt('expires_at', now)
      .eq('is_active', true)
      .select('count');
    
    if (error) throw error;
    
    console.log(`Updated ${count || 0} expired meal plans`);
    
    return {
      success: true,
      updated: count || 0
    };
  } catch (error: any) {
    console.error('Error checking expired meal plans:', error);
    return {
      success: false,
      updated: 0,
      error: error.message
    };
  }
};

/**
 * Check for soon-to-expire meal plans and send notifications
 */
export const checkSoonToExpirePlans = async (userId: string): Promise<{
  success: boolean;
  expiringSoon: number;
  error?: string;
}> => {
  try {
    const now = new Date();
    // Add 3 days to current date
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    // Find meal plans expiring in the next 3 days
    // @ts-ignore - Using expires_at and is_active which exist in DB but not in base type
    const { data, error, count } = await supabase
      .from('saved_meal_plans')
      .select('id, name, expires_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lt('expires_at', threeDaysLater.toISOString())
      .gt('expires_at', now.toISOString());
      
    if (error) throw error;
    
    // This would typically send notifications, but for now we'll just return the count
    return {
      success: true,
      expiringSoon: count || 0
    };
  } catch (error: any) {
    console.error('Error checking soon-to-expire plans:', error);
    return {
      success: false,
      expiringSoon: 0,
      error: error.message
    };
  }
};

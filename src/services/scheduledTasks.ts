
import { supabase } from '@/integrations/supabase/client';

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
    const { data, error, count } = await supabase
      .from('saved_meal_plans')
      .update({ is_active: false })
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

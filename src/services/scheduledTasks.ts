
import { supabase } from '@/integrations/supabase/client';
import { SavedMealPlanWithExpiry } from '@/types/webhook';
import { fromSupabaseJson } from '@/utils/supabaseUtils';
import { toast } from 'sonner';

/**
 * Checks and deactivates any meal plans that are past their expiration date
 */
export const checkExpiredMealPlans = async () => {
  try {
    // Get all active meal plans that have an expiry date earlier than now
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .select('*')
      .eq('is_active', true)
      .lt('expires_at', new Date().toISOString());
    
    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`Found ${data.length} expired meal plans`);
      
      // Update all expired plans to inactive
      const { error: updateError } = await supabase
        .from('saved_meal_plans')
        .update({ is_active: false })
        .in('id', data.map(plan => plan.id));
      
      if (updateError) throw updateError;
      
      console.log(`Successfully deactivated ${data.length} expired meal plans`);
      return { success: true, deactivated: data.length };
    }
    
    return { success: true, deactivated: 0 };
  } catch (error) {
    console.error('Error checking expired meal plans:', error);
    return { success: false, error: error };
  }
};

/**
 * Checks for plans that will expire soon for a specific user
 * @param userId The ID of the user to check plans for
 * @param daysWarning Number of days to warn before expiration (default 3)
 */
export const checkSoonToExpirePlans = async (userId: string, daysWarning = 3) => {
  try {
    // Get the date for plans expiring soon
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + daysWarning);
    
    // Get all active meal plans for the user that expire soon
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lt('expires_at', warningDate.toISOString())
      .gt('expires_at', new Date().toISOString());
    
    if (error) throw error;

    // Parse meal plans to proper format
    const expiringSoonPlans: SavedMealPlanWithExpiry[] = data?.map(plan => ({
      ...plan,
      is_active: plan.is_active || false,
      meal_plan: fromSupabaseJson(plan.meal_plan)
    })) || [];
    
    return { 
      success: true, 
      expiringSoon: expiringSoonPlans.length,
      plans: expiringSoonPlans
    };
  } catch (error) {
    console.error('Error checking soon to expire meal plans:', error);
    return { success: false, error: error, expiringSoon: 0 };
  }
};

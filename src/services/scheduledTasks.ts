
import { supabase } from '@/integrations/supabase/client';
import { SavedMealPlan } from '@/types/fitness';
import { toast } from 'sonner';
import { createNotification } from '@/components/ui/fitness-notification';

/**
 * Checks for expired meal plans and marks them as expired
 */
export const checkExpiredMealPlans = async (): Promise<{success: boolean, expired: number}> => {
  try {
    const now = new Date();
    
    // Find meal plans that are expired but still active
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .update({ is_active: false })
      .eq('is_active', true)
      .lt('expires_at', now.toISOString())
      .select('id');
    
    if (error) throw error;
    
    const expiredCount = data?.length || 0;
    
    return {
      success: true,
      expired: expiredCount
    };
  } catch (error) {
    console.error('Error checking expired meal plans:', error);
    return {
      success: false,
      expired: 0
    };
  }
};

/**
 * Checks for meal plans that will expire soon and notifies users
 */
export const checkSoonToExpirePlans = async (userId: string): Promise<{success: boolean, expiringSoon: number}> => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Find meal plans that expire within the next 3 days
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lt('expires_at', threeDaysFromNow.toISOString())
      .gt('expires_at', now.toISOString());
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Create notifications for soon-to-expire plans
      for (const plan of data as SavedMealPlan[]) {
        // Calculate days until expiration
        const expiresAt = new Date(plan.expires_at || new Date());
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        // Create notification
        await createNotification(
          userId,
          'Meal Plan Expiring Soon',
          `Your meal plan "${plan.name}" will expire in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Consider renewing it.`,
          'reminder',
          `/nutrition/plan/${plan.id}`
        );
      }
    }
    
    return {
      success: true,
      expiringSoon: data ? data.length : 0
    };
  } catch (error) {
    console.error('Error checking soon-to-expire meal plans:', error);
    return {
      success: false,
      expiringSoon: 0
    };
  }
};

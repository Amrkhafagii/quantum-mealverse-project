
import { supabase } from '@/integrations/supabase/client';
import { SavedMealPlanWithExpiry } from '@/types/webhook';
import { toast } from 'sonner';
import { createNotification } from '@/components/ui/fitness-notification';

/**
 * Checks for expired meal plans and marks them as expired
 */
export const checkSoonToExpirePlans = async (userId: string): Promise<void> => {
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
      data.forEach(async (plan: SavedMealPlanWithExpiry) => {
        // Calculate days until expiration
        const expiresAt = new Date(plan.expires_at || '');
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        // Create notification
        await createNotification(
          userId,
          'Meal Plan Expiring Soon',
          `Your meal plan "${plan.name}" will expire in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Consider renewing it.`,
          'reminder',
          `/nutrition/plan/${plan.id}`
        );
      });
    }
  } catch (error) {
    console.error('Error checking soon-to-expire meal plans:', error);
  }
};


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MealPlan {
  id: string;
  user_id: string;
  expires_at?: string;
  is_active: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Meal Plan Expiry Check: Started");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check for expired meal plans
    const now = new Date();
    
    // Find meal plans that are expired but still active
    const { data: expiredPlans, error: expiredError } = await supabase
      .from('saved_meal_plans')
      .update({ is_active: false })
      .eq('is_active', true)
      .lt('expires_at', now.toISOString())
      .select('id, user_id');

    if (expiredError) {
      throw expiredError;
    }

    console.log(`Meal Plan Expiry Check: Marked ${expiredPlans?.length || 0} plans as expired`);

    // Find plans that will expire in the next 3 days and create notifications
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const { data: expiringPlans, error: expiringError } = await supabase
      .from('saved_meal_plans')
      .select('id, name, user_id, expires_at')
      .eq('is_active', true)
      .lt('expires_at', threeDaysFromNow.toISOString())
      .gt('expires_at', now.toISOString());

    if (expiringError) {
      throw expiringError;
    }

    console.log(`Meal Plan Expiry Check: Found ${expiringPlans?.length || 0} plans expiring soon`);

    // Create notifications for soon-to-expire plans
    if (expiringPlans && expiringPlans.length > 0) {
      const notifications = expiringPlans.map((plan: MealPlan & { name: string }) => {
        // Calculate days until expiration
        const expiresAt = new Date(plan.expires_at || new Date());
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 3600 * 24));

        return {
          user_id: plan.user_id,
          title: 'Meal Plan Expiring Soon',
          message: `Your meal plan "${plan.name}" will expire in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Consider renewing it.`,
          type: 'reminder',
          link: `/nutrition/plan/${plan.id}`
        };
      });

      const { error: notifyError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifyError) {
        throw notifyError;
      }

      console.log(`Meal Plan Expiry Check: Created ${notifications.length} notifications`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        expired: expiredPlans?.length || 0,
        expiringSoon: expiringPlans?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Meal Plan Expiry Check: Error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

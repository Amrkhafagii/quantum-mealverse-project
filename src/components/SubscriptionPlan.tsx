import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const SubscriptionPlan = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [plans, setPlans] = React.useState([]);
  const [userSubscription, setUserSubscription] = React.useState(null);

  React.useEffect(() => {
    fetchPlans();
    if (user) {
      fetchUserSubscription();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('subscriptions_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const createSubscription = async (planData: any) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          subscriptions_user_id: user.id, // Updated field name
          plan_name: planData.plan_name,
          price: planData.price,
          status: planData.status,
          meals_per_week: planData.meals_per_week,
          start_date: planData.start_date,
          is_trial: planData.is_trial,
          trial_ends_at: planData.trial_ends_at,
        });

      if (error) throw error;
      
      toast.success('Subscription created successfully!');
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription');
      throw error;
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      setLoading(true);
      
      // In a real app, you would integrate with a payment processor here
      const subscriptionData = {
        plan_name: plan.name,
        price: plan.price,
        status: 'active',
        meals_per_week: plan.meals_per_week,
        start_date: new Date().toISOString(),
        is_trial: plan.has_trial || false,
        trial_ends_at: plan.has_trial 
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() 
          : null,
      };
      
      await createSubscription(subscriptionData);
      await fetchUserSubscription();
      
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setLoading(true);
      
      if (!userSubscription) return;
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', userSubscription.id);
        
      if (error) throw error;
      
      toast.success('Subscription cancelled successfully');
      await fetchUserSubscription();
      
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !plans.length) {
    return <div className="text-center py-8">Loading subscription plans...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>
      
      {userSubscription && userSubscription.status === 'active' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-green-800">Current Subscription</h2>
          <p className="text-green-700">
            You are currently subscribed to the {userSubscription.plan_name} plan.
          </p>
          <p className="text-sm text-green-600 mt-2">
            ${userSubscription.price} per month • {userSubscription.meals_per_week} meals per week
          </p>
          <button
            onClick={cancelSubscription}
            className="mt-3 px-4 py-2 bg-white text-red-600 border border-red-300 rounded-md hover:bg-red-50"
            disabled={loading}
          >
            Cancel Subscription
          </button>
        </div>
      )}
      
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 p-4 border-b">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-2xl font-semibold mt-2">${plan.price}<span className="text-sm text-gray-500">/month</span></p>
            </div>
            <div className="p-4">
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  {plan.meals_per_week} meals per week
                </li>
                {plan.features && plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <span className="mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading || (userSubscription?.status === 'active')}
                className={`w-full py-2 px-4 rounded-md ${
                  userSubscription?.status === 'active'
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {userSubscription?.status === 'active' ? 'Current Plan' : 'Subscribe'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlan;

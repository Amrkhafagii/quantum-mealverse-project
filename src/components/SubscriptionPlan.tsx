
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const SubscriptionPlan = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);

  // Mock data since subscription_plans table doesn't exist in current schema
  const mockPlans = [
    {
      id: '1',
      name: 'Basic Plan',
      price: 9.99,
      meals_per_week: 3,
      features: ['3 meals per week', 'Basic nutrition tracking', 'Email support']
    },
    {
      id: '2',
      name: 'Premium Plan',
      price: 19.99,
      meals_per_week: 6,
      features: ['6 meals per week', 'Advanced nutrition tracking', 'Priority support', 'Custom meal plans']
    },
    {
      id: '3',
      name: 'Pro Plan',
      price: 29.99,
      meals_per_week: 12,
      features: ['12 meals per week', 'Full nutrition suite', '24/7 support', 'Personal trainer access']
    }
  ];

  const handleSubscribe = async (plan: any) => {
    try {
      setLoading(true);
      // Mock subscription logic - in a real app, this would integrate with payment processor
      toast.success(`Successfully subscribed to ${plan.name}!`);
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Subscription Plans</h1>
          <p className="text-gray-600">Please sign in to view subscription plans.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {mockPlans.map((plan) => (
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
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <span className="mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading}
                className="w-full py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300"
              >
                {loading ? 'Processing...' : 'Subscribe'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlan;

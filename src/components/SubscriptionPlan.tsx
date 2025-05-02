
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import HolographicCard from './HolographicCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface SubscriptionPlanProps {
  title: string;
  price: number;
  period: string;
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
  className?: string;
  ctaText?: string;
  onSubscribe?: () => void;
  priceDisplay?: string; // Optional formatted price string
  mealsPerWeek?: number;
}

const SubscriptionPlan: React.FC<SubscriptionPlanProps> = ({
  title,
  price,
  period,
  description,
  features,
  highlighted = false,
  className,
  ctaText = 'Subscribe Now',
  onSubscribe,
  priceDisplay,
  mealsPerWeek = 5, // Default to 5 meals per week if not specified
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = async () => {
    // Direct logging test
    console.log('Testing direct log from SubscriptionPlan component');
    try {
      const { error } = await supabase.from('customer_logs').insert({
        type: 'click',
        element_id: 'subscription_button',
        element_type: 'button',
        element_class: 'subscription-cta',
        page_url: window.location.href,
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        console.error('Direct logging test failed:', error);
      } else {
        console.log('Direct logging test succeeded');
      }
    } catch (err) {
      console.error('Direct logging test error:', err);
    }
    
    // If user is not logged in, redirect to login page
    if (!user) {
      toast.info('Please log in to subscribe to a meal plan');
      navigate('/login', { state: { from: '/subscription' } });
      return;
    }

    try {
      // Check if user already has an active subscription
      const { data: existingSubscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingSubscription) {
        // User already has an active subscription
        toast.info('You already have an active subscription. Please manage it from your profile.');
        navigate('/profile');
        return;
      }

      // Create new subscription
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_name: title,
          price: price,
          status: 'active',
          meals_per_week: mealsPerWeek
        });

      if (insertError) throw insertError;

      toast.success(`You've successfully subscribed to the ${title} plan!`);
      
      // Redirect to profile page to see subscription
      navigate('/profile');
    } catch (error) {
      console.error('Error handling subscription:', error);
      toast.error('There was an error processing your subscription. Please try again.');
    }
    
    // Call the provided onSubscribe handler
    if (onSubscribe) {
      onSubscribe();
    }
  };

  const getGlowColor = () => {
    if (highlighted) {
      return 'rgba(108, 92, 231, 0.5)'; // Purple glow for highlighted
    } else if (title.includes('Basic')) {
      return 'rgba(0, 245, 212, 0.5)'; // Cyan glow for Basic
    } else {
      return 'rgba(0, 245, 212, 0.5)'; // Cyan glow for Ultimate
    }
  };

  const getTitleColor = () => {
    if (highlighted) {
      return "text-quantum-purple";
    } else if (title.includes('Basic')) {
      return "text-quantum-cyan";
    } else {
      return "text-quantum-cyan";
    }
  };

  const getPriceColor = () => {
    if (highlighted) {
      return "text-quantum-purple";
    } else if (title.includes('Basic')) {
      return "text-quantum-cyan";
    } else {
      return "text-quantum-cyan";
    }
  };

  const getButtonStyle = () => {
    if (highlighted) {
      return "bg-quantum-purple text-white hover:bg-quantum-darkPurple";
    } else if (title.includes('Basic')) {
      return "bg-transparent border border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10";
    } else {
      return "bg-transparent border border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10";
    }
  };

  return (
    <HolographicCard
      className={cn(
        'h-full flex flex-col relative overflow-hidden',
        highlighted ? 'border-2 border-quantum-purple' : 'border border-quantum-cyan/30',
        className
      )}
      glowColor={getGlowColor()}
    >
      {highlighted && (
        <div className="absolute top-0 left-0 right-0 bg-quantum-purple text-center py-1 px-4 text-sm font-bold" aria-label="Most Popular Plan">
          MOST Popular
        </div>
      )}

      <div className="flex flex-col h-full pt-8 p-6">
        <div className="mb-4" role="heading" aria-level={3}>
          <h3 className={cn(
            "text-3xl font-bold mb-2",
            getTitleColor()
          )}>
            {title}
          </h3>
          <div className="flex items-baseline mb-2">
            <span className={cn(
              "text-5xl font-bold",
              getPriceColor()
            )}
              aria-label={`${priceDisplay || `$${price}`} per ${period}`}
            >
              {priceDisplay || `$${price}`}
            </span>
            <span className="text-sm ml-1 text-gray-400">/{period}</span>
          </div>
          <p className="text-gray-400 mb-6 h-12">{description}</p>
        </div>

        <div className="space-y-4 mb-8 flex-grow">
          <ul aria-label={`Features of ${title} plan`}>
            {features.map((feature, index) => (
              <li
                key={index}
                className={cn(
                  "flex items-start mb-4",
                  !feature.included && "opacity-50"
                )}
              >
                <Check
                  className={cn(
                    "h-5 w-5 mr-3 flex-shrink-0",
                    feature.included
                      ? highlighted
                        ? "text-quantum-purple"
                        : "text-quantum-cyan"
                      : "text-gray-500"
                  )}
                  aria-hidden="true"
                />
                <span className={feature.included ? "" : "line-through"}>
                  {feature.text} {!feature.included && <span className="sr-only">(not included)</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleClick}
          className={cn(
            "w-full py-3 px-6 rounded-md transition-all duration-300 text-center subscription-cta mt-auto",
            getButtonStyle()
          )}
          aria-label={`${ctaText} for ${title} plan at ${priceDisplay || `$${price}`} per ${period}`}
        >
          {ctaText}
        </button>
      </div>
    </HolographicCard>
  );
};

export default SubscriptionPlan;

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import HolographicCard from './HolographicCard';
import { supabase } from '@/integrations/supabase/client';

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
}) => {
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
    
    // Call the provided onSubscribe handler
    if (onSubscribe) {
      onSubscribe();
    }
  };

  return (
    <HolographicCard
      className={cn(
        'h-full flex flex-col',
        highlighted ? 'border-2 border-quantum-purple neon-glow' : 'border border-quantum-cyan/30',
        className
      )}
      glowColor={highlighted ? 'rgba(108, 92, 231, 0.5)' : 'rgba(0, 245, 212, 0.3)'}
    >
      {highlighted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-quantum-purple text-quantum-black px-4 py-1 rounded-full text-sm font-bold">
          Most Popular
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h3 className={cn(
            "text-2xl font-bold mb-2",
            highlighted ? "text-quantum-purple" : "text-quantum-cyan"
          )}>
            {title}
          </h3>
          <div className="flex items-end mb-2">
            <span className={cn(
              "text-4xl font-bold",
              highlighted ? "text-quantum-purple" : "text-quantum-cyan"
            )}>
              ${price}
            </span>
            <span className="text-sm ml-1 mb-1 text-gray-400">/{period}</span>
          </div>
          <p className="text-gray-400 mb-6">{description}</p>
        </div>

        <div className="space-y-3 mb-8 flex-grow">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start",
                !feature.included && "opacity-50"
              )}
            >
              <Check
                className={cn(
                  "h-5 w-5 mr-2 flex-shrink-0",
                  feature.included
                    ? highlighted
                      ? "text-quantum-purple"
                      : "text-quantum-cyan"
                    : "text-gray-500"
                )}
              />
              <span className={feature.included ? "" : "line-through"}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={handleClick}
          className={cn(
            "w-full py-3 px-6 rounded-md transition-all duration-300 text-center subscription-cta",
            highlighted
              ? "bg-quantum-purple text-white hover:bg-quantum-darkPurple"
              : "cyber-button"
          )}
        >
          {ctaText}
        </button>
      </div>
    </HolographicCard>
  );
};

export default SubscriptionPlan;

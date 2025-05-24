
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Utensils, 
  ShoppingCart, 
  CreditCard, 
  Package,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CustomerJourneyGuideProps {
  hasLocation?: boolean;
  hasRestaurants?: boolean;
  cartItems?: number;
  isAuthenticated?: boolean;
}

export const CustomerJourneyGuide: React.FC<CustomerJourneyGuideProps> = ({
  hasLocation = false,
  hasRestaurants = false,
  cartItems = 0,
  isAuthenticated = false
}) => {
  const { user } = useAuth();
  
  const journeySteps = [
    {
      id: 'location',
      title: 'Enable Location',
      description: 'Allow location access to find nearby restaurants',
      icon: MapPin,
      completed: hasLocation,
      action: null,
      required: true
    },
    {
      id: 'browse',
      title: 'Browse Restaurants',
      description: 'Discover restaurants and menu items near you',
      icon: Utensils,
      completed: hasLocation && hasRestaurants,
      action: hasLocation ? null : 'Enable location first',
      required: true
    },
    {
      id: 'cart',
      title: 'Add to Cart',
      description: 'Select your favorite meals and add to cart',
      icon: ShoppingCart,
      completed: cartItems > 0,
      action: cartItems > 0 ? `/cart` : null,
      required: true
    },
    {
      id: 'auth',
      title: 'Sign In',
      description: 'Create account or sign in to place orders',
      icon: user ? CheckCircle : CreditCard,
      completed: isAuthenticated,
      action: isAuthenticated ? null : '/auth',
      required: true
    },
    {
      id: 'order',
      title: 'Place Order',
      description: 'Complete checkout and track your delivery',
      icon: Package,
      completed: false,
      action: (cartItems > 0 && isAuthenticated) ? '/checkout' : null,
      required: true
    }
  ];
  
  const completedSteps = journeySteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / journeySteps.length) * 100;
  
  const nextStep = journeySteps.find(step => !step.completed);
  
  return (
    <Card className="bg-gradient-to-r from-quantum-darkBlue/40 to-quantum-cyan/10 border-quantum-cyan/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Package className="h-5 w-5 text-quantum-cyan" />
          Your Order Journey
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Progress: {completedSteps} of {journeySteps.length} steps</span>
            <span>{Math.round(progressPercentage)}% complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Journey Steps */}
        <div className="space-y-3">
          {journeySteps.map((step, index) => {
            const isNext = step.id === nextStep?.id;
            const StepIcon = step.icon;
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  step.completed
                    ? 'bg-green-900/20 border border-green-600/30'
                    : isNext
                    ? 'bg-quantum-cyan/10 border border-quantum-cyan/30'
                    : 'bg-quantum-darkBlue/30 border border-gray-600/20'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  step.completed
                    ? 'bg-green-600 text-white'
                    : isNext
                    ? 'bg-quantum-cyan text-quantum-black'
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  <StepIcon className="h-4 w-4" />
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    step.completed ? 'text-green-200' : isNext ? 'text-quantum-cyan' : 'text-gray-300'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
                
                {step.completed && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                
                {!step.completed && step.action && typeof step.action === 'string' && step.action.startsWith('/') && (
                  <Button asChild size="sm" className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black">
                    <Link to={step.action}>
                      Go <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Next Step CTA */}
        {nextStep && (
          <div className="mt-6 p-4 bg-quantum-cyan/20 rounded-lg border border-quantum-cyan/30">
            <h4 className="font-semibold text-quantum-cyan mb-2">Next Step: {nextStep.title}</h4>
            <p className="text-gray-300 text-sm mb-3">{nextStep.description}</p>
            {nextStep.action && typeof nextStep.action === 'string' && nextStep.action.startsWith('/') ? (
              <Button asChild className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black">
                <Link to={nextStep.action}>
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <p className="text-quantum-cyan text-sm font-medium">{nextStep.action || 'Complete previous steps first'}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

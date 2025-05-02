
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Truck, Clock, AlertTriangle } from 'lucide-react';
import { DeliveryUser } from '@/types/delivery';
import { useNavigate } from 'react-router-dom';

interface OnboardingCompleteProps {
  deliveryUser: DeliveryUser;
}

export const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ deliveryUser }) => {
  const navigate = useNavigate();
  const isApproved = deliveryUser.is_approved;

  return (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div className="flex justify-center">
        {isApproved ? (
          <CheckCircle className="h-20 w-20 text-green-500" />
        ) : (
          <Clock className="h-20 w-20 text-quantum-cyan animate-pulse" />
        )}
      </div>
      
      <h2 className="text-2xl font-bold">
        {isApproved 
          ? "You're Ready to Deliver!" 
          : "Application Complete!"}
      </h2>
      
      <div className="space-y-4">
        {isApproved ? (
          <p className="text-gray-300">
            Your delivery profile has been approved. You can now start accepting delivery requests 
            and earn money by delivering orders to customers.
          </p>
        ) : (
          <>
            <p className="text-gray-300">
              Thank you for signing up as a delivery partner. We'll review your information 
              and documents shortly. This process typically takes 1-3 business days.
            </p>
            <div className="bg-quantum-darkBlue/50 border border-quantum-cyan/20 rounded-md p-4 text-left">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">
                  You'll receive an email notification when your account has been approved. 
                  Be sure to check your spam folder as well.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="pt-6 flex flex-col gap-3">
        <Button 
          onClick={() => navigate('/delivery/dashboard')}
          disabled={!isApproved}
          className="w-full"
        >
          <Truck className="mr-2 h-5 w-5" />
          {isApproved ? "Go to Delivery Dashboard" : "Check Application Status"}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="w-full"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

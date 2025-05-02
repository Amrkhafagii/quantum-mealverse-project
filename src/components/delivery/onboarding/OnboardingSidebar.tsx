
import React from 'react';
import { Check, CircleDashed, CircleDotDashed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingSidebarProps {
  currentStep: number;
  completeSteps: Record<number, boolean>;
}

const steps = [
  { id: 1, title: 'Personal Info' },
  { id: 2, title: 'Vehicle Details' },
  { id: 3, title: 'Documents & Verification' },
  { id: 4, title: 'Availability' },
  { id: 5, title: 'Payment Details' },
];

export const OnboardingSidebar: React.FC<OnboardingSidebarProps> = ({ currentStep, completeSteps }) => {
  return (
    <div className="bg-quantum-darkBlue/30 border-r border-quantum-cyan/20 p-6 w-64 hidden md:block">
      <h2 className="text-xl font-bold text-quantum-cyan mb-6">Delivery Signup</h2>
      <div className="space-y-1 mt-8">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={cn(
              "flex items-center p-3 rounded-md transition-colors",
              currentStep === step.id && "bg-quantum-cyan/10",
              completeSteps[step.id] && "text-quantum-cyan"
            )}
          >
            <div className="mr-3">
              {completeSteps[step.id] ? (
                <div className="h-6 w-6 rounded-full bg-quantum-cyan/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-quantum-cyan" />
                </div>
              ) : currentStep === step.id ? (
                <CircleDotDashed className="h-6 w-6 text-quantum-cyan" />
              ) : (
                <CircleDashed className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <span className={cn(
              "text-sm",
              currentStep === step.id ? "text-white font-medium" : "text-gray-400"
            )}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-12 text-xs text-gray-400 px-3">
        <p>Complete all steps to start accepting delivery requests.</p>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { onboardingService } from '@/services/onboarding/onboardingService';
import { ONBOARDING_STEPS, type OnboardingProgress } from '@/types/onboarding';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { OperationalHoursStep } from './steps/OperationalHoursStep';
import { DeliveryAreasStep } from './steps/DeliveryAreasStep';
import { ReviewStep } from './steps/ReviewStep';

export const RestaurantOnboarding: React.FC = () => {
  const { restaurant } = useRestaurantAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState<OnboardingProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurant?.id) {
      loadProgress();
    }
  }, [restaurant?.id]);

  const loadProgress = async () => {
    if (!restaurant?.id) return;
    
    try {
      setLoading(true);
      const progressData = await onboardingService.getProgress(restaurant.id);
      setProgress(progressData);
      
      // Find current step (first incomplete step)
      const incompleteStepIndex = ONBOARDING_STEPS.findIndex(step => 
        !progressData.find(p => p.step_name === step.name && p.is_completed)
      );
      setCurrentStep(incompleteStepIndex === -1 ? ONBOARDING_STEPS.length - 1 : incompleteStepIndex);
    } catch (error) {
      console.error('Error loading progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to load onboarding progress',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async (stepName: string, data?: Record<string, any>, notes?: string) => {
    if (!restaurant?.id) return;

    try {
      const stepIndex = ONBOARDING_STEPS.findIndex(step => step.name === stepName);
      await onboardingService.updateProgress(
        restaurant.id,
        stepName,
        stepIndex + 1,
        true,
        data,
        notes
      );
      
      await loadProgress();
      
      // Move to next step if not the last one
      if (stepIndex < ONBOARDING_STEPS.length - 1) {
        setCurrentStep(stepIndex + 1);
      }
      
      toast({
        title: 'Step Completed',
        description: `${ONBOARDING_STEPS[stepIndex].title} has been completed successfully`
      });
    } catch (error) {
      console.error('Error completing step:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete step',
        variant: 'destructive'
      });
    }
  };

  const getStepStatus = (stepName: string) => {
    const stepProgress = progress.find(p => p.step_name === stepName);
    return stepProgress?.is_completed ? 'completed' : 'pending';
  };

  const getProgressPercentage = () => {
    const completedSteps = progress.filter(p => p.is_completed).length;
    return (completedSteps / ONBOARDING_STEPS.length) * 100;
  };

  const renderStepContent = () => {
    if (!restaurant) return null;

    const step = ONBOARDING_STEPS[currentStep];
    
    switch (step.name) {
      case 'basic_info':
        return (
          <BasicInfoStep
            restaurant={restaurant}
            onComplete={(data) => handleStepComplete('basic_info', data)}
          />
        );
      case 'documents':
        return (
          <DocumentsStep
            restaurantId={restaurant.id}
            onComplete={(data) => handleStepComplete('documents', data)}
          />
        );
      case 'operational_hours':
        return (
          <OperationalHoursStep
            restaurantId={restaurant.id}
            onComplete={(data) => handleStepComplete('operational_hours', data)}
          />
        );
      case 'delivery_areas':
        return (
          <DeliveryAreasStep
            restaurantId={restaurant.id}
            onComplete={(data) => handleStepComplete('delivery_areas', data)}
          />
        );
      case 'review':
        return (
          <ReviewStep
            restaurantId={restaurant.id}
            onComplete={() => handleStepComplete('review')}
            onSubmit={async () => {
              await onboardingService.submitForReview(restaurant.id);
              toast({
                title: 'Submitted for Review',
                description: 'Your restaurant profile has been submitted for approval'
              });
            }}
          />
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quantum-cyan mx-auto mb-4"></div>
          <p className="text-quantum-cyan">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Restaurant Not Found</h3>
            <p className="text-gray-600">Unable to load restaurant information</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-quantum-cyan">Restaurant Onboarding</h1>
        <p className="text-gray-600 mt-2">Complete all steps to get your restaurant approved</p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Onboarding Progress</span>
            <Badge variant={restaurant.onboarding_status === 'completed' ? 'default' : 'secondary'}>
              {restaurant.onboarding_status?.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{Math.round(getProgressPercentage())}% Complete</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
            
            {/* Step Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {ONBOARDING_STEPS.map((step, index) => {
                const status = getStepStatus(step.name);
                const isCurrent = index === currentStep;
                
                return (
                  <Button
                    key={step.id}
                    variant={isCurrent ? 'default' : 'outline'}
                    size="sm"
                    className={`flex items-center justify-center p-2 ${
                      status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' : ''
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    {status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    ) : isCurrent ? (
                      <Clock className="h-4 w-4 mr-1" />
                    ) : (
                      <Circle className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-xs">{step.title}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{ONBOARDING_STEPS[currentStep]?.title}</CardTitle>
          <p className="text-gray-600">{ONBOARDING_STEPS[currentStep]?.description}</p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
};

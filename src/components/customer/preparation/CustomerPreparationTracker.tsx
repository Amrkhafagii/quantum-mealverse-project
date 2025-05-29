
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle, ChefHat } from 'lucide-react';
import { usePreparationStages } from '@/hooks/usePreparationStages';
import { formatDistanceToNow } from 'date-fns';

interface CustomerPreparationTrackerProps {
  orderId: string;
}

const STAGE_LABELS = {
  received: 'Order Received',
  ingredients_prep: 'Preparing Ingredients',
  cooking: 'Cooking Your Meal',
  plating: 'Final Touches',
  quality_check: 'Quality Check',
  ready: 'Ready for Pickup'
};

const STAGE_DESCRIPTIONS = {
  received: 'Your order has been received and is being processed',
  ingredients_prep: 'Our chefs are preparing fresh ingredients for your meal',
  cooking: 'Your meal is being cooked with care',
  plating: 'Adding the final touches to make it perfect',
  quality_check: 'Ensuring everything meets our quality standards',
  ready: 'Your order is ready for pickup or delivery'
};

export const CustomerPreparationTracker: React.FC<CustomerPreparationTrackerProps> = ({
  orderId
}) => {
  const {
    stages,
    progress,
    overallProgress,
    getCurrentStage,
    getEstimatedCompletionTime,
    isLoading
  } = usePreparationStages(orderId);

  const [estimatedCompletion, setEstimatedCompletion] = useState<Date | null>(null);
  const currentStage = getCurrentStage();

  useEffect(() => {
    const updateEstimatedTime = async () => {
      const time = await getEstimatedCompletionTime();
      setEstimatedCompletion(time);
    };
    
    if (orderId && !isLoading) {
      updateEstimatedTime();
    }
  }, [orderId, isLoading, getEstimatedCompletionTime]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading preparation status...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stages || stages.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <ChefHat className="h-8 w-8 mx-auto mb-2" />
          <p>Preparation tracking will be available once your order is accepted</p>
        </CardContent>
      </Card>
    );
  }

  const getStageIcon = (stage: any) => {
    if (stage.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (stage.status === 'in_progress') {
      return <div className="h-5 w-5 border-2 border-blue-500 rounded-full animate-pulse bg-blue-100"></div>;
    } else {
      return <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>;
    }
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ChefHat className="h-5 w-5 text-blue-600" />
              <span>Preparation Progress</span>
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {overallProgress || 0}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress || 0} className="h-3 mb-4" />
          
          {currentStage && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-900">
                Current Stage: {STAGE_LABELS[currentStage.stage_name as keyof typeof STAGE_LABELS]}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {STAGE_DESCRIPTIONS[currentStage.stage_name as keyof typeof STAGE_DESCRIPTIONS]}
              </p>
            </div>
          )}
          
          {estimatedCompletion && (
            <div className="flex items-center space-x-2 mt-3 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                Estimated completion: {formatDistanceToNow(estimatedCompletion, { addSuffix: true })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Preparation Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={stage.id} className="relative">
                {/* Connection line */}
                {index < stages.length - 1 && (
                  <div className="absolute left-2.5 top-8 w-0.5 h-16 bg-gray-200"></div>
                )}
                
                <div className={`flex items-start space-x-3 p-3 rounded-lg border ${getStageColor(stage.status)}`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {getStageIcon(stage)}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {STAGE_LABELS[stage.stage_name as keyof typeof STAGE_LABELS]}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {stage.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mt-1 text-gray-600">
                      {STAGE_DESCRIPTIONS[stage.stage_name as keyof typeof STAGE_DESCRIPTIONS]}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Est: {stage.estimated_duration_minutes} min</span>
                      {stage.started_at && (
                        <span>
                          Started: {formatDistanceToNow(new Date(stage.started_at), { addSuffix: true })}
                        </span>
                      )}
                      {stage.actual_duration_minutes && (
                        <span>Completed in: {stage.actual_duration_minutes} min</span>
                      )}
                    </div>
                    
                    {stage.notes && (
                      <p className="text-xs text-gray-600 mt-2 italic bg-white/50 p-2 rounded">
                        Note: {stage.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

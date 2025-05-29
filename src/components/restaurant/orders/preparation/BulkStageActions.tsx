
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, SkipForward, Clock } from 'lucide-react';
import { usePreparationStages } from '@/hooks/usePreparationStages';

interface BulkStageActionsProps {
  orderId: string;
  onMarkAllComplete?: () => void;
  onSkipToReady?: () => void;
}

export const BulkStageActions: React.FC<BulkStageActionsProps> = ({ 
  orderId, 
  onMarkAllComplete,
  onSkipToReady 
}) => {
  const {
    stages,
    getCurrentStage,
    advanceStage,
    skipStage,
    isAdvancing,
    isSkipping
  } = usePreparationStages(orderId);

  const currentStage = getCurrentStage();
  const hasInProgressStage = !!currentStage;
  const hasMultiplePendingStages = stages?.filter(s => s.status === 'pending').length > 1;

  const handleSkipToReady = async () => {
    if (!stages) return;

    // Skip all pending and in-progress stages except 'ready'
    const stagesToSkip = stages.filter(
      s => (s.status === 'pending' || s.status === 'in_progress') && s.stage_name !== 'ready'
    );

    for (const stage of stagesToSkip) {
      await skipStage(stage.stage_name, 'Bulk skip to ready');
    }

    // Mark ready stage as ready
    const readyStage = stages.find(s => s.stage_name === 'ready');
    if (readyStage && readyStage.status === 'pending') {
      await advanceStage('ready', 'Order marked as ready');
    }

    onSkipToReady?.();
  };

  const handleAdvanceAll = async () => {
    if (!currentStage || !stages) return;

    // Complete current stage and advance through remaining stages
    await advanceStage(currentStage.stage_name, 'Bulk completion');
    onMarkAllComplete?.();
  };

  if (!hasInProgressStage && !hasMultiplePendingStages) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h4 className="font-medium text-gray-800 mb-3">Quick Actions</h4>
      
      <div className="flex flex-wrap gap-2">
        {hasInProgressStage && (
          <Button
            size="sm"
            onClick={handleAdvanceAll}
            disabled={isAdvancing}
            className="bg-green-500 hover:bg-green-600"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete Current Stage
          </Button>
        )}
        
        {hasMultiplePendingStages && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSkipToReady}
            disabled={isSkipping}
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            <SkipForward className="h-3 w-3 mr-1" />
            Skip to Ready
          </Button>
        )}
        
        <Button
          size="sm"
          variant="outline"
          className="border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          <Clock className="h-3 w-3 mr-1" />
          Estimate Time
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Use bulk actions to quickly progress through stages when needed
      </p>
    </div>
  );
};

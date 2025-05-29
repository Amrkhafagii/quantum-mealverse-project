
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FastForward, CheckCircle2, Clock } from 'lucide-react';
import { usePreparationStages } from '@/hooks/usePreparationStages';
import { toast } from 'react-hot-toast';

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
  const { stages, advanceStage } = usePreparationStages(orderId);

  const handleMarkAllComplete = async () => {
    try {
      const pendingStages = stages.filter(s => s.status !== 'completed');
      
      for (const stage of pendingStages) {
        await advanceStage(stage.stage_name, 'Bulk completion');
      }
      
      toast.success('All stages marked as complete!');
      onMarkAllComplete?.();
    } catch (error) {
      console.error('Error marking all stages complete:', error);
      toast.error('Failed to complete all stages');
    }
  };

  const handleSkipToReady = async () => {
    try {
      // Find the ready stage and complete it directly
      const readyStage = stages.find(s => s.stage_name === 'ready');
      if (readyStage) {
        await advanceStage('ready', 'Skipped to ready');
        toast.success('Order marked as ready for pickup!');
        onSkipToReady?.();
      }
    } catch (error) {
      console.error('Error skipping to ready:', error);
      toast.error('Failed to mark order as ready');
    }
  };

  const hasIncompleteStages = stages.some(s => s.status !== 'completed');
  const isReadyStageComplete = stages.find(s => s.stage_name === 'ready')?.status === 'completed';

  if (!hasIncompleteStages) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Button
            onClick={handleMarkAllComplete}
            variant="outline"
            className="flex-1"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark All Complete
          </Button>
          
          {!isReadyStageComplete && (
            <Button
              onClick={handleSkipToReady}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <FastForward className="h-4 w-4 mr-2" />
              Mark Ready for Pickup
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

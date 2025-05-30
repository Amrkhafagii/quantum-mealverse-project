
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, FastForward, FileText } from 'lucide-react';
import { useBatchPreparation } from '@/hooks/restaurant/useBatchPreparation';

interface BulkStageActionsProps {
  orderId: string;
  onMarkAllComplete: () => void;
  onSkipToReady: () => void;
}

export const BulkStageActions: React.FC<BulkStageActionsProps> = ({
  orderId,
  onMarkAllComplete,
  onSkipToReady
}) => {
  const { isProcessing, batchMarkReady, batchSkipStages } = useBatchPreparation();
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const handleMarkAllComplete = async () => {
    await batchMarkReady([orderId]);
    onMarkAllComplete();
  };

  const handleSkipToReady = async () => {
    await batchSkipStages([{
      orderId,
      stageName: 'ready',
      reason: 'Skipped to ready for expedited service'
    }]);
    onSkipToReady();
  };

  const bulkActions = [
    {
      id: 'mark-all-complete',
      label: 'Mark All Complete',
      icon: CheckSquare,
      color: 'bg-green-500',
      action: handleMarkAllComplete
    },
    {
      id: 'skip-to-ready',
      label: 'Skip to Ready',
      icon: FastForward,
      color: 'bg-blue-500',
      action: handleSkipToReady
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Bulk Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bulkActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={action.action}
                disabled={isProcessing}
              >
                <div className={`p-2 rounded-full ${action.color} text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>

        {isProcessing && (
          <div className="mt-4 flex items-center justify-center">
            <Badge variant="secondary" className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>Processing...</span>
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

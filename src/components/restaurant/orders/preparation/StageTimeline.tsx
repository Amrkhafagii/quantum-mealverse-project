
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, PlayCircle, SkipForward, StickyNote } from 'lucide-react';
import { usePreparationStages } from '@/hooks/usePreparationStages';

interface StageTimelineProps {
  orderId: string;
}

export const StageTimeline: React.FC<StageTimelineProps> = ({ orderId }) => {
  const { stages, advanceStage, getElapsedMinutes } = usePreparationStages(orderId);

  const getStageIcon = (status: string, stageName: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'skipped':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const formatStageName = (stageName: string) => {
    return stageName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatElapsedTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const handleAdvanceStage = async (stageName: string) => {
    await advanceStage(stageName);
  };

  if (!stages.length) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No preparation stages found for this order.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => (
        <Card key={stage.id} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStageIcon(stage.status, stage.stage_name)}
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{formatStageName(stage.stage_name)}</h4>
                    <Badge variant="outline" className={getStageColor(stage.status)}>
                      {stage.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500">
                      Est: {stage.estimated_duration_minutes}m
                    </span>
                    
                    {stage.status === 'in_progress' && (
                      <span className="text-sm text-blue-600 font-medium">
                        Elapsed: {formatElapsedTime(getElapsedMinutes(stage.stage_name))}
                      </span>
                    )}
                    
                    {stage.actual_duration_minutes && (
                      <span className="text-sm text-green-600">
                        Completed in: {stage.actual_duration_minutes}m
                      </span>
                    )}
                  </div>
                  
                  {stage.notes && (
                    <div className="mt-2 flex items-center space-x-1">
                      <StickyNote className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{stage.notes}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {stage.status === 'in_progress' && (
                  <Button
                    size="sm"
                    onClick={() => handleAdvanceStage(stage.stage_name)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                )}
                
                {stage.status === 'pending' && index === 0 && (
                  <Button
                    size="sm"
                    onClick={() => handleAdvanceStage(stage.stage_name)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

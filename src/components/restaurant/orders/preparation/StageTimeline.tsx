
import React from 'react';
import { Clock, CheckCircle, AlertCircle, Play, Pause, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePreparationStages } from '@/hooks/usePreparationStages';
import { formatDistanceToNow } from 'date-fns';

interface StageTimelineProps {
  orderId: string;
}

const STAGE_LABELS = {
  received: 'Order Received',
  ingredients_prep: 'Ingredients Prep',
  cooking: 'Cooking',
  plating: 'Plating',
  quality_check: 'Quality Check',
  ready: 'Ready for Pickup'
};

const STAGE_COLORS = {
  pending: 'bg-gray-200 text-gray-600',
  in_progress: 'bg-blue-500 text-white',
  completed: 'bg-green-500 text-white',
  skipped: 'bg-orange-500 text-white'
};

export const StageTimeline: React.FC<StageTimelineProps> = ({ orderId }) => {
  const {
    stages,
    progress,
    overallProgress,
    timerState,
    startStage,
    advanceStage,
    skipStage,
    pauseTimer,
    resumeTimer,
    getCurrentStage,
    isLoading,
    isAdvancing,
    isSkipping
  } = usePreparationStages(orderId);

  const currentStage = getCurrentStage();

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading preparation stages...</p>
      </div>
    );
  }

  if (!stages || stages.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>No preparation stages found</p>
      </div>
    );
  }

  const formatElapsedTime = (startedAt: string) => {
    try {
      return formatDistanceToNow(new Date(startedAt), { addSuffix: false });
    } catch {
      return 'Unknown';
    }
  };

  const getTimerDisplay = () => {
    if (!timerState || !timerState.isRunning) return null;
    
    const minutes = Math.floor(timerState.elapsedTime / (1000 * 60));
    const seconds = Math.floor((timerState.elapsedTime % (1000 * 60)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">Preparation Progress</h3>
          <span className="text-sm font-medium text-blue-600">
            {overallProgress || 0}% Complete
          </span>
        </div>
        <Progress value={overallProgress || 0} className="h-2" />
        
        {timerState && timerState.isRunning && (
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-gray-600">Current Stage: {STAGE_LABELS[timerState.currentStage as keyof typeof STAGE_LABELS]}</span>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-mono text-blue-600">{getTimerDisplay()}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={timerState.isRunning ? pauseTimer : resumeTimer}
                className="ml-2"
              >
                {timerState.isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Stage Timeline */}
      <div className="space-y-3">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className={`bg-white border rounded-lg p-4 transition-all duration-200 ${
              stage.status === 'in_progress' ? 'border-blue-500 shadow-md' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {stage.status === 'completed' ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : stage.status === 'in_progress' ? (
                    <div className="h-6 w-6 border-2 border-blue-500 rounded-full animate-pulse bg-blue-100"></div>
                  ) : stage.status === 'skipped' ? (
                    <SkipForward className="h-6 w-6 text-orange-500" />
                  ) : (
                    <div className="h-6 w-6 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-800">
                      {STAGE_LABELS[stage.stage_name as keyof typeof STAGE_LABELS]}
                    </h4>
                    <Badge 
                      variant="secondary" 
                      className={STAGE_COLORS[stage.status as keyof typeof STAGE_COLORS]}
                    >
                      {stage.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <span>Est: {stage.estimated_duration_minutes}min</span>
                    {stage.started_at && (
                      <span>Started: {formatElapsedTime(stage.started_at)} ago</span>
                    )}
                    {stage.actual_duration_minutes && (
                      <span>Took: {stage.actual_duration_minutes}min</span>
                    )}
                  </div>
                  
                  {stage.notes && (
                    <p className="text-sm text-gray-600 mt-1 italic">{stage.notes}</p>
                  )}
                </div>
              </div>

              {/* Stage Actions */}
              <div className="flex items-center space-x-2">
                {stage.status === 'pending' && index === 0 && (
                  <Button
                    size="sm"
                    onClick={() => startStage(stage.stage_name)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                )}
                
                {stage.status === 'in_progress' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => advanceStage(stage.stage_name)}
                      disabled={isAdvancing}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => skipStage(stage.stage_name, 'Skipped by kitchen')}
                      disabled={isSkipping}
                    >
                      <SkipForward className="h-3 w-3 mr-1" />
                      Skip
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

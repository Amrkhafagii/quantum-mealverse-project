
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { Calendar, Dumbbell, Clock, TrendingUp, ClockIcon } from 'lucide-react';
import { WorkoutHistoryItem } from '@/types/fitness';
import WorkoutLogDetails from './WorkoutLogDetails';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { EnhancedTouchTarget, EnhancedResponsiveGrid } from '@/components/ui/enhanced-mobile-breakpoints';

interface ResponsiveWorkoutHistoryProps {
  userId?: string;
  workoutHistory: WorkoutHistoryItem[];
  isLoading: boolean;
}

const ResponsiveWorkoutHistory: React.FC<ResponsiveWorkoutHistoryProps> = ({ 
  userId, 
  workoutHistory, 
  isLoading 
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [selectedLog, setSelectedLog] = useState<WorkoutHistoryItem | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    setLogs(workoutHistory);
  }, [workoutHistory]);

  const handleSelectLog = (log: any) => {
    const exerciseArr = typeof log.completed_exercises === "string"
      ? JSON.parse(log.completed_exercises)
      : log.completed_exercises;
    
    const logWithRequiredFields: WorkoutHistoryItem = {
      ...log,
      completed_exercises: exerciseArr as any[],
      workout_plan_id: log.workout_plan_id || log.id || 'unknown'
    };
    
    setSelectedLog(logWithRequiredFields);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatDetailedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-quantum-black/30 border-quantum-cyan/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
            <p className="ml-3 text-center text-gray-400">Loading workout history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile layout - stacked cards
  if (isMobile) {
    return (
      <div className="space-y-4">
        <Card className="bg-quantum-black/30 border-quantum-cyan/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-quantum-cyan flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Workout History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No workout logs found.</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <EnhancedTouchTarget
                      key={log.id}
                      size="lg"
                      onClick={() => handleSelectLog(log)}
                      className="w-full p-4 bg-quantum-darkBlue/30 hover:bg-quantum-darkBlue/50 border border-quantum-cyan/10 rounded-lg"
                    >
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white text-sm">
                            {formatDate(log.date)}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {log.completed_exercises?.length || log.exercises_completed} exercises
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{log.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" />
                            <span>{log.completed_exercises?.length || 0} exercises</span>
                          </div>
                        </div>
                      </div>
                    </EnhancedTouchTarget>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {selectedLog && (
          <WorkoutLogDetails log={selectedLog} />
        )}
      </div>
    );
  }

  // Desktop/tablet layout - side by side
  return (
    <EnhancedResponsiveGrid 
      cols={{ md: 2 }} 
      gap="gap-4 sm:gap-6"
      className="h-full"
    >
      {/* Workout History List */}
      <Card className="bg-quantum-black/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-quantum-cyan flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Workout History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ScrollArea className="h-[500px] lg:h-[600px] pr-2">
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No workout logs found.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <EnhancedTouchTarget
                    key={log.id}
                    size="md"
                    onClick={() => handleSelectLog(log)}
                    className="w-full p-4 bg-quantum-darkBlue/30 hover:bg-quantum-darkBlue/50 border border-quantum-cyan/10 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-white">
                          {formatDetailedDate(log.date)}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{log.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>Progress</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {log.completed_exercises?.length || log.exercises_completed} Exercises
                      </Badge>
                    </div>
                  </EnhancedTouchTarget>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Workout Log Details */}
      {selectedLog ? (
        <WorkoutLogDetails log={selectedLog} />
      ) : (
        <Card className="bg-quantum-black/30 border-quantum-cyan/20">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <Calendar className="h-16 w-16 text-gray-500 mb-6" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">Select a Workout</h3>
              <p className="text-gray-400 text-center">Choose a workout log from the list to view detailed information about exercises, sets, and progress.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </EnhancedResponsiveGrid>
  );
};

export default ResponsiveWorkoutHistory;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { WorkoutLog, CompletedExercise } from '@/types/fitness';
import WorkoutLogDetails from './WorkoutLogDetails';

interface WorkoutHistoryProps {
  userId?: string;
  workoutHistory: WorkoutLog[];
  isLoading: boolean;
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ userId, workoutHistory, isLoading }) => {
  const { user } = useAuth();
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    setLogs(workoutHistory);
  }, [workoutHistory]);

  const handleSelectLog = (log: any) => {
    // Ensure correct type for completed_exercises
    const exerciseArr = typeof log.completed_exercises === "string"
      ? JSON.parse(log.completed_exercises)
      : log.completed_exercises;
    setSelectedLog({
      ...log,
      completed_exercises: exerciseArr as any[], // Properly set
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-quantum-black/30 border-quantum-cyan/20">
        <CardContent className="p-6">
          <p className="text-center text-gray-400">Loading workout history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Workout History List */}
      <Card className="bg-quantum-black/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Workout History</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ScrollArea className="h-[400px] lg:h-[500px] pr-2">
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-gray-400">No workout logs found.</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-md bg-quantum-darkBlue/30 hover:bg-quantum-darkBlue/50 cursor-pointer"
                    onClick={() => handleSelectLog(log)}
                  >
                    <div>
                      <h3 className="font-semibold text-white">{format(new Date(log.date), 'PPP')}</h3>
                      <p className="text-sm text-gray-400">Duration: {log.duration} minutes</p>
                    </div>
                    <Badge variant="secondary">
                      {log.completed_exercises?.length} Exercises
                    </Badge>
                  </div>
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
            <div className="flex flex-col items-center justify-center h-full">
              <Calendar className="h-10 w-10 text-gray-500 mb-4" />
              <p className="text-gray-400">Select a workout log to view details.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkoutHistory;

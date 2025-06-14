import React, { useState, useEffect } from "react";
// Only import types once!
import type { WorkoutHistoryItem, WorkoutLog } from "@/types/fitness";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Dumbbell, BarChart3, History } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface WorkoutDetailProps {
  workout: WorkoutHistoryItem;
  log: WorkoutLog;
}

const WorkoutHistoryDetail = ({ workout, log }: WorkoutDetailProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div>
          <h3 className="text-lg font-medium">{workout.workout_plan_name}</h3>
          <p className="text-sm text-gray-400">{workout.workout_day_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(parseISO(workout.date), "MMM d, yyyy")}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {workout.duration} min
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-quantum-cyan">Exercises Completed</h4>
        <div className="grid gap-2">
          {log.completed_exercises.map((exercise, index) => (
            <div key={index} className="bg-quantum-black/30 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <div className="font-medium">{exercise.name || exercise.exercise_name}</div>
                <Badge>{exercise.sets_completed.length} sets</Badge>
              </div>
              <div className="mt-2 space-y-1">
                {exercise.sets_completed.map((set, setIndex) => (
                  <div key={setIndex} className="text-sm flex justify-between">
                    <span>Set {set.set_number}</span>
                    <span className="text-gray-400">
                      {set.weight} kg × {set.reps} reps
                    </span>
                  </div>
                ))}
              </div>
              {exercise.notes && (
                <div className="mt-2 text-sm text-gray-400">
                  <span className="font-medium">Notes:</span> {exercise.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {log.notes && (
        <div className="bg-quantum-black/30 p-3 rounded-md">
          <h4 className="text-sm font-medium text-quantum-cyan mb-1">Workout Notes</h4>
          <p className="text-sm">{log.notes}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm">
          <span className="text-gray-400">Calories burned:</span>{" "}
          <span className="font-medium">{workout.calories_burned || "N/A"}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-400">Completion:</span>{" "}
          <span className="font-medium">
            {workout.exercises_completed} / {workout.total_exercises} exercises
          </span>
        </div>
      </div>
    </div>
  );
};

const WorkoutHistory = (props: { userId?: string, workoutHistory?: WorkoutHistoryItem[], isLoading?: boolean }) => {
  const { userId, workoutHistory, isLoading } = props;
  const { user } = useAuth();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutHistoryItem | null>(null);
  const [selectedWorkoutLog, setSelectedWorkoutLog] = useState<WorkoutLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchWorkoutLog = async (workoutId: string) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("id", workoutId)
        .single();

      if (error) {
        console.error("Error fetching workout log:", error);
        return;
      }

      setSelectedWorkoutLog(data);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutClick = async (workout: WorkoutHistoryItem) => {
    setSelectedWorkout(workout);
    await fetchWorkoutLog(workout.workout_log_id);
    setIsDialogOpen(true);
  };

  if (!userId) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6">
          <p className="text-center text-gray-400">Sign in to view workout history</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredWorkouts = activeTab === "all"
    ? workoutHistory
    : workoutHistory?.filter(workout => {
        const workoutDate = new Date(workout.date);
        const now = new Date();
        
        if (activeTab === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return workoutDate >= weekAgo;
        } else if (activeTab === "month") {
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          return workoutDate >= monthAgo;
        }
        return true;
      });

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-quantum-cyan" />
          Workout History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="month">Last Month</TabsTrigger>
            <TabsTrigger value="week">Last Week</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {filteredWorkouts && filteredWorkouts.length > 0 ? (
              filteredWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="bg-quantum-black/30 p-4 rounded-lg border border-quantum-cyan/10 hover:border-quantum-cyan/30 cursor-pointer transition-colors"
                  onClick={() => handleWorkoutClick(workout)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{workout.workout_plan_name}</h3>
                      <p className="text-sm text-gray-400">{workout.workout_day_name}</p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(parseISO(workout.date), "MMM d, yyyy")}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Dumbbell className="h-3 w-3" />
                      {workout.exercises_completed}/{workout.total_exercises} exercises
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {workout.duration} min
                    </Badge>
                    {workout.calories_burned && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        {workout.calories_burned} cal
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No workout history found</p>
                <Button variant="outline" className="mt-4">
                  Start a Workout
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Workout Details</DialogTitle>
          </DialogHeader>
          {selectedWorkout && selectedWorkoutLog ? (
            <WorkoutHistoryDetail workout={selectedWorkout} log={selectedWorkoutLog} />
          ) : (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WorkoutHistory;

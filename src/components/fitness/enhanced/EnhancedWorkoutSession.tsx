
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timer, Info, Share2, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import RestTimer from '../RestTimer';
import { ExerciseInstructions } from '../ExerciseInstructions';
import { WorkoutSharing } from '../social/WorkoutSharing';
import WorkoutSession from '../workout/WorkoutSession';

interface EnhancedWorkoutSessionProps {
  plan: any;
  dayIndex: number;
  onComplete: () => void;
  onCancel: () => void;
}

export const EnhancedWorkoutSession: React.FC<EnhancedWorkoutSessionProps> = ({
  plan,
  dayIndex,
  onComplete,
  onCancel
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [workoutLog, setWorkoutLog] = useState<any>(null);
  const [completedSets, setCompletedSets] = useState<number>(0);

  const workoutDay = plan.workout_days[dayIndex];
  const currentExercise = workoutDay?.exercises[currentExerciseIndex];

  const handleSetComplete = () => {
    setCompletedSets(prev => prev + 1);
    
    // Check if this was the last set of the exercise
    if (currentSetIndex >= (currentExercise?.sets || 1) - 1) {
      // Move to next exercise
      if (currentExerciseIndex < workoutDay.exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSetIndex(0);
      } else {
        // Workout complete
        handleWorkoutComplete();
      }
    } else {
      // Move to next set
      setCurrentSetIndex(prev => prev + 1);
    }
    
    // Show rest timer between sets
    if (currentSetIndex < (currentExercise?.sets || 1) - 1) {
      setShowTimer(true);
    }
  };

  const handleWorkoutComplete = () => {
    setShowSharing(true);
  };

  const handleTimerComplete = () => {
    setShowTimer(false);
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-quantum-cyan">{workoutDay?.day_name}</h2>
            <Badge variant="outline">
              Exercise {currentExerciseIndex + 1} of {workoutDay?.exercises.length}
            </Badge>
          </div>
          <div className="text-sm text-gray-400">
            Total sets completed: {completedSets}
          </div>
        </CardContent>
      </Card>

      {/* Main Workout Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Session */}
        <div className="lg:col-span-2">
          <WorkoutSession
            plan={plan}
            dayIndex={dayIndex}
            onComplete={onComplete}
            onCancel={onCancel}
          />
        </div>

        {/* Enhanced Features Sidebar */}
        <div className="space-y-4">
          {/* Rest Timer */}
          {showTimer && currentExercise && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <RestTimer
                workoutLogId={workoutLog?.id}
                exerciseName={currentExercise.name}
                setNumber={currentSetIndex + 1}
                defaultRestTime={currentExercise.rest_time || 60}
                onTimerComplete={handleTimerComplete}
              />
            </motion.div>
          )}

          {/* Quick Actions */}
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTimer(true)}
                className="w-full justify-start"
                disabled={showTimer}
              >
                <Timer className="w-4 h-4 mr-2" />
                Start Rest Timer
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full justify-start"
              >
                <Info className="w-4 h-4 mr-2" />
                {showInstructions ? 'Hide' : 'Show'} Instructions
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSharing(true)}
                className="w-full justify-start"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Progress
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workout Sharing Modal */}
      {showSharing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSharing(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <WorkoutSharing
              workoutLog={workoutLog}
              type="completed_workout"
              onShareComplete={() => {
                setShowSharing(false);
                onComplete();
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

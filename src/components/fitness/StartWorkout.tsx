
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { Dumbbell, CalendarClock, Clock } from 'lucide-react';
import { WorkoutPlan } from '@/types/fitness';

const StartWorkout: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { workoutPlans, fetchWorkoutPlans, isLoading } = useWorkoutData();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);

  useEffect(() => {
    if (user) {
      fetchWorkoutPlans(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (selectedPlan) {
      const plan = workoutPlans.find(p => p.id === selectedPlan);
      if (plan) setCurrentPlan(plan);
    } else {
      setCurrentPlan(null);
    }
  }, [selectedPlan, workoutPlans]);

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
    setSelectedDayIndex(null);
  };

  const handleDayChange = (value: string) => {
    setSelectedDayIndex(parseInt(value));
  };

  const handleStartWorkout = () => {
    if (!selectedPlan || selectedDayIndex === null) {
      toast({
        title: "Selection Required",
        description: "Please select both a workout plan and a day.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to workout session page or trigger modal
    toast({
      title: "Workout Started",
      description: `Starting workout: ${currentPlan?.name}, Day: ${currentPlan?.workout_days[selectedDayIndex].day_name}`,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center text-quantum-cyan">
          <Dumbbell className="mr-2 h-5 w-5" />
          Start a Workout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Workout Plan</label>
          <Select onValueChange={handlePlanChange} value={selectedPlan || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Select a workout plan" />
            </SelectTrigger>
            <SelectContent>
              {workoutPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentPlan && (
          <div>
            <label className="block text-sm font-medium mb-1">Workout Day</label>
            <Select onValueChange={handleDayChange} value={selectedDayIndex?.toString() || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {currentPlan.workout_days.map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {day.day_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {currentPlan && selectedDayIndex !== null && (
          <div className="bg-quantum-black/30 rounded-lg p-4 mt-4">
            <div className="text-lg font-medium mb-2">
              {currentPlan.workout_days[selectedDayIndex].day_name}
            </div>
            <div className="text-sm text-gray-400 flex items-center mb-1">
              <Clock className="h-3 w-3 mr-1" />
              {currentPlan.workout_days[selectedDayIndex].exercises.length} exercises
            </div>
            <div className="text-sm text-gray-400 flex items-center">
              <CalendarClock className="h-3 w-3 mr-1" />
              Estimated time: 30-45 minutes
            </div>
          </div>
        )}

        <Button
          className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
          onClick={handleStartWorkout}
          disabled={!selectedPlan || selectedDayIndex === null}
        >
          Start Workout
        </Button>
      </CardContent>
    </Card>
  );
};

export default StartWorkout;

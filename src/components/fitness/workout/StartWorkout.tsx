
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, Calendar, ClipboardList, ChevronRight } from 'lucide-react';
import { WorkoutPlan } from '@/types/fitness';
import WorkoutSession from './WorkoutSession';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { motion } from 'framer-motion';

interface StartWorkoutProps {
  userId?: string;
}

const StartWorkout: React.FC<StartWorkoutProps> = ({ userId }) => {
  const { workoutPlans, schedules, isLoading } = useWorkoutData();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('plans');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  
  const selectedPlan = workoutPlans.find(plan => plan.id === selectedPlanId);
  
  // Get today's schedules
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  const todaysSchedules = schedules.filter(schedule => 
    schedule.active && schedule.days_of_week.includes(dayOfWeek)
  );
  
  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setSelectedDayIndex(0);
  };
  
  const handleDaySelect = (index: number) => {
    setSelectedDayIndex(index);
  };
  
  const handleStartWorkout = () => {
    setIsWorkoutActive(true);
  };
  
  const handleCompleteWorkout = () => {
    setIsWorkoutActive(false);
    setSelectedPlanId('');
    setSelectedDayIndex(0);
  };
  
  const handleCancelWorkout = () => {
    setIsWorkoutActive(false);
  };
  
  if (!userId) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-300">Please log in to start a workout</p>
        </CardContent>
      </Card>
    );
  }
  
  if (isWorkoutActive && selectedPlan) {
    return (
      <WorkoutSession 
        plan={selectedPlan}
        dayIndex={selectedDayIndex}
        onComplete={handleCompleteWorkout}
        onCancel={handleCancelWorkout}
      />
    );
  }
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-2xl text-quantum-cyan">Start a Workout</CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans" className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2" /> All Plans
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" /> Today's Schedule
            </TabsTrigger>
            <TabsTrigger value="quick" className="flex items-center">
              <PlayCircle className="h-4 w-4 mr-2" /> Quick Start
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans" className="space-y-4">
            {isLoading.plans ? (
              <div className="py-8">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-quantum-cyan"></div>
                </div>
                <p className="text-center mt-4">Loading your workout plans...</p>
              </div>
            ) : workoutPlans.length === 0 ? (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-400 py-8"
              >
                No workout plans found. Create a plan first.
              </motion.p>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="plan-select">Select a Workout Plan</Label>
                  <Select value={selectedPlanId} onValueChange={handlePlanSelect}>
                    <SelectTrigger id="plan-select">
                      <SelectValue placeholder="Choose a workout plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {workoutPlans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedPlan && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 mt-4"
                  >
                    <div className="bg-quantum-darkBlue/40 p-4 rounded-md">
                      <h3 className="font-bold text-lg">{selectedPlan.name}</h3>
                      <p className="text-sm text-gray-300">{selectedPlan.description}</p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <span className="text-xs text-gray-400">Goal</span>
                          <p className="capitalize">{selectedPlan.goal}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Difficulty</span>
                          <p className="capitalize">{selectedPlan.difficulty}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="day-select">Choose Workout Day</Label>
                      <Select value={selectedDayIndex.toString()} onValueChange={(value) => handleDaySelect(Number(value))}>
                        <SelectTrigger id="day-select">
                          <SelectValue placeholder="Select workout day" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedPlan.workout_days.map((day, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {day.day_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedPlan.workout_days[selectedDayIndex] && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Exercises in this workout:</h4>
                        <ul className="space-y-2">
                          {selectedPlan.workout_days[selectedDayIndex].exercises.map((exercise, index) => (
                            <motion.li 
                              key={index} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="bg-quantum-darkBlue/20 p-2 rounded flex justify-between items-center"
                            >
                              <span>{exercise.exercise_name || exercise.name}</span>
                              <span className="text-sm text-gray-400">
                                {exercise.sets} × {exercise.reps} {exercise.weight ? `@ ${exercise.weight}kg` : ''}
                              </span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full mt-4 bg-quantum-cyan hover:bg-quantum-cyan/90"
                      onClick={handleStartWorkout}
                      disabled={!selectedPlan || selectedPlan.workout_days.length === 0}
                    >
                      <PlayCircle className="h-5 w-5 mr-2" /> Start This Workout
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="scheduled" className="space-y-4">
            {isLoading.schedules ? (
              <div className="py-8">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-quantum-cyan"></div>
                </div>
                <p className="text-center mt-4">Loading today's schedule...</p>
              </div>
            ) : todaysSchedules.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-400 py-8"
              >
                No workouts scheduled for today. Go to the Schedule tab to set up your weekly routines.
              </motion.p>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-quantum-cyan">Today's Workouts</h3>
                
                {todaysSchedules.map((schedule, idx) => {
                  const scheduledPlan = workoutPlans.find(plan => plan.id === schedule.workout_plan_id);
                  if (!scheduledPlan) return null;
                  
                  return (
                    <motion.div 
                      key={schedule.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-quantum-darkBlue/40 p-4 rounded-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div>
                          <h4 className="font-bold">{scheduledPlan.name}</h4>
                          {schedule.preferred_time && (
                            <p className="text-sm text-gray-300">
                              Scheduled for {schedule.preferred_time}
                            </p>
                          )}
                        </div>
                        
                        <Button 
                          className="bg-quantum-cyan hover:bg-quantum-cyan/90 w-full sm:w-auto" 
                          size="sm"
                          onClick={() => {
                            setSelectedPlanId(scheduledPlan.id);
                            setSelectedDayIndex(0);
                            handleStartWorkout();
                          }}
                        >
                          Start <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="quick" className="space-y-4">
            {isLoading.plans ? (
              <div className="py-8">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-quantum-cyan"></div>
                </div>
                <p className="text-center mt-4">Loading quick start options...</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-gray-300 mb-4">
                  Quick start a workout from your saved plans:
                </p>
                
                <div className="space-y-3">
                  {workoutPlans.length === 0 ? (
                    <p className="text-center text-gray-400">
                      No workout plans found. Create a plan first.
                    </p>
                  ) : (
                    workoutPlans.slice(0, 5).map((plan, idx) => (
                      <motion.div 
                        key={plan.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-quantum-darkBlue/40 p-3 rounded-md"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                          <div>
                            <h4 className="font-medium">{plan.name}</h4>
                            <p className="text-xs text-gray-400 capitalize">
                              {plan.difficulty} · {plan.goal} · {plan.workout_days.length} days
                            </p>
                          </div>
                          
                          <Button 
                            className="bg-quantum-cyan hover:bg-quantum-cyan/90 w-full sm:w-auto" 
                            size="sm"
                            onClick={() => {
                              setSelectedPlanId(plan.id);
                              setSelectedDayIndex(0);
                              handleStartWorkout();
                            }}
                          >
                            Start <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StartWorkout;

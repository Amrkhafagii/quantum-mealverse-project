
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { WorkoutPlan, WorkoutDay, Exercise } from '@/types/fitness';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Play, Check, Loader2 } from 'lucide-react';
import { format, isSameDay, startOfWeek, addDays, isAfter, isBefore, isToday } from 'date-fns';
import WorkoutExerciseLog from './WorkoutExerciseLog';
import { convertExerciseToWorkoutSet } from '@/utils/fitnessUtils';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface WorkoutSchedulerProps {
  userId?: string;
  plan: WorkoutPlan;
  onCompleteWorkout?: () => void;
  loading?: boolean;
}

const WorkoutScheduler = ({ userId, plan, onCompleteWorkout, loading = false }: WorkoutSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [showLog, setShowLog] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [animateWeekChange, setAnimateWeekChange] = useState<'left' | 'right' | null>(null);
  
  // Generate a repeating schedule based on plan frequency
  const getWorkoutDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayIndex = i % plan.frequency;
      days.push({
        date: day,
        dayIndex: dayIndex,
        workoutDay: plan.workout_days[dayIndex],
        isToday: isToday(day),
        isPast: isBefore(day, new Date()) && !isToday(day),
        isFuture: isAfter(day, new Date()),
      });
    }
    return days;
  };

  const workoutDays = getWorkoutDays();

  const previousWeek = () => {
    setAnimateWeekChange('left');
    setWeekStart(addDays(weekStart, -7));
    setTimeout(() => setAnimateWeekChange(null), 500);
  };

  const nextWeek = () => {
    setAnimateWeekChange('right');
    setWeekStart(addDays(weekStart, 7));
    setTimeout(() => setAnimateWeekChange(null), 500);
  };

  const startWorkout = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setShowLog(true);
  };

  const handleWorkoutComplete = () => {
    setShowLog(false);
    if (onCompleteWorkout) onCompleteWorkout();
  };

  if (loading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 flex justify-center items-center min-h-[300px]">
          <LoadingSpinner text="Loading workout schedule..." />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {!showLog ? (
        <>
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Workout Schedule</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={previousWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm whitespace-nowrap">
                    Week of {format(weekStart, 'MMM d, yyyy')}
                  </span>
                  <Button variant="outline" size="icon" onClick={nextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {plan.name} - {plan.frequency} days per week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="grid grid-cols-7 gap-2"
                initial={false}
                animate={
                  animateWeekChange === 'left' 
                    ? { x: ['-100%', '0%'] } 
                    : animateWeekChange === 'right' 
                      ? { x: ['100%', '0%'] } 
                      : {}
                }
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div key={index} className="text-center text-xs font-medium text-gray-400">
                    {day}
                  </div>
                ))}
                {workoutDays.map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-2 rounded-lg text-center cursor-pointer transition-colors ${
                      day.isToday
                        ? 'bg-quantum-purple/20 border border-quantum-purple'
                        : day.isPast
                        ? 'bg-quantum-black/40'
                        : 'bg-quantum-black/20'
                    }
                    ${day.workoutDay ? 'hover:bg-quantum-purple/10' : ''}`}
                    onClick={() => day.workoutDay && startWorkout(day.dayIndex)}
                  >
                    <div className="text-sm font-medium">{format(day.date, 'd')}</div>
                    {day.workoutDay && (
                      <div className="mt-1">
                        <Badge
                          className={`${
                            day.isToday
                              ? 'bg-quantum-purple'
                              : day.isPast
                              ? 'bg-gray-600'
                              : 'bg-quantum-cyan'
                          } text-xs`}
                        >
                          {day.workoutDay.day_name}
                        </Badge>
                      </div>
                    )}
                    {day.workoutDay && day.isToday && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        <Button
                          size="sm"
                          className="mt-2 bg-quantum-purple hover:bg-quantum-purple/90 text-xs h-7 w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            startWorkout(day.dayIndex);
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" /> Start
                        </Button>
                      </motion.div>
                    )}
                    {day.workoutDay && day.isPast && day.workoutDay.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-2 text-green-400 flex justify-center"
                      >
                        <Check className="h-4 w-4" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>

          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle>Monthly View</CardTitle>
              <CardDescription>Plan your workouts for the month</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="mx-auto bg-quantum-darkBlue/30 rounded-md p-4"
              />
            </CardContent>
          </Card>
        </>
      ) : (
        selectedDayIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Button
              variant="outline"
              onClick={() => setShowLog(false)}
              className="mb-4"
            >
              ← Back to Schedule
            </Button>
            <WorkoutExerciseLog
              userId={userId}
              workoutPlanId={plan.id}
              workoutDay={plan.workout_days[selectedDayIndex].day_name}
              exercises={plan.workout_days[selectedDayIndex].exercises}
              onLogComplete={handleWorkoutComplete}
            />
          </motion.div>
        )
      )}
    </div>
  );
};

export default WorkoutScheduler;

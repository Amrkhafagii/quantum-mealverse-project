
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkoutPlan, WorkoutDay } from '@/types/fitness';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Play, Check, Loader2 } from 'lucide-react';
import { format, isSameDay, startOfWeek, addDays, isAfter, isBefore, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import WorkoutExerciseLog from '../workout/WorkoutExerciseLog';

interface WorkoutSchedulerProps {
  userId?: string;
  plan: WorkoutPlan;
  onCompleteWorkout?: () => void;
  loading?: boolean;
}

const WorkoutScheduler: React.FC<WorkoutSchedulerProps> = ({ userId, plan, onCompleteWorkout, loading = false }) => {
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
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
          <span className="ml-2">Loading workout schedule...</span>
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
                        transition={{ delay: 0.5 }}
                        className="flex justify-center mt-2"
                      >
                        <Button variant="ghost" size="sm" className="text-xs p-1 h-6 bg-quantum-cyan/20">
                          <Play className="h-3 w-3 mr-1" /> Start
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>

          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle>Upcoming Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plan.workout_days.slice(0, 3).map((day, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-3 bg-quantum-black/20 rounded-lg border border-quantum-cyan/10 hover:border-quantum-cyan/30 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium">{day.day_name}</h4>
                      <p className="text-xs text-gray-400">{day.exercises.length} exercises</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-xs"
                      onClick={() => startWorkout(index)}
                    >
                      <Play className="h-3 w-3 mr-1" /> 
                      Start
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        selectedDayIndex !== null && (
          <WorkoutExerciseLog
            workoutPlanId={plan.id}
            workoutDay={plan.workout_days[selectedDayIndex].day_name}
            exercises={plan.workout_days[selectedDayIndex].exercises}
            onLogComplete={handleWorkoutComplete}
          />
        )
      )}
    </div>
  );
};

export default WorkoutScheduler;

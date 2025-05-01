
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutHistoryItem, UserWorkoutStats, WorkoutLog } from '@/types/fitness';
import { format, parseISO, isToday, subDays, differenceInDays, isSameDay, formatDistance } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Activity, Calendar as CalendarIcon, Clock, Dumbbell, Flame, Calendar as CalIcon, Trophy, TrendingUp } from 'lucide-react';
import { getWorkoutHistory, getWorkoutStats } from '@/services/workoutService';

interface WorkoutHistoryProps {
  userId?: string;
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ userId }) => {
  const { toast } = useToast();
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  const [workoutStats, setWorkoutStats] = useState<UserWorkoutStats | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('calendar');

  useEffect(() => {
    if (userId) {
      loadWorkoutHistory();
    }
  }, [userId, dateFilter]);

  const loadWorkoutHistory = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Try to load real data from database
      const { data: historyData, error } = await getWorkoutHistory(userId, dateFilter);
      
      if (error) throw error;
      
      // If we have history data, use it
      if (historyData && historyData.length > 0) {
        setWorkoutHistory(historyData);
        
        // Load stats
        const { data: statsData } = await getWorkoutStats(userId);
        if (statsData) {
          setWorkoutStats(statsData);
        }
      } else {
        // Fall back to mock data for now
        const mockHistory = generateMockWorkoutHistory(userId);
        const filteredHistory = filterWorkoutHistoryByDate(mockHistory, dateFilter);
        
        setWorkoutHistory(filteredHistory);
        
        // Calculate stats from filtered history
        const stats = calculateWorkoutStats(filteredHistory);
        setWorkoutStats(stats);
      }
    } catch (error) {
      console.error('Error loading workout history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your workout history.',
        variant: 'destructive',
      });
      
      // Fall back to mock data on error
      const mockHistory = generateMockWorkoutHistory(userId);
      const filteredHistory = filterWorkoutHistoryByDate(mockHistory, dateFilter);
      
      setWorkoutHistory(filteredHistory);
      
      // Calculate stats from filtered history
      const stats = calculateWorkoutStats(filteredHistory);
      setWorkoutStats(stats);
    } finally {
      setLoading(false);
    }
  };

  const generateMockWorkoutHistory = (userId: string): WorkoutHistoryItem[] => {
    const history: WorkoutHistoryItem[] = [];
    const today = new Date();
    
    // Generate some mock workout history for the past 30 days
    for (let i = 0; i < 30; i += 2) { // Every other day
      const date = subDays(today, i);
      
      const historyItem: WorkoutHistoryItem = {
        id: `history-${i}`,
        user_id: userId,
        date: date.toISOString(),
        workout_log_id: `log-${i}`,
        workout_plan_name: i % 6 === 0 ? 'Strength Training' : 
                          i % 6 === 2 ? 'Hypertrophy Focus' : 
                          i % 6 === 4 ? 'Endurance Building' : 'General Fitness',
        workout_day_name: i % 6 === 0 ? 'Push Day' : 
                         i % 6 === 2 ? 'Pull Day' : 
                         i % 6 === 4 ? 'Leg Day' : 
                         'Full Body',
        duration: 30 + Math.floor(Math.random() * 30), // 30-60 minutes
        exercises_completed: 3 + Math.floor(Math.random() * 3), // 3-5 exercises
        total_exercises: 5,
        calories_burned: 150 + Math.floor(Math.random() * 200), // 150-350 calories
        workout_log: createMockWorkoutLog(userId, `log-${i}`, date.toISOString())
      };
      
      history.push(historyItem);
    }
    
    // Add today's workout
    if (Math.random() > 0.5) { // 50% chance of having today's workout
      const todayHistory: WorkoutHistoryItem = {
        id: 'today-workout',
        user_id: userId,
        date: today.toISOString(),
        workout_log_id: 'today-log',
        workout_plan_name: 'Current Plan',
        workout_day_name: 'Push Day',
        duration: 45,
        exercises_completed: 5,
        total_exercises: 5,
        calories_burned: 300,
        workout_log: createMockWorkoutLog(userId, 'today-log', today.toISOString())
      };
      
      history.push(todayHistory);
    }
    
    return history.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const createMockWorkoutLog = (userId: string, logId: string, date: string): WorkoutLog => {
    return {
      id: logId,
      user_id: userId,
      workout_plan_id: 'plan-1',
      date: date,
      duration: 45,
      calories_burned: 300,
      notes: 'Felt great today!',
      completed_exercises: [
        {
          exercise_id: 'ex1',
          exercise_name: 'Bench Press',
          sets_completed: [
            { set_number: 1, weight: 135, reps: 10 },
            { set_number: 2, weight: 155, reps: 8 },
            { set_number: 3, weight: 165, reps: 6 }
          ]
        },
        {
          exercise_id: 'ex2',
          exercise_name: 'Shoulder Press',
          sets_completed: [
            { set_number: 1, weight: 95, reps: 10 },
            { set_number: 2, weight: 105, reps: 8 },
            { set_number: 3, weight: 115, reps: 6 }
          ]
        },
        {
          exercise_id: 'ex3',
          exercise_name: 'Tricep Pushdowns',
          sets_completed: [
            { set_number: 1, weight: 60, reps: 12 },
            { set_number: 2, weight: 70, reps: 10 },
            { set_number: 3, weight: 80, reps: 8 }
          ]
        },
        {
          exercise_id: 'ex4',
          exercise_name: 'Lateral Raises',
          sets_completed: [
            { set_number: 1, weight: 15, reps: 15 },
            { set_number: 2, weight: 17.5, reps: 12 },
            { set_number: 3, weight: 20, reps: 10 }
          ]
        },
        {
          exercise_id: 'ex5',
          exercise_name: 'Chest Flyes',
          sets_completed: [
            { set_number: 1, weight: 30, reps: 12 },
            { set_number: 2, weight: 35, reps: 10 },
            { set_number: 3, weight: 40, reps: 8 }
          ]
        }
      ]
    };
  };

  const filterWorkoutHistoryByDate = (history: WorkoutHistoryItem[], filter: string): WorkoutHistoryItem[] => {
    const today = new Date();
    
    switch (filter) {
      case 'week':
        const oneWeekAgo = subDays(today, 7);
        return history.filter(item => 
          new Date(item.date) >= oneWeekAgo && new Date(item.date) <= today
        );
        
      case 'month':
        const oneMonthAgo = subDays(today, 30);
        return history.filter(item => 
          new Date(item.date) >= oneMonthAgo && new Date(item.date) <= today
        );
        
      case 'today':
        return history.filter(item => 
          isToday(new Date(item.date))
        );
        
      default:
        return history;
    }
  };

  const calculateWorkoutStats = (history: WorkoutHistoryItem[]): UserWorkoutStats => {
    if (!history.length || !userId) {
      return {
        user_id: userId || '',
        totalWorkouts: 0,
        total_time: 0,
        total_calories: 0,
        favorite_exercise: 'None',
        strongest_exercise: {
          exercise_id: '',
          exercise_name: 'None',
          max_weight: 0
        },
        most_improved_exercise: {
          exercise_id: '',
          exercise_name: 'None',
          improvement_percentage: 0
        },
        currentStreak: 0,
        longestStreak: 0,
        weekly_goal_completion: 0
      };
    }
    
    // Count exercise frequency to find favorite
    const exerciseCounts: Record<string, number> = {};
    const exerciseMaxWeights: Record<string, number> = {};
    
    history.forEach(item => {
      item.workout_log?.completed_exercises.forEach(ex => {
        // Count frequency
        if (!exerciseCounts[ex.exercise_name]) {
          exerciseCounts[ex.exercise_name] = 0;
        }
        exerciseCounts[ex.exercise_name]++;
        
        // Find max weight
        ex.sets_completed.forEach(set => {
          if (set.weight && (!exerciseMaxWeights[ex.exercise_name] || set.weight > exerciseMaxWeights[ex.exercise_name])) {
            exerciseMaxWeights[ex.exercise_name] = set.weight;
          }
        });
      });
    });
    
    // Find favorite exercise
    let favoriteExercise = 'None';
    let maxCount = 0;
    Object.entries(exerciseCounts).forEach(([exercise, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteExercise = exercise;
      }
    });
    
    // Find strongest exercise
    let strongestExercise = {
      exercise_id: '',
      exercise_name: 'None',
      max_weight: 0
    };
    
    Object.entries(exerciseMaxWeights).forEach(([exercise, weight]) => {
      if (weight > strongestExercise.max_weight) {
        strongestExercise = {
          exercise_id: '', // Would need actual exercise ID in real implementation
          exercise_name: exercise,
          max_weight: weight
        };
      }
    });
    
    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const sortedDates = history
      .map(item => new Date(item.date))
      .sort((a, b) => b.getTime() - a.getTime()); // Most recent first
    
    const today = new Date();
    
    // Check if most recent workout was today or yesterday to maintain streak
    if (sortedDates.length && 
        (isToday(sortedDates[0]) || differenceInDays(today, sortedDates[0]) === 1)) {
      currentStreak = 1;
      tempStreak = 1;
      
      // Check consecutive days
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const currentDate = sortedDates[i];
        const nextDate = sortedDates[i + 1];
        
        if (differenceInDays(currentDate, nextDate) === 1) {
          tempStreak++;
          currentStreak = tempStreak;
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
        }
      }
    } else {
      currentStreak = 0;
    }
    
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    
    // Calculate total workouts, time, and calories
    const totalWorkouts = history.length;
    const totalTime = history.reduce((sum, item) => sum + item.duration, 0);
    const totalCalories = history.reduce((sum, item) => sum + (item.calories_burned || 0), 0);
    
    // Calculate weekly goal completion (assuming goal is 3 workouts per week)
    const weeklyGoal = 3;
    const thisWeekWorkouts = history.filter(item => {
      const itemDate = new Date(item.date);
      const startOfWeek = subDays(today, today.getDay());
      return itemDate >= startOfWeek && itemDate <= today;
    }).length;
    
    const weeklyGoalCompletion = Math.min(100, (thisWeekWorkouts / weeklyGoal) * 100);
    
    return {
      user_id: userId,
      totalWorkouts,
      total_time: totalTime,
      total_calories: totalCalories,
      favorite_exercise: favoriteExercise,
      strongest_exercise: strongestExercise,
      most_improved_exercise: {
        exercise_id: '',
        exercise_name: 'Bench Press', // Mock data
        improvement_percentage: 15 // Mock data
      },
      currentStreak,
      longestStreak,
      weekly_goal_completion: weeklyGoalCompletion
    };
  };

  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    
    setSelectedDate(day);
    
    // Find workouts for the selected date
    const workoutsForDay = workoutHistory.filter(
      workout => isSameDay(parseISO(workout.date), day)
    );
    
    if (workoutsForDay.length > 0) {
      setSelectedWorkout(workoutsForDay[0].workout_log || null);
    } else {
      setSelectedWorkout(null);
    }
  };

  const renderWorkoutDayIndicator = (date: Date) => {
    const hasWorkout = workoutHistory.some(workout => 
      isSameDay(parseISO(workout.date), date)
    );
    
    return hasWorkout ? (
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-quantum-purple rounded-full" />
    ) : null;
  };

  const getWorkoutActivityData = () => {
    // Group workouts by day of week
    const dayOfWeekData = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    
    workoutHistory.forEach(workout => {
      const date = parseISO(workout.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      dayOfWeekData[dayOfWeek]++;
    });
    
    return [
      { name: 'Sun', workouts: dayOfWeekData[0] },
      { name: 'Mon', workouts: dayOfWeekData[1] },
      { name: 'Tue', workouts: dayOfWeekData[2] },
      { name: 'Wed', workouts: dayOfWeekData[3] },
      { name: 'Thu', workouts: dayOfWeekData[4] },
      { name: 'Fri', workouts: dayOfWeekData[5] },
      { name: 'Sat', workouts: dayOfWeekData[6] }
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-semibold text-quantum-cyan">Workout History</h2>
        
        <div className="flex items-center gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[160px] bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent className="bg-quantum-darkBlue border-quantum-cyan/20">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {workoutStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Total Workouts</p>
                <Activity className="h-5 w-5 text-quantum-cyan" />
              </div>
              <p className="text-3xl font-bold mt-2">{workoutStats.totalWorkouts}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Current Streak</p>
                <Trophy className="h-5 w-5 text-quantum-purple" />
              </div>
              <p className="text-3xl font-bold mt-2">{workoutStats.currentStreak} {workoutStats.currentStreak === 1 ? 'day' : 'days'}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Total Time</p>
                <Clock className="h-5 w-5 text-quantum-cyan" />
              </div>
              <p className="text-3xl font-bold mt-2">{workoutStats.total_time} mins</p>
            </CardContent>
          </Card>
          
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Calories Burned</p>
                <Flame className="h-5 w-5 text-quantum-purple" />
              </div>
              <p className="text-3xl font-bold mt-2">{workoutStats.total_calories}</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Activity className="h-4 w-4" /> Activity
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Stats
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader>
                <CardTitle>Workout Calendar</CardTitle>
                <CardDescription>View your workout history by date</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDayClick}
                  className="mx-auto bg-quantum-darkBlue/30 rounded-md p-4"
                  components={{
                    DayContent: (props) => (
                      <div className="relative">
                        {props.date.getDate()}
                        {renderWorkoutDayIndicator(props.date)}
                      </div>
                    )
                  }}
                />
              </CardContent>
            </Card>
            
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader>
                <CardTitle>
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a Date'}
                </CardTitle>
                <CardDescription>
                  {selectedWorkout ? 'Workout details' : 'No workout found for this date'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedWorkout ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{workoutHistory.find(w => w.workout_log_id === selectedWorkout.id)?.workout_plan_name}</p>
                      <Badge variant="outline" className="text-quantum-purple border-quantum-purple">
                        {workoutHistory.find(w => w.workout_log_id === selectedWorkout.id)?.workout_day_name}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{selectedWorkout.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-gray-400" />
                        <span>{selectedWorkout.calories_burned} calories</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <p className="font-medium">Exercises Completed</p>
                      {selectedWorkout.completed_exercises.map((exercise, i) => (
                        <div key={i} className="border-b border-gray-700 pb-2 last:border-0">
                          <p className="font-medium">{exercise.exercise_name}</p>
                          <div className="grid grid-cols-3 text-xs text-gray-400 mt-1">
                            <span>Set</span>
                            <span>Weight</span>
                            <span>Reps</span>
                          </div>
                          {exercise.sets_completed.map((set, j) => (
                            <div key={j} className="grid grid-cols-3 text-sm mt-0.5">
                              <span>{set.set_number}</span>
                              <span>{set.weight} kg</span>
                              <span>{set.reps}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    
                    {selectedWorkout.notes && (
                      <div className="mt-4">
                        <p className="font-medium">Notes</p>
                        <p className="text-sm text-gray-300">{selectedWorkout.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Dumbbell className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                    <p className="text-gray-400">No workout recorded for this day</p>
                    <Button 
                      className="mt-4 bg-quantum-purple hover:bg-quantum-purple/90"
                    >
                      Add Workout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="mt-6">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle>Workout Activity</CardTitle>
              <CardDescription>Your recent workout history</CardDescription>
            </CardHeader>
            <CardContent>
              {workoutHistory.length > 0 ? (
                <div className="space-y-4">
                  {workoutHistory.slice(0, 10).map((workout, index) => {
                    const workoutDate = parseISO(workout.date);
                    return (
                      <div 
                        key={index}
                        className="p-4 rounded-lg bg-quantum-black/50 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-quantum-black hover:border-quantum-cyan/20 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedDate(workoutDate);
                          setSelectedWorkout(workout.workout_log || null);
                          setActiveTab('calendar');
                        }}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-quantum-purple/20 flex items-center justify-center">
                            {isToday(workoutDate) ? (
                              <CalendarIcon className="h-5 w-5 text-quantum-purple" />
                            ) : (
                              <Dumbbell className="h-5 w-5 text-quantum-purple" />
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{workout.workout_plan_name}</p>
                              <Badge variant="outline" className="text-quantum-purple border-quantum-purple">
                                {workout.workout_day_name}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">
                              {isToday(workoutDate) 
                                ? 'Today' 
                                : formatDistance(workoutDate, new Date(), { addSuffix: true })}
                              {' - '}{workout.exercises_completed} exercises
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{workout.duration} mins</span>
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              <Flame className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{workout.calories_burned} cal</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-xl font-medium mb-2">No workout history</p>
                  <p className="text-gray-400 mb-4">You haven't logged any workouts yet.</p>
                  <Button className="bg-quantum-purple hover:bg-quantum-purple/90">
                    Start a Workout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly activity chart */}
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Your workout frequency by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getWorkoutActivityData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" tick={{ fill: '#ccc' }} />
                      <YAxis tick={{ fill: '#ccc' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                      <Legend />
                      <Bar dataKey="workouts" fill="#8b5cf6" name="Workouts" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Your stats */}
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
                <CardDescription>Workout stats and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {workoutStats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-quantum-black/50">
                        <p className="text-sm text-gray-400">Favorite Exercise</p>
                        <p className="font-medium">{workoutStats.favorite_exercise}</p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-quantum-black/50">
                        <p className="text-sm text-gray-400">Strongest At</p>
                        <p className="font-medium">{workoutStats.strongest_exercise.exercise_name}</p>
                        <p className="text-sm">{workoutStats.strongest_exercise.max_weight} kg</p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-quantum-black/50">
                        <p className="text-sm text-gray-400">Most Improved</p>
                        <p className="font-medium">{workoutStats.most_improved_exercise.exercise_name}</p>
                        <p className="text-sm text-green-400">+{workoutStats.most_improved_exercise.improvement_percentage}%</p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-quantum-black/50">
                        <p className="text-sm text-gray-400">Longest Streak</p>
                        <p className="font-medium">{workoutStats.longestStreak} days</p>
                      </div>
                    </div>
                    
                    {/* Weekly goal progress bar */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">Weekly Goal Progress</p>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-quantum-purple rounded-full"
                          style={{ width: `${workoutStats.weekly_goal_completion}%` }}
                        ></div>
                      </div>
                      <p className="text-sm mt-1">
                        {Math.round(workoutStats.weekly_goal_completion)}% of weekly goal
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400">No workout data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutHistory;

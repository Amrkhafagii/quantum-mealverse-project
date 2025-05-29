
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WorkoutPlanCard } from './WorkoutPlanCard';
import { WorkoutStatsCard } from './WorkoutStatsCard';
import { QuickStartWorkout } from './QuickStartWorkout';
import { WorkoutCalendarView } from './WorkoutCalendarView';
import { Play, Calendar, TrendingUp, Target, Clock, Flame } from 'lucide-react';

export const WorkoutLayout: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const {
    workoutPlans,
    schedules,
    workoutStats,
    history,
    isLoading,
    fetchWorkoutPlans,
    fetchWorkoutSchedules,
    fetchWorkoutStats,
    fetchWorkoutHistory,
    logWorkout
  } = useWorkoutData();

  useEffect(() => {
    if (user?.id) {
      fetchWorkoutPlans(user.id);
      fetchWorkoutSchedules(user.id);
      fetchWorkoutStats(user.id);
      fetchWorkoutHistory(user.id);
    }
  }, [user?.id]);

  const handleStartWorkout = async (planId: string) => {
    const plan = workoutPlans.find(p => p.id === planId);
    if (!plan) {
      toast({
        title: "Error",
        description: "Workout plan not found",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Starting Workout",
      description: `Starting ${plan.name} workout session`,
    });
  };

  const handleEditPlan = (planId: string) => {
    toast({
      title: "Edit Plan",
      description: "Workout plan editing is coming soon!",
    });
  };

  const handleDateSelect = (date: Date) => {
    toast({
      title: "Date Selected",
      description: `Selected date: ${date.toLocaleDateString()}`,
    });
  };

  const handleWorkoutSelect = (workoutId: string) => {
    toast({
      title: "Workout Selected",
      description: "Opening workout details...",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quantum-cyan mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your workout data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-dark text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-quantum-cyan mb-2">Workout Management</h1>
          <p className="text-gray-400">Track your fitness journey and manage your workout plans</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-quantum-darkBlue/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">My Plans</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <WorkoutStatsCard
                title="Total Workouts"
                value={workoutStats.total_workouts || 0}
                subtitle="completed sessions"
                icon={<Target className="h-5 w-5 text-quantum-cyan" />}
              />
              <WorkoutStatsCard
                title="This Week"
                value={history.filter(h => {
                  const workoutDate = new Date(h.date);
                  const now = new Date();
                  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  return workoutDate >= weekAgo;
                }).length}
                subtitle="workouts completed"
                icon={<Play className="h-5 w-5 text-green-500" />}
                trend={`${Math.round((history.filter(h => {
                  const workoutDate = new Date(h.date);
                  const now = new Date();
                  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  return workoutDate >= weekAgo;
                }).length / (workoutStats.total_workouts || 1)) * 100)}% of total`}
              />
              <WorkoutStatsCard
                title="Current Streak"
                value={workoutStats.streak || 0}
                subtitle="consecutive days"
                icon={<Flame className="h-5 w-5 text-orange-500" />}
                trend={`Most active: ${workoutStats.most_active_day || 'N/A'}`}
              />
              <WorkoutStatsCard
                title="Total Time"
                value={history.reduce((total, workout) => total + workout.duration, 0)}
                subtitle="minutes exercised"
                icon={<Clock className="h-5 w-5 text-blue-500" />}
              />
            </div>

            {/* Quick Start Section */}
            <QuickStartWorkout onStartWorkout={handleStartWorkout} />

            {/* Recent Activity */}
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader>
                <CardTitle className="text-quantum-cyan flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.slice(0, 5).map((workout) => (
                      <div key={workout.id} className="flex items-center justify-between p-3 border border-quantum-cyan/20 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">{workout.workout_plan_name}</h4>
                          <p className="text-sm text-gray-400">
                            {workout.exercises_completed}/{workout.total_exercises} exercises • {workout.duration} min
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-quantum-cyan">{new Date(workout.date).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-400">{workout.calories_burned || 0} cal</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No workout history yet. Start your first workout!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">My Workout Plans</h2>
              <Button className="bg-quantum-cyan hover:bg-quantum-cyan/80">
                Create New Plan
              </Button>
            </div>

            {workoutPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workoutPlans.map((plan) => (
                  <WorkoutPlanCard
                    key={plan.id}
                    plan={plan}
                    onStart={() => handleStartWorkout(plan.id)}
                    onEdit={() => handleEditPlan(plan.id)}
                    detailed={true}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Workout Plans Yet</h3>
                  <p className="text-gray-400 mb-6">Create your first workout plan to get started with your fitness journey.</p>
                  <Button className="bg-quantum-cyan hover:bg-quantum-cyan/80">
                    Create Your First Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Workout Schedule</h2>
              <Button className="bg-quantum-cyan hover:bg-quantum-cyan/80">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Workout
              </Button>
            </div>

            <WorkoutCalendarView
              workoutPlans={workoutPlans}
              onDateSelect={handleDateSelect}
              onWorkoutSelect={handleWorkoutSelect}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Progress Tracking</h2>
            </div>

            {/* Progress Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                <CardHeader>
                  <CardTitle className="text-quantum-cyan">Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Progress charts coming soon!</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Workouts this week: {history.filter(h => {
                        const workoutDate = new Date(h.date);
                        const now = new Date();
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return workoutDate >= weekAgo;
                      }).length}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                <CardHeader>
                  <CardTitle className="text-quantum-cyan">Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Achievement system coming soon!</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Current streak: {workoutStats.streak || 0} days
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

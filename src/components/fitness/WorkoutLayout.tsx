
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { Plus, Play, Calendar, TrendingUp, Target, Clock, Dumbbell } from "lucide-react";
import { WorkoutPlanCard } from "./WorkoutPlanCard";
import { ActiveWorkoutCard } from "./ActiveWorkoutCard";
import { WorkoutStatsCard } from "./WorkoutStatsCard";
import { QuickStartWorkout } from "./QuickStartWorkout";
import { WorkoutCalendarView } from "./WorkoutCalendarView";

const WorkoutLayout: React.FC = () => {
  const { user } = useAuth();
  const { workoutPlans, workoutStats, isLoading, activeWorkout } = useWorkoutData();
  const [selectedTab, setSelectedTab] = useState("overview");

  if (!user) {
    return (
      <div className="py-8 space-y-8">
        <h1 className="text-3xl font-bold text-quantum-cyan">Workout Manager</h1>
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="pt-6">
            <p className="text-center text-gray-400">Please log in to access your workout management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-quantum-cyan">Workout Manager</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-quantum-cyan/20 hover:bg-quantum-cyan/10"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button className="bg-quantum-cyan hover:bg-quantum-cyan/80">
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="bg-quantum-darkBlue/50 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            My Plans
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Active Workout Section */}
          {activeWorkout && (
            <ActiveWorkoutCard 
              workout={activeWorkout}
              onContinue={() => console.log('Continue workout')}
              onComplete={() => console.log('Complete workout')}
            />
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <WorkoutStatsCard
              title="This Week"
              value={workoutStats?.weeklyWorkouts || 0}
              subtitle="workouts"
              icon={<Dumbbell className="h-5 w-5 text-quantum-cyan" />}
              trend={"+2 from last week"}
            />
            <WorkoutStatsCard
              title="Total Time"
              value={`${Math.floor((workoutStats?.totalMinutes || 0) / 60)}h ${(workoutStats?.totalMinutes || 0) % 60}m`}
              subtitle="this month"
              icon={<Clock className="h-5 w-5 text-green-500" />}
              trend={"+15% from last month"}
            />
            <WorkoutStatsCard
              title="Current Streak"
              value={workoutStats?.currentStreak || 0}
              subtitle="days"
              icon={<Target className="h-5 w-5 text-orange-500" />}
              trend={`Best: ${workoutStats?.longestStreak || 0} days`}
            />
            <WorkoutStatsCard
              title="Calories Burned"
              value={workoutStats?.totalCalories || 0}
              subtitle="this week"
              icon={<TrendingUp className="h-5 w-5 text-red-500" />}
              trend="+12% from last week"
            />
          </div>

          {/* Quick Start Workout */}
          <QuickStartWorkout onStartWorkout={(planId) => console.log('Start workout:', planId)} />

          {/* Recent Plans */}
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="text-quantum-cyan">Recent Workout Plans</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
                </div>
              ) : workoutPlans && workoutPlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workoutPlans.slice(0, 4).map((plan) => (
                    <WorkoutPlanCard
                      key={plan.id}
                      plan={plan}
                      onStart={() => console.log('Start plan:', plan.id)}
                      onEdit={() => console.log('Edit plan:', plan.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No workout plans yet. Create your first plan to get started!</p>
                  <Button className="bg-quantum-cyan hover:bg-quantum-cyan/80">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">My Workout Plans</h2>
            <Button className="bg-quantum-cyan hover:bg-quantum-cyan/80">
              <Plus className="h-4 w-4 mr-2" />
              Create New Plan
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
            </div>
          ) : workoutPlans && workoutPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workoutPlans.map((plan) => (
                <WorkoutPlanCard
                  key={plan.id}
                  plan={plan}
                  onStart={() => console.log('Start plan:', plan.id)}
                  onEdit={() => console.log('Edit plan:', plan.id)}
                  detailed
                />
              ))}
            </div>
          ) : (
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Dumbbell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Workout Plans</h3>
                  <p className="text-gray-400 mb-6">Start your fitness journey by creating your first workout plan.</p>
                  <Button className="bg-quantum-cyan hover:bg-quantum-cyan/80">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <WorkoutCalendarView 
            workoutPlans={workoutPlans || []}
            onDateSelect={(date) => console.log('Selected date:', date)}
            onWorkoutSelect={(workoutId) => console.log('Selected workout:', workoutId)}
          />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader>
                <CardTitle className="text-quantum-cyan">Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Workouts This Week</span>
                      <span className="text-sm text-white">{workoutStats?.weeklyWorkouts || 0}/5</span>
                    </div>
                    <Progress value={((workoutStats?.weeklyWorkouts || 0) / 5) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Weekly Goal</span>
                      <span className="text-sm text-white">80%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader>
                <CardTitle className="text-quantum-cyan">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                      🏆 7-Day Streak
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      💪 First Workout
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-blue-500 text-blue-500">
                      🎯 Goal Crusher
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutLayout;

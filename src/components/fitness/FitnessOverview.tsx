
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Target, TrendingUp, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import FitnessAnalyticsDashboard from './stats/FitnessAnalyticsDashboard';
import ProgressAnalytics from './stats/ProgressAnalytics';
import UserProgressJourney from './UserProgressJourney';
import { WorkoutGoalsManager } from './analytics/WorkoutGoalsManager';
import { ProgressCharts } from './analytics/ProgressCharts';
import { EnhancedWorkoutHistory } from './analytics/EnhancedWorkoutHistory';
import { SmartRecommendations } from './recommendations/SmartRecommendations';
import { AdaptiveDifficulty } from './recommendations/AdaptiveDifficulty';
import { WorkoutVariations } from './recommendations/WorkoutVariations';

interface FitnessOverviewProps {
  userId?: string;
  workoutStats: any;
}

export const FitnessOverview: React.FC<FitnessOverviewProps> = ({ userId, workoutStats }) => {
  const { user } = useAuth();
  const { history, isLoading: workoutLoading, fetchWorkoutHistory } = useWorkoutData();
  const [activeUserId] = useState(userId || user?.id);

  useEffect(() => {
    if (activeUserId) {
      fetchWorkoutHistory(activeUserId);
    }
  }, [activeUserId]);

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-quantum-cyan" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Total Workouts</p>
                  <p className="text-2xl font-bold">{workoutStats?.total_workouts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Current Streak</p>
                  <p className="text-2xl font-bold">{workoutStats?.streak || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Most Active Day</p>
                  <p className="text-lg font-bold">{workoutStats?.most_active_day || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">This Week</p>
                  <p className="text-2xl font-bold">
                    {history.filter(h => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(h.date) >= weekAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-quantum-darkBlue/50 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="progress">Progress Charts</TabsTrigger>
          <TabsTrigger value="history">Workout History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FitnessAnalyticsDashboard userId={activeUserId} />
            <UserProgressJourney
              userId={activeUserId}
              achievements={[]}
              userAchievements={[]}
              points={workoutStats?.total_workouts * 10 || 0}
            />
          </div>
          <ProgressAnalytics userId={activeUserId} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <SmartRecommendations />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdaptiveDifficulty />
            <div className="space-y-6">
              <WorkoutVariations />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <WorkoutGoalsManager />
        </TabsContent>

        <TabsContent value="progress">
          <ProgressCharts />
        </TabsContent>

        <TabsContent value="history">
          <EnhancedWorkoutHistory 
            workoutHistory={history} 
            isLoading={workoutLoading}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <FitnessAnalyticsDashboard userId={activeUserId} />
            <ProgressAnalytics userId={activeUserId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

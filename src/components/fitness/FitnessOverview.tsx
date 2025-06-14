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
import SmartRecommendations from './recommendations/SmartRecommendations';
import AdaptiveDifficulty from './recommendations/AdaptiveDifficulty';
import WorkoutVariations from './recommendations/WorkoutVariations';
import CrossPlatformTester from './CrossPlatformTester';

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
    <div className="space-y-4 sm:space-y-6">
      {/* Quick Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center">
                <Activity className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-quantum-cyan flex-shrink-0" />
                <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-400 truncate">Total Workouts</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    {workoutStats?.total_workouts || 0}
                  </p>
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
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center">
                <Target className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-400 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-400 truncate">Current Streak</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    {workoutStats?.streak || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-2 sm:col-span-1"
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-yellow-400 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-400 truncate">Most Active Day</p>
                  <p className="text-sm sm:text-base md:text-lg font-bold text-white truncate">
                    {workoutStats?.most_active_day || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-2 sm:col-span-1"
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center">
                <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-purple-400 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-400 truncate">This Week</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
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
        <TabsList className="bg-quantum-darkBlue/50 mb-4 sm:mb-6 w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap">Overview</TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs sm:text-sm whitespace-nowrap">Smart Recommendations</TabsTrigger>
          <TabsTrigger value="goals" className="text-xs sm:text-sm whitespace-nowrap">Goals</TabsTrigger>
          <TabsTrigger value="progress" className="text-xs sm:text-sm whitespace-nowrap">Progress Charts</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm whitespace-nowrap">Workout History</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm whitespace-nowrap">Analytics</TabsTrigger>
          {process.env.NODE_ENV === 'development' && (
            <TabsTrigger value="testing" className="text-xs sm:text-sm whitespace-nowrap">Testing</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

        <TabsContent value="recommendations" className="space-y-4 sm:space-y-6">
          <SmartRecommendations />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <AdaptiveDifficulty />
            <div className="space-y-4 sm:space-y-6">
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
          <div className="space-y-4 sm:space-y-6">
            <FitnessAnalyticsDashboard userId={activeUserId} />
            <ProgressAnalytics userId={activeUserId} />
          </div>
        </TabsContent>

        {process.env.NODE_ENV === 'development' && (
          <TabsContent value="testing">
            <CrossPlatformTester />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

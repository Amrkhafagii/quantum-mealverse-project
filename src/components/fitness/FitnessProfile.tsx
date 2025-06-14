import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import type { UserProfile, UserMeasurement } from '@/types/fitness'; // <-- ADD THIS
import { CalendarDays, Dumbbell, Trophy, Activity, Target, Check, ArrowUp, TrendingUp } from 'lucide-react';
import type { UserWorkoutStats } from "@/types/fitness";

interface EnhancedFitnessProfileProps {
  userId?: string;
  userProfile?: UserProfile;
  latestMeasurement?: UserMeasurement;
  workoutStats?: UserWorkoutStats;
}

const EnhancedFitnessProfile = ({ userId, userProfile, latestMeasurement, workoutStats }: EnhancedFitnessProfileProps) => {
  const hasProfile = !!userProfile;
  const hasMeasurement = !!latestMeasurement;
  const hasWorkoutStats = !!workoutStats;

  const weightProgress = hasMeasurement && userProfile?.goal_weight
    ? Math.min(100, Math.max(0, 100 - ((latestMeasurement.weight || 0) - (userProfile.goal_weight || 0)) / ((userProfile.weight || 0) - (userProfile.goal_weight || 0)) * 100))
    : 0;

  // Get the primary fitness goal from array if available, fallback to single goal
  const primaryFitnessGoal = userProfile?.fitness_goals && userProfile.fitness_goals.length > 0
    ? userProfile.fitness_goals[0]
    : userProfile?.fitness_goal || "Weight Loss";

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardContent className="p-6">
        <div className="profile-header">
          <Avatar className="h-20 w-20">
            <AvatarImage src={`https://avatar.vercel.sh/${userId}.png`} alt={userProfile?.display_name || "User Avatar"} />
            <AvatarFallback>{(userProfile?.display_name || "UN").substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="profile-info">
            <h2 className="text-2xl font-semibold">{userProfile?.display_name || "User"}</h2>
            <p className="text-gray-400">
              {userProfile?.fitness_level || "Beginner"} | {primaryFitnessGoal}
            </p>
          </div>
        </div>
        
        <div className="progress-section">
          <div className="progress-header">
            <h4 className="text-lg font-medium">Weight Goal</h4>
            <span className="text-sm text-gray-400">
              {latestMeasurement?.weight || userProfile?.weight || 0} kg / {userProfile?.goal_weight || 0} kg
            </span>
          </div>
          <Progress value={weightProgress} />
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <CalendarDays className="h-5 w-5 text-blue-400" />
            </div>
            <div className="stat-content">
              <div className="stat-title">Streak</div>
              <div className="stat-value">{workoutStats?.streak || workoutStats?.streak_days || 0} days</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Dumbbell className="h-5 w-5 text-green-400" />
            </div>
            <div className="stat-content">
              <div className="stat-title">Workouts</div>
              <div className="stat-value">{workoutStats?.total_workouts || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Trophy className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="stat-content">
              <div className="stat-title">Achievements</div>
              <div className="stat-value">42</div>
            </div>
          </div>
        </div>
        
        <div className="insights-section">
          <h4 className="text-lg font-medium mb-2">Key Insights</h4>
          <div className="insight-item">
            <Activity className="h-4 w-4 text-purple-400 mr-2" />
            <span>Most Active: {workoutStats?.most_active_day || "N/A"}</span>
          </div>
          <div className="insight-item">
            <Target className="h-4 w-4 text-orange-400 mr-2" />
            <span>Goal: {primaryFitnessGoal}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedFitnessProfile;

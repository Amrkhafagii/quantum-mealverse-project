import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Award, Medal, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Achievement, UserAchievement } from '@/types/fitness/achievements';

interface UserProgressJourneyProps {
  userId?: string;
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  points: number;
}

const UserProgressJourney: React.FC<UserProgressJourneyProps> = ({ 
  userId, 
  achievements, 
  userAchievements,
  points
}) => {
  // Define journey milestones based on achievements
  const journeyMilestones = [
    { points: 0, title: "Beginner", icon: <Star className="h-6 w-6 text-gray-400" /> },
    { points: 50, title: "Enthusiast", icon: <Award className="h-6 w-6 text-amber-600" /> },
    { points: 150, title: "Athlete", icon: <Medal className="h-6 w-6 text-slate-300" /> },
    { points: 300, title: "Pro", icon: <Trophy className="h-6 w-6 text-yellow-400" /> },
    { points: 600, title: "Champion", icon: <Crown className="h-6 w-6 text-quantum-purple" /> }
  ];
  
  // Find current milestone
  const currentMilestone = journeyMilestones.reduce((prev, current) => {
    return (points >= current.points) ? current : prev;
  }, journeyMilestones[0]);
  
  // Find next milestone
  const nextMilestoneIndex = journeyMilestones.findIndex(m => m.points > points);
  const nextMilestone = nextMilestoneIndex !== -1 ? 
    journeyMilestones[nextMilestoneIndex] : 
    journeyMilestones[journeyMilestones.length - 1];
  
  // Calculate progress percentage to next milestone
  const currentMilestoneIndex = journeyMilestones.findIndex(m => m === currentMilestone);
  const currentPoints = currentMilestone.points;
  const pointsToNext = nextMilestone.points - currentPoints;
  const progressToNext = pointsToNext > 0 ? 
    Math.min(100, ((points - currentPoints) / pointsToNext) * 100) : 
    100;
  
  // If user is at max level
  const isMaxLevel = currentMilestone === journeyMilestones[journeyMilestones.length - 1];
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Fitness Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              {currentMilestone.icon}
              <span className="font-semibold text-lg">{currentMilestone.title}</span>
            </div>
            <div className="text-sm text-gray-400">
              {points} points {isMaxLevel ? '(Max Level)' : ''}
            </div>
          </div>
          
          {!isMaxLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{currentMilestone.points} pts</span>
                <span>{nextMilestone.points} pts</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-quantum-cyan to-quantum-purple h-2.5 rounded-full" 
                />
              </div>
              <div className="text-xs text-gray-400 text-center mt-1">
                <span>{nextMilestone.title} Level: </span>
                <span>{Math.round(progressToNext)}% complete</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-md font-medium">Recent Achievements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userAchievements.slice(0, 4).map((userAch) => {
              const achievement = achievements.find(a => a.id === userAch.achievement_id);
              if (!achievement) return null;
              
              return (
                <motion.div
                  key={userAch.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-quantum-black/40 p-3 rounded-md flex items-center gap-3"
                >
                  <Award className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{achievement.name}</p>
                    <p className="text-xs text-gray-400">{achievement.points} pts</p>
                  </div>
                </motion.div>
              );
            })}
            
            {userAchievements.length === 0 && (
              <p className="text-sm text-gray-400 col-span-2 text-center py-4">
                Complete workouts and reach goals to earn achievements!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProgressJourney;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Target, Award, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AchievementService } from '@/services/fitness/achievementService';
import { motion, AnimatePresence } from 'framer-motion';

interface AchievementWithProgress {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  dateEarned?: string;
}

export const EnhancedAchievements: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadAchievements();
      checkForNewAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const progressData = await AchievementService.getAchievementProgress(user!.id);
      
      // Create mock achievements for demo
      const mockAchievements: AchievementWithProgress[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'First Steps',
          description: 'Complete your first workout',
          icon: 'trophy',
          points: 100,
          currentProgress: 1,
          targetProgress: 1,
          isCompleted: true,
          dateEarned: new Date().toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Week Warrior',
          description: 'Maintain a 7-day workout streak',
          icon: 'star',
          points: 250,
          currentProgress: 4,
          targetProgress: 7,
          isCompleted: false
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          name: 'Consistency King',
          description: 'Complete 30 workouts',
          icon: 'target',
          points: 500,
          currentProgress: 12,
          targetProgress: 30,
          isCompleted: false
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          name: 'Strength Builder',
          description: 'Increase weight on any exercise by 25%',
          icon: 'award',
          points: 300,
          currentProgress: 15,
          targetProgress: 25,
          isCompleted: false
        }
      ];

      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewAchievements = async () => {
    try {
      const newlyAwarded = await AchievementService.checkAndAwardAchievements(user!.id);
      if (newlyAwarded.length > 0) {
        setNewAchievements(newlyAwarded);
        
        newlyAwarded.forEach((achievement) => {
          toast({
            title: "🎉 Achievement Unlocked!",
            description: `You've earned: ${achievement.achievement?.name || 'New Achievement'}`,
          });
        });

        // Update achievements list
        await loadAchievements();
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case 'trophy': return Trophy;
      case 'star': return Star;
      case 'target': return Target;
      case 'award': return Award;
      default: return Trophy;
    }
  };

  const getProgressColor = (progress: number, target: number) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-quantum-cyan">Achievements</h2>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span className="text-sm text-gray-400">
            {achievements.filter(a => a.isCompleted).length}/{achievements.length} earned
          </span>
        </div>
      </div>

      {/* Achievement Notifications */}
      <AnimatePresence>
        {newAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400/50 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-400">Achievement Unlocked!</h3>
                <p className="text-sm">{achievement.achievement?.name}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((achievement) => {
          const IconComponent = getIconComponent(achievement.icon);
          const progressPercentage = (achievement.currentProgress / achievement.targetProgress) * 100;
          
          return (
            <Card 
              key={achievement.id} 
              className={`holographic-card transition-all ${
                achievement.isCompleted 
                  ? 'ring-2 ring-yellow-400/50 bg-gradient-to-br from-yellow-400/10 to-orange-400/10' 
                  : 'bg-quantum-darkBlue/30'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.isCompleted 
                        ? 'bg-yellow-400/20 text-yellow-400' 
                        : 'bg-quantum-cyan/20 text-quantum-cyan'
                    }`}>
                      {achievement.isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <IconComponent className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{achievement.name}</CardTitle>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={`${
                        achievement.isCompleted 
                          ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50' 
                          : 'bg-quantum-cyan/20 text-quantum-cyan border-quantum-cyan/50'
                      }`}
                    >
                      {achievement.points} pts
                    </Badge>
                    {achievement.dateEarned && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {new Date(achievement.dateEarned).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {!achievement.isCompleted && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="font-medium">
                        {achievement.currentProgress} / {achievement.targetProgress}
                      </span>
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500 text-center">
                      {Math.round(progressPercentage)}% complete
                    </p>
                  </div>
                )}
                
                {achievement.isCompleted && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Completed
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <Button 
          onClick={checkForNewAchievements}
          variant="outline"
          className="bg-quantum-darkBlue/30 border-quantum-cyan/30"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Check for New Achievements
        </Button>
      </div>
    </div>
  );
};

export default EnhancedAchievements;

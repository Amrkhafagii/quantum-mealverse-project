import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Achievement, UserAchievement } from '@/types/fitness';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface UserAchievementsProps {
  userId?: string;
  achievements?: Achievement[];
  userAchievements?: UserAchievement[];
}

export const UserAchievements: React.FC<UserAchievementsProps> = ({
  userId,
  achievements = [],
  userAchievements = []
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [awardedAchievements, setAwardedAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(false);
  const form = useForm({
    defaultValues: {
      achievementId: "",
      notes: "",
    }
  });

  useEffect(() => {
    if (userAchievements && userAchievements.length > 0) {
      setAwardedAchievements(userAchievements);
    }
  }, [userAchievements]);

  const handleAwardAchievement = async (achievement: Achievement) => {
    if (!user?.id) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to claim achievements.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert([
          {
            user_achievements_user_id: user.id, // correct DB column
            achievement_id: achievement.id,
            date_achieved: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("Error awarding achievement:", error);
        toast({
          title: "Error",
          description: "Failed to award achievement. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Use only the keys that actually exist on the returned row
      setAwardedAchievements([
        ...awardedAchievements,
        {
          id: data[0].id,
          user_achievements_user_id: data[0].user_achievements_user_id,
          achievement_id: data[0].achievement_id,
          unlocked_at: data[0].date_achieved, // alias date_achieved to unlocked_at for compatibility
          date_achieved: data[0].date_achieved,
        } as UserAchievement,
      ]);
      toast({
        title: "Achievement Awarded!",
        description: `You've earned the ${achievement.name} achievement!`,
      });
    } catch (error) {
      console.error("Error awarding achievement:", error);
      toast({
        title: "Error",
        description: "Failed to award achievement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAchievementAwarded = (achievementId: string) => {
    return awardedAchievements.some((ua) => ua.achievement_id === achievementId);
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5 text-yellow-400" />
          My Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {achievements.length === 0 ? (
          <p className="text-gray-400">No achievements available.</p>
        ) : (
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center justify-between p-3 rounded-md bg-quantum-black/40"
              >
                <div className="flex items-center space-x-3">
                  {isAchievementAwarded(achievement.id) ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <h4 className="text-sm font-semibold">{achievement.name}</h4>
                    <p className="text-xs text-gray-400">{achievement.description}</p>
                  </div>
                </div>
                <div>
                  {isAchievementAwarded(achievement.id) ? (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-500">
                      Awarded
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAwardAchievement(achievement)}
                      disabled={loading}
                    >
                      Claim
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Share2, Trophy, Users, Heart, MessageCircle, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WorkoutSharingProps {
  workoutPlan?: any;
  workoutLog?: any;
  type: 'plan' | 'completed_workout' | 'achievement';
  onShareComplete?: () => void;
}

export const WorkoutSharing: React.FC<WorkoutSharingProps> = ({
  workoutPlan,
  workoutLog,
  type,
  onShareComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  const getDefaultTitle = () => {
    switch (type) {
      case 'plan':
        return `Check out my workout plan: ${workoutPlan?.name}`;
      case 'completed_workout':
        return `Just completed: ${workoutLog?.workout_plan_name || 'Workout'}`;
      case 'achievement':
        return 'New fitness achievement unlocked!';
      default:
        return 'Workout Share';
    }
  };

  const getDefaultDescription = () => {
    switch (type) {
      case 'plan':
        return `${workoutPlan?.description || ''}\n\nGoal: ${workoutPlan?.goal}\nDifficulty: ${workoutPlan?.difficulty}`;
      case 'completed_workout':
        return `Duration: ${workoutLog?.duration} minutes\nCalories burned: ${workoutLog?.calories_burned || 'N/A'}\nExercises completed: ${workoutLog?.exercises_completed || 0}`;
      case 'achievement':
        return 'Reached a new milestone in my fitness journey!';
      default:
        return '';
    }
  };

  useState(() => {
    setTitle(getDefaultTitle());
    setDescription(getDefaultDescription());
  });

  const shareWorkout = async () => {
    if (!user) return;

    setIsSharing(true);
    
    try {
      const shareData = {
        user_id: user.id,
        workout_plan_id: workoutPlan?.id || null,
        workout_log_id: workoutLog?.id || null,
        share_type: type,
        title: title || getDefaultTitle(),
        description: description || getDefaultDescription(),
        is_public: isPublic
      };

      const { error } = await supabase
        .from('workout_shares')
        .insert(shareData);

      if (error) throw error;

      toast({
        title: "Workout shared successfully!",
        description: isPublic ? "Your workout is now visible to the community" : "Your workout has been saved as private",
      });

      onShareComplete?.();
    } catch (error) {
      console.error('Error sharing workout:', error);
      toast({
        title: "Error sharing workout",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const getShareIcon = () => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'plan':
        return <Users className="w-5 h-5 text-blue-400" />;
      default:
        return <Share2 className="w-5 h-5 text-quantum-cyan" />;
    }
  };

  const getShareColor = () => {
    switch (type) {
      case 'achievement':
        return 'border-yellow-400/30 bg-yellow-400/10';
      case 'plan':
        return 'border-blue-400/30 bg-blue-400/10';
      default:
        return 'border-quantum-cyan/30 bg-quantum-cyan/10';
    }
  };

  return (
    <Card className={`${getShareColor()} border`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getShareIcon()}
          Share Your {type === 'completed_workout' ? 'Workout' : type === 'plan' ? 'Plan' : 'Achievement'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={getDefaultTitle()}
            className="bg-quantum-black/40"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={getDefaultDescription()}
            rows={4}
            className="bg-quantum-black/40"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPublic ? (
              <Globe className="w-4 h-4 text-green-400" />
            ) : (
              <Lock className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm font-medium">
              {isPublic ? 'Public' : 'Private'}
            </span>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
        </div>

        <div className="text-xs text-gray-400">
          {isPublic 
            ? "Your workout will be visible to all community members"
            : "Only you will be able to see this share"
          }
        </div>

        {type === 'completed_workout' && workoutLog && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-quantum-black/40 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-quantum-cyan">
                {workoutLog.duration || 0}
              </div>
              <div className="text-xs text-gray-400">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {workoutLog.calories_burned || 0}
              </div>
              <div className="text-xs text-gray-400">Calories</div>
            </div>
          </div>
        )}

        {type === 'plan' && workoutPlan && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{workoutPlan.goal}</Badge>
            <Badge variant="outline">{workoutPlan.difficulty}</Badge>
            <Badge variant="outline">{workoutPlan.frequency}x/week</Badge>
          </div>
        )}

        <Button
          onClick={shareWorkout}
          disabled={isSharing || !title.trim()}
          className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
        >
          {isSharing ? 'Sharing...' : 'Share Workout'}
        </Button>
      </CardContent>
    </Card>
  );
};

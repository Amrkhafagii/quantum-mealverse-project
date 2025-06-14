
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
        workout_shares_user_id: user.id,
        workout_plan_id: workoutPlan?.id || null,
        workout_log_id: workoutLog?.id || null,
        share_type: type,
        title: title,
        description: description,
        is_public: isPublic
      };

      const { data, error } = await supabase
        .from('workout_shares')
        .insert(shareData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Shared successfully!",
        description: isPublic ? "Your workout has been shared publicly" : "Your workout has been shared with your followers",
      });

      if (onShareComplete) {
        onShareComplete();
      }

    } catch (error) {
      console.error('Error sharing workout:', error);
      toast({
        title: "Sharing failed",
        description: "There was an error sharing your workout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'plan': return <Share2 className="w-5 h-5" />;
      case 'completed_workout': return <Trophy className="w-5 h-5" />;
      case 'achievement': return <Trophy className="w-5 h-5" />;
      default: return <Share2 className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'plan': return 'Share Workout Plan';
      case 'completed_workout': return 'Share Completed Workout';
      case 'achievement': return 'Share Achievement';
      default: return 'Share Workout';
    }
  };

  return (
    <Card className="bg-quantum-darkBlue border-quantum-cyan/30 text-white max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-quantum-cyan">
          {getTypeIcon()}
          {getTypeLabel()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a title..."
            className="bg-quantum-black/50 border-quantum-cyan/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            className="bg-quantum-black/50 border-quantum-cyan/30"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span className="text-sm">
              {isPublic ? 'Public' : 'Followers only'}
            </span>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onShareComplete}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={shareWorkout}
            disabled={isSharing || !title.trim()}
            className="flex-1 bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
          >
            {isSharing ? 'Sharing...' : 'Share'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

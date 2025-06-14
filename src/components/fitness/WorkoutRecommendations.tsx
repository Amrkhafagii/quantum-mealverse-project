import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Dumbbell, Heart, Target, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { WorkoutRecommendation } from "@/types/fitness/recommendations";

interface WorkoutRecommendationsProps {
  userId?: string;
  onApplyRecommendation: (userId?: string) => Promise<void>;
}

const WorkoutRecommendations: React.FC<WorkoutRecommendationsProps> = ({
  userId,
  onApplyRecommendation
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const currentUserId = userId || user?.id;

  useEffect(() => {
    if (currentUserId) {
      fetchRecommendations();
    }
  }, [currentUserId]);

  const fetchRecommendations = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workout_recommendations')
        .select('*')
        .eq('workout_recommendations_user_id', user.id)
        .eq('dismissed', false)
        .eq('applied', false)
        .order('confidence_score', { ascending: false })
        .limit(3);

      if (error) throw error;

      const typedRecommendations: WorkoutRecommendation[] = (data || []).map((rec: any) => ({
        id: rec.id,
        title: rec.title,
        name: rec.title, // For compatibility
        description: rec.description || '',
        difficulty: rec.difficulty ?? rec.metadata?.difficulty ?? 'beginner',
        duration_minutes: rec.duration_minutes ?? rec.metadata?.duration_minutes ?? 0,
        target_muscle_groups: rec.target_muscle_groups ?? rec.metadata?.target_muscle_groups ?? [],
        recommended_frequency: rec.recommended_frequency ?? rec.metadata?.recommended_frequency ?? 1,
        created_at: rec.created_at ?? new Date().toISOString(),
        workout_recommendations_user_id: rec.workout_recommendations_user_id,
        type: rec.type ?? rec.metadata?.type ?? '',
        reason: rec.reason ?? rec.metadata?.reason ?? '',
        confidence_score: rec.confidence_score ?? rec.metadata?.confidence_score ?? 0,
        suggested_at: rec.suggested_at,
        dismissed: rec.dismissed,
        applied: rec.applied,
        applied_at: rec.applied_at
      }));

      setRecommendations(typedRecommendations);
    } catch (error) {
      console.error('Error fetching workout recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load workout recommendations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyRecommendation = async (recommendationId: string) => {
    if (!currentUserId) return;

    try {
      setActionLoading(recommendationId);
      
      const { error } = await supabase
        .from('workout_recommendations')
        .update({ 
          applied: true, 
          applied_at: new Date().toISOString() 
        })
        .eq('id', recommendationId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      toast({
        title: "Program Applied",
        description: "The workout program has been applied to your routine",
      });

      // Call the onApplyRecommendation callback
      await onApplyRecommendation(currentUserId);
      
      // Refresh recommendations
      await fetchRecommendations();
    } catch (error) {
      console.error('Error applying recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to apply workout program",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismissRecommendation = async (recommendationId: string) => {
    if (!currentUserId) return;

    try {
      setActionLoading(recommendationId);
      
      const { error } = await supabase
        .from('workout_recommendations')
        .update({ dismissed: true })
        .eq('id', recommendationId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      toast({
        title: "Recommendation Dismissed",
        description: "This program won't be shown again",
      });
      
      // Refresh recommendations
      await fetchRecommendations();
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to dismiss recommendation",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'fat_loss':
        return <Heart className="h-6 w-6 text-red-500" />;
      case 'muscle_building':
        return <Dumbbell className="h-6 w-6 text-blue-500" />;
      default:
        return <Target className="h-6 w-6 text-quantum-cyan" />;
    }
  };

  const getConfidenceBadgeColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-500';
    if (score >= 0.8) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Star className="h-8 w-8 text-quantum-cyan" />
          <h2 className="text-3xl font-bold text-quantum-cyan">Workout Recommendations</h2>
        </div>
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400">Loading recommendations...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Star className="h-8 w-8 text-quantum-cyan" />
          <h2 className="text-3xl font-bold text-quantum-cyan">Workout Recommendations</h2>
        </div>
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-white mb-2">All Caught Up!</h3>
                <p className="text-gray-400">
                  No new workout recommendations at this time. Keep up the great work!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Star className="h-8 w-8 text-quantum-cyan" />
        <h2 className="text-3xl font-bold text-quantum-cyan">Workout Recommendations</h2>
      </div>
      
      <p className="text-gray-300">
        Based on your profile and goals, here are some recommended workout programs.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((recommendation) => (
          <Card 
            key={recommendation.id} 
            className="bg-quantum-darkBlue/30 border-quantum-cyan/20 hover:border-quantum-cyan/40 transition-colors"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getRecommendationIcon(recommendation.type)}
                  <div>
                    <CardTitle className="text-quantum-cyan text-xl">
                      {recommendation.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`${getConfidenceBadgeColor(recommendation.confidence_score)} text-white border-none`}
                      >
                        {Math.round(recommendation.confidence_score * 100)}% Match
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismissRecommendation(recommendation.id)}
                  disabled={actionLoading === recommendation.id}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                {recommendation.description}
              </p>
              
              {recommendation.reason && (
                <div className="bg-quantum-black/30 rounded-lg p-3">
                  <p className="text-sm text-quantum-cyan">
                    <strong>Why this program:</strong> {recommendation.reason}
                  </p>
                </div>
              )}
              
              <Button 
                className="w-full bg-quantum-purple hover:bg-quantum-purple/90 text-white"
                onClick={() => handleApplyRecommendation(recommendation.id)}
                disabled={actionLoading === recommendation.id}
              >
                {actionLoading === recommendation.id ? (
                  "Applying..."
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply Program
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkoutRecommendations;

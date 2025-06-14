import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkoutRecommendation } from '@/types/fitness/workouts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, ThumbsUp, X, ArrowRight, Star } from 'lucide-react';

interface WorkoutRecommendationsProps {
  onApplyRecommendation?: (recommendationId: string) => void;
}

const WorkoutRecommendations: React.FC<WorkoutRecommendationsProps> = ({ onApplyRecommendation }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

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

      // Set recommendations directly from Supabase, do not attempt to cast/merge
      setRecommendations(data || []);
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

  const handleApply = async (rec: any) => {
    try {
      // Update the recommendation status
      const { error } = await supabase
        .from('workout_recommendations')
        .update({ 
          applied: true,
          applied_at: new Date().toISOString()
        })
        .eq('id', rec.id);
        
      if (error) throw error;
      
      toast({
        title: "Recommendation Applied",
        description: "We've updated your workout plan accordingly",
      });
      
      // Update local state
      setRecommendations(prev => prev.filter(r => r.id !== rec.id));
      
      // Call parent callback if provided
      if (onApplyRecommendation) {
        onApplyRecommendation(rec.id);
      }
    } catch (error) {
      console.error('Error applying recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to apply recommendation",
        variant: "destructive"
      });
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      // Update the recommendation status
      const { error } = await supabase
        .from('workout_recommendations')
        .update({ dismissed: true })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Recommendation Dismissed",
        description: "We won't show this recommendation again",
      });
      
      // Update local state
      setRecommendations(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to dismiss recommendation",
        variant: "destructive"
      });
    }
  };

  // Helper to get property from rec or rec.metadata (for dynamic flexible fields)
  const getMeta = (rec: any, key: string, fallback: any = undefined) => {
    if (rec && key in rec && typeof rec[key] !== 'undefined') {
      return rec[key];
    }
    if (rec && typeof rec.metadata === 'object' && rec.metadata !== null && !Array.isArray(rec.metadata) && key in rec.metadata) {
      return rec.metadata[key];
    }
    return fallback;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-quantum-cyan flex items-center">
        <Star className="h-5 w-5 mr-2 text-yellow-400" />
        Recommended for You
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const reason = getMeta(rec, 'reason', '');
          const confidenceScore = getMeta(rec, 'confidence_score', 0);
          const title = rec.title || getMeta(rec, 'name', 'Recommendation');
          const description = rec.description || '';
          return (
            <Card key={rec.id} className="bg-quantum-black/30 border-quantum-purple/30 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">{title}</CardTitle>
                <CardDescription>
                  {reason && (
                    <p className="text-gray-400 text-sm">{reason}</p>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">{description}</p>
                <div className="flex items-center gap-1 text-xs text-quantum-cyan">
                  <Dumbbell className="h-3 w-3" />
                  <span>Confidence: {Math.round(confidenceScore * 100)}%</span>
                </div>
              </CardContent>
              <CardFooter className="bg-quantum-darkBlue/30 flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleDismiss(rec.id)}
                >
                  <X className="h-3 w-3 mr-1" />
                  Dismiss
                </Button>
                <Button 
                  size="sm"
                  className="bg-quantum-purple hover:bg-quantum-purple/90 text-xs"
                  onClick={() => handleApply(rec)}
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Apply
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutRecommendations;

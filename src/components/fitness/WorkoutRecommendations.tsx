import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Info, X, Check } from 'lucide-react';
import { WorkoutRecommendation } from '@/types/fitness';
import { getUserRecommendations, dismissWorkoutRecommendation, applyRecommendation } from '@/services/recommendationService';

const WorkoutRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await getUserRecommendations(user.id);
      if (error) throw error;
      
      if (data) {
        setRecommendations(data.filter(rec => !rec.applied && !rec.dismissed));
      }
    } catch (err) {
      console.error("Error loading recommendations:", err);
      toast.error("Failed to load workout recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (recommendationId: string) => {
    if (!user) return;
    
    try {
      const { success, error } = await dismissWorkoutRecommendation(recommendationId, user.id);
      
      if (error) throw new Error(error);
      
      if (success) {
        // Remove from local state
        setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
        toast.success("Recommendation dismissed");
      }
    } catch (err) {
      console.error("Error dismissing recommendation:", err);
      toast.error("Failed to dismiss recommendation");
    }
  };

  const handleApply = async (recommendationId: string) => {
    if (!user) return;
    
    try {
      const { success, error } = await applyRecommendation(recommendationId, user.id);
      
      if (error) throw new Error(error);
      
      if (success) {
        // Remove from local state or mark as applied
        setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
        toast.success("Recommendation applied to your workout schedule!");
        // Here you would typically add logic to actually apply the recommendation
        // e.g., create a new workout plan based on the recommendation
      }
    } catch (err) {
      console.error("Error applying recommendation:", err);
      toast.error("Failed to apply recommendation");
    }
  };

  if (loading) {
    return (
      <Card className="min-h-[200px] flex items-center justify-center">
        <CardContent>
          <p>Loading workout recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="min-h-[200px]">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
            You're All Set!
          </CardTitle>
          <CardDescription>
            No new workout recommendations at this time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            Continue with your current workout plan or create a new one from the workout planner.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Recommended For You</h3>
      
      {recommendations.map((recommendation) => (
        <Card key={recommendation.id} className="border-l-4 border-l-quantum-cyan">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  <Info className="mr-2 h-5 w-5 text-quantum-cyan" />
                  {recommendation.title || recommendation.name}
                </CardTitle>
                <CardDescription>
                  {recommendation.reason && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {recommendation.reason}
                    </Badge>
                  )}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                {Math.round((recommendation.confidence_score || 0.5) * 100)}% Match
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-sm">{recommendation.description}</p>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDismiss(recommendation.id)}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="mr-1 h-4 w-4" />
              Dismiss
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleApply(recommendation.id)}
              className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
            >
              <Check className="mr-1 h-4 w-4" />
              Apply
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default WorkoutRecommendations;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Brain, TrendingUp, Clock, Calendar, Dumbbell, Activity, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WorkoutRecommendation } from '@/types/fitness';
import { getUserRecommendations, applyRecommendation, dismissRecommendation } from '@/services/recommendationService';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkoutRecommendationsProps {
  userId?: string;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
}

const WorkoutRecommendations: React.FC<WorkoutRecommendationsProps> = ({
  userId,
  fitnessLevel = 'intermediate'
}) => {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (userId) {
      loadRecommendations();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await getUserRecommendations(userId || '');
      
      if (error) throw error;
      
      // Add default properties needed to avoid TypeScript errors
      const enhancedData = (data || []).map(rec => ({
        ...rec,
        dismissed: false,
        applied: false,
        type: rec.type || 'exercise',
        title: rec.title || rec.name,
        confidence_score: rec.confidence_score || 80,
        reason: rec.reason || 'Based on your fitness level and goals'
      }));
      
      setRecommendations(enhancedData);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workout recommendations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (recommendation: WorkoutRecommendation) => {
    try {
      const { success, error } = await applyRecommendation(recommendation.id);
      
      if (error) throw error;
      
      if (success) {
        // Update local state
        setRecommendations(prevRecs => 
          prevRecs.map(rec => 
            rec.id === recommendation.id 
              ? { ...rec, applied: true, applied_at: new Date().toISOString() }
              : rec
          )
        );
        
        toast({
          title: 'Recommendation Applied',
          description: 'The recommendation has been applied to your workout plan.',
        });
      }
    } catch (error) {
      console.error('Error applying recommendation:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply recommendation',
        variant: 'destructive'
      });
    }
  };

  const handleDismiss = async (recommendation: WorkoutRecommendation) => {
    try {
      const { success, error } = await dismissRecommendation(recommendation.id);
      
      if (error) throw error;
      
      if (success) {
        // Update local state
        setRecommendations(prevRecs => 
          prevRecs.map(rec => 
            rec.id === recommendation.id 
              ? { ...rec, dismissed: true }
              : rec
          )
        );
        
        toast({
          title: 'Recommendation Dismissed',
          description: 'The recommendation has been dismissed.',
        });
        
        // Show next recommendation if available
        if (currentIndex < recommendations.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      }
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      toast({
        title: 'Error',
        description: 'Failed to dismiss recommendation',
        variant: 'destructive'
      });
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'plan':
        return <Calendar className="h-5 w-5 text-blue-400" />;
      case 'exercise':
        return <Dumbbell className="h-5 w-5 text-green-400" />;
      case 'rest':
        return <Clock className="h-5 w-5 text-purple-400" />;
      case 'adjustment':
        return <TrendingUp className="h-5 w-5 text-orange-400" />;
      case 'equipment':
        return <Activity className="h-5 w-5 text-red-400" />;
      default:
        return <Brain className="h-5 w-5 text-quantum-cyan" />;
    }
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 90) {
      return <Badge className="bg-green-700">High Confidence</Badge>;
    } else if (score >= 70) {
      return <Badge className="bg-blue-700">Medium Confidence</Badge>;
    } else {
      return <Badge className="bg-orange-700">Suggestion</Badge>;
    }
  };

  const getActiveRecommendations = () => {
    return recommendations.filter(rec => !rec.dismissed && !rec.applied);
  };

  const activeRecommendations = getActiveRecommendations();
  const currentRec = activeRecommendations[currentIndex];

  if (loading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <Brain className="h-10 w-10 text-quantum-cyan mx-auto mb-2 animate-pulse" />
          <p>Analyzing your workout data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!userId) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <Brain className="h-16 w-16 text-quantum-cyan/50 mx-auto mb-4" />
          <p className="text-gray-400">Sign in to get personalized workout recommendations</p>
        </CardContent>
      </Card>
    );
  }

  if (activeRecommendations.length === 0) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-quantum-cyan" />
            AI Coach
          </CardTitle>
          <CardDescription>Personalized workout recommendations</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 text-center">
          <Brain className="h-16 w-16 text-quantum-cyan/50 mx-auto mb-4" />
          <p className="mb-2">No recommendations at the moment</p>
          <p className="text-sm text-gray-400">Keep logging your workouts and we'll provide personalized advice soon.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-quantum-cyan" />
          AI Coach
        </CardTitle>
        <CardDescription>Personalized workout recommendations</CardDescription>
      </CardHeader>
      
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRec.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              {getRecommendationIcon(currentRec.type || 'exercise')}
              <h3 className="text-lg font-semibold">{currentRec.title || currentRec.name}</h3>
            </div>
            
            <p className="text-gray-300 mb-3">{currentRec.description}</p>
            
            <div className="flex justify-between items-center">
              {getConfidenceBadge(currentRec.confidence_score || 80)}
              
              <div className="flex gap-2">
                {currentIndex < activeRecommendations.length - 1 && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
            
            {currentRec.reason && (
              <div className="mt-3 p-2 bg-quantum-black/40 rounded-md">
                <p className="text-xs text-gray-400">
                  <span className="font-semibold">Analysis:</span> {currentRec.reason}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        <div className="flex mt-4 space-x-2">
          <Button 
            className="flex-1 bg-quantum-cyan hover:bg-quantum-cyan/80"
            onClick={() => handleApply(currentRec)}
          >
            <Check className="h-4 w-4 mr-1" /> Apply
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => handleDismiss(currentRec)}
          >
            <X className="h-4 w-4 mr-1" /> Dismiss
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <p className="text-xs text-gray-400">
          Recommendations: {currentIndex + 1}/{activeRecommendations.length}
        </p>
        <p className="text-xs text-gray-400">
          Based on your {fitnessLevel} level
        </p>
      </CardFooter>
    </Card>
  );
};

export default WorkoutRecommendations;

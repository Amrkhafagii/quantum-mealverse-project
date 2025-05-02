
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, ThumbsUp, ThumbsDown, ArrowRight, Dumbbell, Lightbulb, Clock } from 'lucide-react';
import { WorkoutRecommendation } from '@/types/fitness';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkoutRecommendationsProps {
  userId?: string;
  userHeight?: number;
  userWeight?: number;
  userAge?: number;
  fitnessLevel?: string;
  recentWorkouts?: any[];
}

const WorkoutRecommendations: React.FC<WorkoutRecommendationsProps> = ({
  userId,
  userHeight,
  userWeight,
  userAge,
  fitnessLevel = 'beginner',
  recentWorkouts = []
}) => {
  const { user } = useAuth();
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
      // For now we'll use mock data until the AI engine is implemented
      setTimeout(() => {
        setRecommendations(generateRecommendations(userId || '', fitnessLevel, recentWorkouts));
        setLoading(false);
      }, 800);
      
      // In a real implementation, we would fetch from an AI service or Supabase:
      /*
      const { data, error } = await supabase
        .from('workout_recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('dismissed', false)
        .order('suggested_at', { ascending: false });
        
      if (error) throw error;
      
      setRecommendations(data || []);
      */
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

  const generateRecommendations = (
    userId: string, 
    level: string, 
    recentWorkouts: any[]
  ): WorkoutRecommendation[] => {
    // Mock AI-generated recommendations based on user profile
    const now = new Date().toISOString();
    
    const recommendations: WorkoutRecommendation[] = [
      {
        id: '1',
        user_id: userId,
        type: 'plan',
        title: 'Try a HIIT Workout',
        description: 'High-intensity interval training can boost your metabolism and improve cardiovascular health.',
        reason: 'Based on your recent focus on cardio exercises.',
        confidence_score: 87,
        suggested_at: now,
        applied: false,
        dismissed: false
      },
      {
        id: '2',
        user_id: userId,
        type: 'rest',
        title: 'Schedule a Recovery Day',
        description: 'Your training intensity has been high for the last 3 days. A recovery day would help prevent overtraining.',
        reason: 'Analysis of your recent workout patterns shows high-intensity consecutive days.',
        confidence_score: 92,
        suggested_at: now,
        applied: false,
        dismissed: false
      },
      {
        id: '3',
        user_id: userId,
        workout_plan_id: 'plan123',
        type: 'exercise',
        title: 'Add Deadlifts to Leg Day',
        description: 'Deadlifts would complement your current leg exercises and help strengthen your lower back.',
        reason: 'Your workout history shows good lower body strength but limited lower back engagement.',
        confidence_score: 85,
        suggested_at: now,
        applied: false,
        dismissed: false
      },
      {
        id: '4',
        user_id: userId,
        type: 'adjustment',
        title: 'Increase Bench Press Weight',
        description: 'You\'ve been completing 3 sets of 12 reps easily. Try increasing the weight by 5-10%.',
        reason: 'Your consistent performance indicates you\'re ready for more resistance.',
        confidence_score: 89,
        suggested_at: now,
        applied: false,
        dismissed: false
      },
      {
        id: '5',
        user_id: userId,
        type: 'equipment',
        title: 'Try Resistance Bands',
        description: 'Resistance bands can add variety to your routine without needing heavy equipment.',
        reason: 'Your log mentions limited access to equipment on certain days.',
        confidence_score: 80,
        suggested_at: now,
        applied: false,
        dismissed: false
      }
    ];
    
    // Tailor recommendations based on fitness level
    if (level === 'beginner') {
      recommendations.push({
        id: '6',
        user_id: userId,
        type: 'plan',
        title: 'Start with Full Body Workouts',
        description: 'Full body workouts 2-3 times per week are ideal for beginners to build a foundation.',
        reason: 'As a beginner, full body routines maximize overall muscle development efficiently.',
        confidence_score: 95,
        suggested_at: now,
        applied: false,
        dismissed: false
      });
    } else if (level === 'intermediate') {
      recommendations.push({
        id: '7',
        user_id: userId,
        type: 'plan',
        title: 'Try a Push-Pull-Legs Split',
        description: 'Dividing your training by movement patterns can help you progress to more focused workouts.',
        reason: 'Your fitness level indicates readiness for more specialized training.',
        confidence_score: 90,
        suggested_at: now,
        applied: false,
        dismissed: false
      });
    } else if (level === 'advanced') {
      recommendations.push({
        id: '8',
        user_id: userId,
        type: 'plan',
        title: 'Incorporate Periodization',
        description: 'Cycling between different training phases can help break plateaus and prevent overtraining.',
        reason: 'Your consistent training history suggests you would benefit from structured training cycles.',
        confidence_score: 93,
        suggested_at: now,
        applied: false,
        dismissed: false
      });
    }
    
    return recommendations;
  };

  const handleAcceptRecommendation = (recommendation: WorkoutRecommendation) => {
    toast({
      title: 'Recommendation Applied',
      description: `You've applied: ${recommendation.title}`,
    });
    
    // Update the recommendation list
    setRecommendations(prevRecs => {
      return prevRecs.map(rec => {
        if (rec.id === recommendation.id) {
          return { ...rec, applied: true, applied_at: new Date().toISOString() };
        }
        return rec;
      });
    });
    
    // In a real app, we would update this in the database
  };

  const handleDismissRecommendation = (recommendation: WorkoutRecommendation) => {
    // Update the recommendation list
    setRecommendations(prevRecs => {
      return prevRecs.map(rec => {
        if (rec.id === recommendation.id) {
          return { ...rec, dismissed: true };
        }
        return rec;
      });
    });
    
    // In a real app, we would update this in the database
  };

  const nextRecommendation = () => {
    if (currentIndex < recommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevRecommendation = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'plan': return <Dumbbell className="h-5 w-5 text-quantum-cyan" />;
      case 'exercise': return <Dumbbell className="h-5 w-5 text-blue-400" />;
      case 'rest': return <Clock className="h-5 w-5 text-green-400" />;
      case 'adjustment': return <Lightbulb className="h-5 w-5 text-amber-400" />;
      case 'equipment': return <Dumbbell className="h-5 w-5 text-purple-400" />;
      default: return <Brain className="h-5 w-5 text-quantum-cyan" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'plan': return 'border-quantum-cyan/30';
      case 'exercise': return 'border-blue-500/30';
      case 'rest': return 'border-green-500/30';
      case 'adjustment': return 'border-amber-500/30';
      case 'equipment': return 'border-purple-500/30';
      default: return 'border-quantum-cyan/30';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p>Analyzing your profile...</p>
        </CardContent>
      </Card>
    );
  }

  if (!userId) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-400">Sign in to get personalized recommendations</p>
        </CardContent>
      </Card>
    );
  }

  const activeRecommendations = recommendations.filter(r => !r.dismissed);

  if (activeRecommendations.length === 0) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <Lightbulb className="h-12 w-12 text-quantum-cyan mx-auto mb-3 opacity-50" />
          <p>No recommendations available right now.</p>
          <p className="text-sm text-gray-400 mt-2">Log more workouts to get personalized recommendations!</p>
        </CardContent>
      </Card>
    );
  }

  const currentRecommendation = activeRecommendations[currentIndex];

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Brain className="h-5 w-5 text-quantum-cyan" />
            AI Recommendations
          </CardTitle>
          <Badge variant="outline" className="text-quantum-cyan border-quantum-cyan">
            {activeRecommendations.length} suggestions
          </Badge>
        </div>
        <CardDescription>
          Personalized suggestions for your fitness journey
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRecommendation.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`p-4 rounded-lg bg-quantum-black/40 border ${getRecommendationColor(currentRecommendation.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="bg-quantum-black rounded-full p-2 mt-1">
                {getRecommendationIcon(currentRecommendation.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-bold text-white">{currentRecommendation.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {currentRecommendation.type.charAt(0).toUpperCase() + currentRecommendation.type.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-300 mt-2">{currentRecommendation.description}</p>
                
                <div className="mt-3 bg-quantum-black/40 p-2 rounded text-xs text-gray-400">
                  <span className="text-quantum-cyan">AI reasoning:</span> {currentRecommendation.reason}
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <span className={`text-xs ${getConfidenceColor(currentRecommendation.confidence_score)}`}>
                    Confidence: {currentRecommendation.confidence_score}%
                  </span>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleDismissRecommendation(currentRecommendation)}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      className="h-8"
                      onClick={() => handleAcceptRecommendation(currentRecommendation)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" /> Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {activeRecommendations.length > 1 && (
          <div className="flex justify-between mt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={prevRecommendation}
              disabled={currentIndex === 0}
              className="text-xs h-7 px-2"
            >
              Previous
            </Button>
            <div className="text-xs text-gray-400">
              {currentIndex + 1} of {activeRecommendations.length}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={nextRecommendation}
              disabled={currentIndex === activeRecommendations.length - 1}
              className="text-xs h-7 px-2"
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutRecommendations;

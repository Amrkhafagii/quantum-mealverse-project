
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getDifficultyAdjustments } from '@/services/recommendations/recommendationService';

interface DifficultyAdjustment {
  type: 'increase_weight' | 'increase_reps' | 'increase_sets' | 'decrease_weight' | 'decrease_reps' | 'add_rest';
  currentValue: number;
  suggestedValue: number;
  reason: string;
  confidence: number;
  exerciseName?: string;
}

export const AdaptiveDifficulty: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [adjustments, setAdjustments] = useState<DifficultyAdjustment[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [appliedAdjustments, setAppliedAdjustments] = useState<Set<number>>(new Set());

  const analyzeWorkoutData = async () => {
    if (!user) return;
    
    setIsAnalyzing(true);
    
    try {
      const difficultyAdjustments = await getDifficultyAdjustments(user.id);
      setAdjustments(difficultyAdjustments);
      
      if (difficultyAdjustments.length === 0) {
        toast({
          title: "Analysis Complete",
          description: "No difficulty adjustments needed at this time. Keep up the good work!",
        });
      }
    } catch (error) {
      console.error('Error analyzing workout data:', error);
      toast({
        title: "Analysis Error",
        description: "Unable to analyze your workout data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAdaptationIcon = (type: string) => {
    switch (type) {
      case 'increase_weight':
      case 'increase_reps':
      case 'increase_sets':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'decrease_weight':
      case 'decrease_reps':
        return <TrendingDown className="w-4 h-4 text-yellow-400" />;
      default:
        return <Target className="w-4 h-4 text-blue-400" />;
    }
  };

  const getAdaptationColor = (type: string) => {
    switch (type) {
      case 'increase_weight':
      case 'increase_reps':
      case 'increase_sets':
        return 'bg-green-500/20 border-green-500/30';
      case 'decrease_weight':
      case 'decrease_reps':
        return 'bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 border-blue-500/30';
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case 'increase_weight':
        return 'Increase Weight';
      case 'increase_reps':
        return 'Increase Reps';
      case 'increase_sets':
        return 'Add Set';
      case 'decrease_weight':
        return 'Reduce Weight';
      case 'decrease_reps':
        return 'Reduce Reps';
      default:
        return 'Adjust';
    }
  };

  const applyAdjustment = (index: number) => {
    setAppliedAdjustments(prev => new Set([...prev, index]));
    toast({
      title: "Adjustment Applied",
      description: "The difficulty adjustment has been noted for your next workout.",
    });
  };

  const skipAdjustment = (index: number) => {
    setAppliedAdjustments(prev => new Set([...prev, index]));
    toast({
      title: "Adjustment Skipped",
      description: "This adjustment will not be applied.",
    });
  };

  useEffect(() => {
    if (user) {
      analyzeWorkoutData();
    }
  }, [user]);

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-quantum-cyan" />
            Adaptive Difficulty
          </CardTitle>
          <Button
            onClick={analyzeWorkoutData}
            disabled={isAnalyzing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Analyze
          </Button>
        </div>
        <p className="text-sm text-gray-400">
          AI-powered difficulty adjustments based on your performance data
        </p>
      </CardHeader>
      <CardContent>
        {adjustments.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-quantum-cyan/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {isAnalyzing ? 'Analyzing Your Data...' : 'No Adjustments Needed'}
            </h3>
            <p className="text-gray-400 mb-4">
              {isAnalyzing 
                ? 'Please wait while we analyze your workout performance'
                : 'Your current workout difficulty appears to be well-suited to your progress'
              }
            </p>
            {!isAnalyzing && (
              <Button
                onClick={analyzeWorkoutData}
                className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
              >
                Analyze Performance
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {adjustments.map((adjustment, index) => {
              const isApplied = appliedAdjustments.has(index);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 ${getAdaptationColor(adjustment.type)} ${
                    isApplied ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getAdaptationIcon(adjustment.type)}
                      <div>
                        <h3 className="font-semibold">
                          {adjustment.exerciseName || 'Exercise'} - {getActionText(adjustment.type)}
                        </h3>
                        <Badge variant="outline">
                          {Math.round(adjustment.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                    {isApplied && (
                      <Badge className="bg-green-500/20 text-green-400">
                        <Check className="w-3 h-3 mr-1" />
                        Applied
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-400">Current</div>
                      <div className="text-lg font-semibold">
                        {adjustment.currentValue} {adjustment.type.includes('weight') ? 'kg' : ''}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Suggested</div>
                      <div className="text-lg font-semibold">
                        {adjustment.suggestedValue} {adjustment.type.includes('weight') ? 'kg' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <Progress value={adjustment.confidence * 100} className="h-2" />
                  </div>

                  <p className="text-sm text-gray-300 mb-3">{adjustment.reason}</p>

                  {!isApplied && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => applyAdjustment(index)}
                        className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                      >
                        Apply Change
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => skipAdjustment(index)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Skip
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

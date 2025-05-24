
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown,
  X,
  Lightbulb,
  Activity,
  Calendar,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorkoutRecommendations } from '@/hooks/useWorkoutRecommendations';
import { WorkoutRecommendation } from '@/types/fitness/recommendations';

export const SmartRecommendations: React.FC = () => {
  const { 
    recommendations, 
    isLoading, 
    generateRecommendations,
    applyRecommendation,
    dismissRecommendation,
    submitFeedback
  } = useWorkoutRecommendations();

  const [feedbackStates, setFeedbackStates] = useState<Record<string, boolean>>({});

  const getRecommendationIcon = (type: WorkoutRecommendation['type']) => {
    switch (type) {
      case 'workout_plan':
        return <Activity className="w-5 h-5" />;
      case 'progression':
        return <TrendingUp className="w-5 h-5" />;
      case 'recovery':
        return <Calendar className="w-5 h-5" />;
      case 'difficulty_adjustment':
        return <Target className="w-5 h-5" />;
      case 'exercise_variation':
        return <Zap className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getRecommendationColor = (type: WorkoutRecommendation['type']) => {
    switch (type) {
      case 'workout_plan':
        return 'bg-blue-500';
      case 'progression':
        return 'bg-green-500';
      case 'recovery':
        return 'bg-yellow-500';
      case 'difficulty_adjustment':
        return 'bg-purple-500';
      case 'exercise_variation':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleFeedback = async (
    recommendationId: string, 
    feedbackType: 'helpful' | 'not_helpful'
  ) => {
    await submitFeedback(recommendationId, feedbackType);
    setFeedbackStates(prev => ({ ...prev, [recommendationId]: true }));
  };

  const activeRecommendations = recommendations.filter(r => !r.dismissed && !r.applied);
  const completedRecommendations = recommendations.filter(r => r.applied);

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-quantum-cyan" />
            Smart Recommendations
          </CardTitle>
          <Button
            onClick={generateRecommendations}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Generate
          </Button>
        </div>
        <p className="text-sm text-gray-400">
          AI-powered workout suggestions based on your progress and goals
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-quantum-black/30 mb-4">
            <TabsTrigger value="active">
              Active ({activeRecommendations.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedRecommendations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeRecommendations.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="mx-auto h-12 w-12 text-quantum-cyan/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Recommendations</h3>
                <p className="text-gray-400 mb-4">
                  Generate personalized workout recommendations based on your data
                </p>
                <Button
                  onClick={generateRecommendations}
                  className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate Recommendations'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeRecommendations.map((recommendation, index) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-quantum-black/30 border border-quantum-cyan/10 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getRecommendationColor(recommendation.type)}`}>
                          {getRecommendationIcon(recommendation.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                          <Badge variant="outline" className="mt-1">
                            {recommendation.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissRecommendation(recommendation.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {recommendation.description && (
                      <p className="text-gray-300 mb-3">{recommendation.description}</p>
                    )}

                    {recommendation.reason && (
                      <div className="bg-quantum-darkBlue/20 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-400">
                          <strong>Why this recommendation:</strong> {recommendation.reason}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">
                          Confidence: {Math.round((recommendation.confidence_score || 0) * 100)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!feedbackStates[recommendation.id] && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(recommendation.id, 'helpful')}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(recommendation.id, 'not_helpful')}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => applyRecommendation(recommendation.id)}
                          className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                          size="sm"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedRecommendations.length === 0 ? (
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-quantum-cyan/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Completed Recommendations</h3>
                <p className="text-gray-400">
                  Applied recommendations will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedRecommendations.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className="bg-quantum-black/20 border border-green-500/20 rounded-lg p-4 opacity-75"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-green-500">
                        {getRecommendationIcon(recommendation.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{recommendation.title}</h3>
                        <p className="text-sm text-gray-400">
                          Applied {recommendation.applied_at ? new Date(recommendation.applied_at).toLocaleDateString() : 'recently'}
                        </p>
                      </div>
                    </div>
                    {recommendation.description && (
                      <p className="text-gray-400 text-sm">{recommendation.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

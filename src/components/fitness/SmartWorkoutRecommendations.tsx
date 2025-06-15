
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Target, Zap, CheckCircle, X } from 'lucide-react';
import { WorkoutRecommendationService } from '@/services/fitness/workoutRecommendationService';
import { WorkoutRecommendation } from '@/types/fitness/recommendations';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const SmartWorkoutRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const recs = await WorkoutRecommendationService.generateRecommendations(user.id);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRecommendation = async (recommendation: WorkoutRecommendation) => {
    setApplyingId(recommendation.id);
    
    try {
      // Here you would apply the recommendation
      // For now, we'll just mark it as applied
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendation.id 
            ? { ...rec, applied: true, applied_at: new Date().toISOString() }
            : rec
        )
      );
      
      toast.success('Recommendation applied successfully!');
    } catch (error) {
      console.error('Error applying recommendation:', error);
      toast.error('Failed to apply recommendation');
    } finally {
      setApplyingId(null);
    }
  };

  const handleDismissRecommendation = (recommendationId: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, dismissed: true, dismissed_at: new Date().toISOString() }
          : rec
      ).filter(rec => !rec.dismissed)
    );
    
    toast.success('Recommendation dismissed');
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'exercise_variation': return <TrendingUp className="w-5 h-5" />;
      case 'muscle_balance': return <Target className="w-5 h-5" />;
      case 'training_protocol': return <Zap className="w-5 h-5" />;
      case 'recovery': return <CheckCircle className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exercise_variation': return 'bg-purple-100 text-purple-800';
      case 'muscle_balance': return 'bg-orange-100 text-orange-800';
      case 'training_protocol': return 'bg-blue-100 text-blue-800';
      case 'recovery': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-6 h-6 text-quantum-cyan" />
        <h2 className="text-2xl font-bold text-quantum-cyan">Smart Recommendations</h2>
      </div>

      {recommendations.length === 0 ? (
        <Card className="holographic-card">
          <CardContent className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No recommendations yet</h3>
            <p className="text-gray-500">
              Complete a few more workouts to get personalized recommendations based on your progress.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.id} className="holographic-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-quantum-cyan bg-opacity-10 rounded-lg">
                      {getRecommendationIcon(recommendation.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-quantum-cyan">
                        {recommendation.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {recommendation.reason}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(recommendation.type)}>
                      {recommendation.type.replace('_', ' ')}
                    </Badge>
                    <Badge className={getConfidenceColor(recommendation.confidence_score)}>
                      {Math.round(recommendation.confidence_score * 100)}% confidence
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 mb-4">{recommendation.description}</p>
                
                {recommendation.metadata && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Details:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {Object.entries(recommendation.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleApplyRecommendation(recommendation)}
                    disabled={recommendation.applied || applyingId === recommendation.id}
                    className="cyber-button"
                  >
                    {applyingId === recommendation.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Applying...
                      </>
                    ) : recommendation.applied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Applied
                      </>
                    ) : (
                      'Apply Recommendation'
                    )}
                  </Button>
                  
                  {!recommendation.applied && (
                    <Button
                      variant="outline"
                      onClick={() => handleDismissRecommendation(recommendation.id)}
                      size="icon"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="text-center">
        <Button
          variant="outline"
          onClick={loadRecommendations}
          disabled={loading}
        >
          Refresh Recommendations
        </Button>
      </div>
    </div>
  );
};

export default SmartWorkoutRecommendations;

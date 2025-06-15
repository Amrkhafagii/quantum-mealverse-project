
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { DifficultyAdjustment } from '@/types/fitness/adaptive';

interface AdaptiveDifficultyProps {
  userId: string;
  currentWorkoutPlan?: any;
  onAdjustmentApplied?: (adjustment: DifficultyAdjustment) => void;
}

export const AdaptiveDifficulty: React.FC<AdaptiveDifficultyProps> = ({
  userId,
  currentWorkoutPlan,
  onAdjustmentApplied
}) => {
  const [adjustments, setAdjustments] = useState<DifficultyAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateMockAdjustments = (): DifficultyAdjustment[] => {
    return [
      {
        id: '1',
        suggested_adjustments: ['Increase weight by 5-10%', 'Add 2 more reps to each set'],
        confidence: 0.85,
        created_at: new Date().toISOString(),
        applied: false
      },
      {
        id: '2',
        suggested_adjustments: ['Reduce rest time by 15 seconds', 'Add an extra set'],
        confidence: 0.72,
        created_at: new Date().toISOString(),
        applied: false
      }
    ];
  };

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockData = generateMockAdjustments();
        setAdjustments(mockData);
        setIsLoading(false);
      }, 1000);
    }
  }, [userId]);

  const handleApplyAdjustment = (adjustment: DifficultyAdjustment) => {
    const updatedAdjustment = { ...adjustment, applied: true };
    setAdjustments(prev => prev.map(adj => 
      adj.id === adjustment.id ? updatedAdjustment : adj
    ));
    onAdjustmentApplied?.(updatedAdjustment);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Adaptive Difficulty
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Analyzing workout performance...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="mr-2 h-5 w-5" />
          Adaptive Difficulty Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {adjustments.length === 0 ? (
          <p className="text-gray-400">No adjustments recommended at this time.</p>
        ) : (
          adjustments.map((adjustment) => (
            <div key={adjustment.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Difficulty Adjustment</span>
                </div>
                <Badge variant="outline">
                  {Math.round(adjustment.confidence * 100)}% confidence
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                {adjustment.suggested_adjustments.map((suggestion, index) => (
                  <div key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
              
              <Button
                size="sm"
                onClick={() => handleApplyAdjustment(adjustment)}
                disabled={adjustment.applied}
                className="w-full"
              >
                {adjustment.applied ? 'Applied' : 'Apply Adjustment'}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AdaptiveDifficulty;

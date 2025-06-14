
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, TrendingUp } from 'lucide-react';
// FIX: Import from profile submodule
import { FitnessGoal } from '@/types/fitness/profile';
import { fetchGoals } from '@/services/fitnessGoalService';
import { useAuth } from '@/hooks/useAuth';

const UserGoals: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadGoals();
    }
  }, [user?.id]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const userGoals = await fetchGoals(user!.id);
      
      // Map the goals to ensure they have all required properties
      const mappedGoals: FitnessGoal[] = userGoals.map(goal => ({
        ...goal,
        type: goal.type || 'weight_loss',
        is_active: goal.is_active !== undefined ? goal.is_active : true
      }));
      
      setGoals(mappedGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (goal: FitnessGoal): number => {
    if (goal.target_value === 0) return 0;
    return Math.min(100, (goal.current_value / goal.target_value) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getDaysRemaining = (targetDate: string): number => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading goals...</div>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No goals set yet. Start by creating your first fitness goal!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Your Goals ({goals.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = calculateProgress(goal);
            const daysRemaining = getDaysRemaining(goal.target_date);
            
            return (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-500">
                        {goal.current_value} / {goal.target_value}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {progress.toFixed(1)}% complete
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {daysRemaining > 0 
                          ? `${daysRemaining} days remaining`
                          : daysRemaining === 0 
                            ? 'Due today'
                            : `${Math.abs(daysRemaining)} days overdue`
                        }
                      </span>
                    </div>
                    
                    {goal.target_weight && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span>Target: {goal.target_weight}kg</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserGoals;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutAnalytics, WorkoutGoal as AnalyticsWorkoutGoal } from '@/hooks/useWorkoutAnalytics';
import { WorkoutGoal } from '@/types/fitness/analytics';
import { GoalForm } from './GoalForm';

export const WorkoutGoalsManager: React.FC = () => {
  const { user } = useAuth();
  const { goals, isLoading, createGoal, updateGoal, deleteGoal } = useWorkoutAnalytics();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<WorkoutGoal | null>(null);

  const getGoalProgress = (goal: WorkoutGoal) => {
    if (!goal.target_value || goal.target_value === 0) return 0;
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getGoalStatusBadge = (goal: WorkoutGoal) => {
    const progress = getGoalProgress(goal);
    const isExpired = goal.target_date && new Date(goal.target_date) < new Date();
    
    if (progress >= 100) return <Badge className="bg-green-500">Completed</Badge>;
    if (isExpired) return <Badge variant="destructive">Expired</Badge>;
    if (progress >= 75) return <Badge className="bg-blue-500">Almost There</Badge>;
    if (progress >= 50) return <Badge className="bg-yellow-500">In Progress</Badge>;
    return <Badge variant="outline">Just Started</Badge>;
  };

  const handleCreateGoal = async (
    goalData: Omit<WorkoutGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_active'>
  ) => {
    if (!user?.id) return;
    // Make sure we always provide required fields (esp. title)
    if (!goalData.title || goalData.title.trim() === "") {
      // Optionally: add a toast or alert here
      return;
    }
    await createGoal({
      ...goalData,
      // status explicitly required by the type
      status: "active",
    });
    setShowCreateForm(false);
  };

  const handleEditGoal = async (
    goalData: Omit<WorkoutGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_active'>
  ) => {
    if (editingGoal && user?.id) {
      await updateGoal(editingGoal.id, { ...goalData });
      setEditingGoal(null);
    }
  };

  // Don't render if user is not authenticated
  if (!user?.id) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">Please log in to manage your workout goals.</p>
        </CardContent>
      </Card>
    );
  }

  if (showCreateForm || editingGoal) {
    return (
      <GoalForm
        onSubmit={editingGoal ? handleEditGoal : handleCreateGoal}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingGoal(null);
        }}
        initialData={editingGoal || undefined}
        isLoading={isLoading}
      />
    );
  }

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5 text-quantum-cyan" />
            Workout Goals
          </CardTitle>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="mx-auto h-12 w-12 text-quantum-cyan/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Goals Set</h3>
            <p className="text-gray-400 mb-4">
              Set your first fitness goal to start tracking your progress
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
            >
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.filter(goal => goal.is_active).map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-quantum-black/30 border border-quantum-cyan/10 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{goal.title}</h3>
                      {getGoalStatusBadge(goal)}
                    </div>
                    {goal.description && (
                      <p className="text-gray-400 text-sm mb-2">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {goal.goal_type.replace('_', ' ').toUpperCase()}
                      </span>
                      {goal.target_date && (
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(goal.target_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingGoal(goal)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {goal.target_value && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </span>
                    </div>
                    <Progress 
                      value={getGoalProgress(goal)} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-400">
                      {getGoalProgress(goal).toFixed(1)}% complete
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

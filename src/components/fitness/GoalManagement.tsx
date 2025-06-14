import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FitnessGoal, GoalStatus } from '@/types/fitness';

const GoalManagement: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<FitnessGoal[]>([]);

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('fitness_goals_user_id', user!.id);

      if (error) throw error;
      
      // Type cast the status field to GoalStatus
      const typedGoals = (data || []).map(goal => ({
        ...goal,
        status: goal.status as GoalStatus,
        target_value: goal.target_value || goal.target_weight || 0,
        current_value: goal.current_value || 0,
        goal_type: goal.goal_type || 'weight_loss'
      }));
      
      setGoals(typedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  return (
    <Card className="bg-quantum-black/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">Fitness Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="p-4 border border-quantum-cyan/20 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">{goal.name || goal.title}</h3>
                <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                  {goal.status}
                </Badge>
              </div>
              {goal.target_value && (
                <p className="text-sm text-gray-300">Target: {goal.target_value}</p>
              )}
              {goal.target_body_fat && (
                <p className="text-sm text-gray-300">Target Body Fat: {goal.target_body_fat}%</p>
              )}
              <p className="text-sm text-gray-400 mt-2">{goal.description}</p>
              {goal.category && (
                <p className="text-xs text-quantum-cyan mt-1">Category: {goal.category}</p>
              )}
              {goal.type && (
                <p className="text-xs text-quantum-purple mt-1">Type: {goal.type}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Target Date: {new Date(goal.target_date).toLocaleDateString()}
              </p>
              {goal.start_date && (
                <p className="text-xs text-gray-500">Started: {new Date(goal.start_date).toLocaleDateString()}</p>
              )}
              {typeof goal.is_active !== 'undefined' && (
                <p className="text-xs text-gray-500">Status: {goal.is_active ? 'Active' : 'Inactive'}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalManagement;

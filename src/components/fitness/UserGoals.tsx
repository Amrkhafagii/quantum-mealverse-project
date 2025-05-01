
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FitnessGoal } from '@/types/fitness';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

interface UserGoalsProps {
  userId?: string;
}

const UserGoals = ({ userId }: UserGoalsProps) => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [targetBodyFat, setTargetBodyFat] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userId) {
      loadGoals();
    }
  }, [userId]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load fitness goals.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGoal = async () => {
    if (!goalName || !goalDescription) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a name and description for your goal.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const newGoal = {
        user_id: userId,
        name: goalName,
        description: goalDescription,
        target_date: targetDate || null,
        target_weight: targetWeight ? parseFloat(targetWeight) : null,
        target_body_fat: targetBodyFat ? parseFloat(targetBodyFat) : null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('fitness_goals')
        .insert([newGoal]);
        
      if (error) throw error;
      
      toast({
        title: 'Goal Added',
        description: 'Your new fitness goal has been added successfully.',
      });
      
      // Reset form
      setGoalName('');
      setGoalDescription('');
      setTargetDate('');
      setTargetWeight('');
      setTargetBodyFat('');
      setShowAddForm(false);
      
      // Reload goals
      await loadGoals();
      
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to add fitness goal.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateGoalStatus = async (goalId: string, status: 'active' | 'completed' | 'abandoned') => {
    try {
      const { error } = await supabase
        .from('fitness_goals')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);
        
      if (error) throw error;
      
      // Update local state
      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, status } : goal
      ));
      
      toast({
        title: 'Status Updated',
        description: `Goal marked as ${status}.`,
      });
      
    } catch (error) {
      console.error('Error updating goal status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal status.',
        variant: 'destructive',
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('fitness_goals')
        .delete()
        .eq('id', goalId);
        
      if (error) throw error;
      
      // Update local state
      setGoals(goals.filter(goal => goal.id !== goalId));
      
      toast({
        title: 'Goal Deleted',
        description: 'Your fitness goal has been deleted.',
      });
      
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete fitness goal.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-quantum-cyan';
      case 'completed':
        return 'bg-green-500';
      case 'abandoned':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p>Loading fitness goals...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-quantum-cyan">Your Fitness Goals</h2>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="bg-quantum-purple hover:bg-quantum-purple/90"
        >
          {showAddForm ? 'Cancel' : 'Add New Goal'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="holographic-card">
          <CardHeader>
            <CardTitle>Create New Goal</CardTitle>
            <CardDescription>
              Set a clear, achievable fitness goal to track your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name*</Label>
                <Input
                  id="goalName"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g., Lose 5kg, Run a 10k, Build Muscle"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goalDescription">Description*</Label>
                <Textarea
                  id="goalDescription"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Describe your goal in detail, including your motivation"
                  required
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetBodyFat">Target Body Fat %</Label>
                  <Input
                    id="targetBodyFat"
                    type="number"
                    value={targetBodyFat}
                    onChange={(e) => setTargetBodyFat(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSubmitGoal} 
              disabled={submitting || !goalName || !goalDescription}
              className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90"
            >
              {submitting ? 'Saving...' : 'Add Goal'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="holographic-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{goal.name}</CardTitle>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                  </div>
                </div>
                {goal.target_date && (
                  <CardDescription>
                    Target Date: {new Date(goal.target_date).toLocaleDateString()}
                    {goal.target_date && new Date(goal.target_date) < new Date() && 
                      goal.status === 'active' && 
                      " (overdue)"}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{goal.description}</p>
                
                {goal.target_weight && (
                  <div className="text-sm">Target Weight: {goal.target_weight} kg</div>
                )}
                
                {goal.target_body_fat && (
                  <div className="text-sm">Target Body Fat: {goal.target_body_fat}%</div>
                )}
                
                {goal.status === 'active' && goal.target_date && (
                  <div className="space-y-1">
                    <div className="text-xs flex justify-between">
                      <span>Progress</span>
                      <span>
                        {Math.min(100, Math.max(0, Math.floor(
                          (new Date().getTime() - new Date(goal.created_at).getTime()) / 
                          (new Date(goal.target_date).getTime() - new Date(goal.created_at).getTime()) * 100
                        )))}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(100, Math.max(0, Math.floor(
                        (new Date().getTime() - new Date(goal.created_at).getTime()) / 
                        (new Date(goal.target_date).getTime() - new Date(goal.created_at).getTime()) * 100
                      )))}
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                {goal.status === 'active' && (
                  <>
                    <Button
                      onClick={() => updateGoalStatus(goal.id, 'completed')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Complete
                    </Button>
                    <Button
                      onClick={() => updateGoalStatus(goal.id, 'abandoned')}
                      className="flex-1"
                      variant="destructive"
                      size="sm"
                    >
                      Abandon
                    </Button>
                  </>
                )}
                {goal.status !== 'active' && (
                  <Button
                    onClick={() => updateGoalStatus(goal.id, 'active')}
                    className="flex-1 bg-quantum-cyan hover:bg-quantum-cyan/90"
                    size="sm"
                  >
                    Reactivate
                  </Button>
                )}
                <Button
                  onClick={() => deleteGoal(goal.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="pt-6 text-center">
            <p>No fitness goals found. Create your first goal to start tracking your journey.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserGoals;

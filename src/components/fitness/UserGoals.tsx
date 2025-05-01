import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FiTarget, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { FitnessGoal } from '@/types/fitness';

interface UserGoalsProps {
  userId?: string;
}

const UserGoals: React.FC<UserGoalsProps> = ({ userId }) => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
      
      setGoals(data as FitnessGoal[] || []);
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

  const handleAddGoal = async () => {
    if (!name || !description) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter a name and description for your goal.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('fitness_goals')
        .insert({
          user_id: userId,
          name,
          description,
          target_date: targetDate || null,
          target_weight: targetWeight ? parseFloat(targetWeight) : null,
          target_body_fat: targetBodyFat ? parseFloat(targetBodyFat) : null,
          status: 'active',
        });

      if (error) throw error;

      toast({
        title: "Goal Added",
        description: "Your new fitness goal has been created."
      });
      
      // Reset form
      setName('');
      setDescription('');
      setTargetDate('');
      setTargetWeight('');
      setTargetBodyFat('');
      
      // Refresh goals
      loadGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateGoalStatus = async (goalId: string, status: 'active' | 'completed' | 'abandoned') => {
    try {
      const { error } = await supabase
        .from('fitness_goals')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', goalId);
        
      if (error) throw error;
      
      // Update local state
      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, status } : goal
      ));
      
      toast({
        title: `Goal ${status === 'completed' ? 'Completed' : status === 'abandoned' ? 'Abandoned' : 'Reactivated'}`,
        description: `Your fitness goal has been ${status === 'completed' ? 'marked as complete' : status === 'abandoned' ? 'abandoned' : 'set to active'}.`
      });
    } catch (error) {
      console.error('Error updating goal status:', error);
      toast({
        title: "Error",
        description: "Failed to update goal status.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'abandoned':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="h-5 w-5 text-green-400" />;
      case 'abandoned':
        return <FiXCircle className="h-5 w-5 text-red-400" />;
      default:
        return <FiTarget className="h-5 w-5 text-blue-400" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p>Loading your fitness goals...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="holographic-card">
        <CardHeader>
          <CardTitle>Add New Goal</CardTitle>
          <CardDescription>
            Set clear fitness goals to track your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Lose 10 pounds"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Get to my target weight through diet and exercise"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
              
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
            onClick={handleAddGoal}
            disabled={submitting || !name || !description}
            className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90"
          >
            {submitting ? 'Adding...' : 'Add Goal'}
          </Button>
        </CardFooter>
      </Card>

      {goals.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-quantum-cyan">Your Fitness Goals</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <Card 
                key={goal.id} 
                className={`holographic-card ${goal.status === 'completed' ? 'border-green-500/30' : goal.status === 'abandoned' ? 'border-red-500/30' : 'border-blue-500/30'}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(goal.status)}
                      <span>{goal.name}</span>
                    </CardTitle>
                    <span className={`text-sm font-medium ${getStatusColor(goal.status)}`}>
                      {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                    </span>
                  </div>
                  <CardDescription>{goal.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {goal.target_date && (
                      <div>
                        <span className="text-gray-400">Target Date: </span>
                        <span>{new Date(goal.target_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {goal.target_weight && (
                      <div>
                        <span className="text-gray-400">Target Weight: </span>
                        <span>{goal.target_weight} kg</span>
                      </div>
                    )}
                    {goal.target_body_fat && (
                      <div>
                        <span className="text-gray-400">Target Body Fat: </span>
                        <span>{goal.target_body_fat}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  {goal.status === 'active' ? (
                    <div className="flex gap-2 w-full">
                      <Button 
                        onClick={() => updateGoalStatus(goal.id, 'completed')}
                        variant="outline"
                        className="flex-1 border-green-500/50 hover:bg-green-500/20"
                      >
                        Complete
                      </Button>
                      <Button 
                        onClick={() => updateGoalStatus(goal.id, 'abandoned')}
                        variant="outline"
                        className="flex-1 border-red-500/50 hover:bg-red-500/20"
                      >
                        Abandon
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => updateGoalStatus(goal.id, 'active')}
                      variant="outline"
                      className="w-full border-blue-500/50 hover:bg-blue-500/20"
                    >
                      Reactivate
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="pt-6 text-center">
            <p>No fitness goals found. Add your first goal to start tracking your progress.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserGoals;

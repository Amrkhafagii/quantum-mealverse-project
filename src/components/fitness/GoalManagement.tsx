import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Plus, Trash, CheckCircle, PlusCircle, Pencil, X, Trophy } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { getUserFitnessGoals, addFitnessGoal, updateFitnessGoal, deleteFitnessGoal, updateGoalStatus } from '@/services/fitnessGoalService';
import { FitnessGoal } from '@/types/fitness';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface GoalManagementProps {
  userId?: string;
}

const GoalManagement: React.FC<GoalManagementProps> = ({ userId }) => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FitnessGoal | null>(null);
  
  // Form data for creating/editing goals
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [targetBodyFat, setTargetBodyFat] = useState<number | null>(null);
  
  // Load goals when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      loadGoals();
    }
  }, [userId]);
  
  const loadGoals = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await getUserFitnessGoals(userId);
      
      if (error) throw error;
      
      if (data) {
        // Sort goals: active first, then by target date
        const sortedGoals = [...data].sort((a, b) => {
          // First sort by status
          if (a.status !== b.status) {
            if (a.status === 'active') return -1;
            if (b.status === 'active') return 1;
            if (a.status === 'completed') return -1;
            if (b.status === 'completed') return 1;
          }
          
          // Then sort by target date (if both have target dates)
          if (a.target_date && b.target_date) {
            return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
          }
          
          // If only one has a target date, put it first
          if (a.target_date) return -1;
          if (b.target_date) return 1;
          
          // Finally, sort by created date
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        
        setGoals(sortedGoals);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load fitness goals',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setGoalName('');
    setGoalDescription('');
    setTargetDate(null);
    setTargetWeight(null);
    setTargetBodyFat(null);
    setEditingGoal(null);
    setShowAddForm(false);
  };
  
  const handleEditGoal = (goal: FitnessGoal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setGoalDescription(goal.description);
    setTargetDate(goal.target_date ? new Date(goal.target_date) : null);
    setTargetWeight(goal.target_weight);
    setTargetBodyFat(goal.target_body_fat);
    setShowAddForm(true);
  };
  
  const handleUpdateStatus = async (goalId: string, status: 'active' | 'completed' | 'abandoned') => {
    if (!userId) return;
    
    try {
      const { error } = await updateGoalStatus(goalId, status);
      
      if (error) throw error;
      
      // Update local state to reflect the change
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === goalId 
            ? { ...goal, status } 
            : goal
        )
      );
      
      const statusText = {
        'active': 'Active',
        'completed': 'Completed',
        'abandoned': 'Abandoned'
      }[status];
      
      toast({
        title: 'Goal Updated',
        description: `Goal marked as ${statusText}`
      });
    } catch (error) {
      console.error('Error updating goal status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal status',
        variant: 'destructive'
      });
    }
  };
  
  const handleDeleteGoal = async (goalId: string) => {
    if (!userId) return;
    
    try {
      const { error } = await deleteFitnessGoal(goalId);
      
      if (error) throw error;
      
      // Remove the goal from local state
      setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
      
      toast({
        title: 'Goal Deleted',
        description: 'Fitness goal has been deleted'
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete fitness goal',
        variant: 'destructive'
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to create fitness goals',
        variant: 'destructive'
      });
      return;
    }
    
    if (!goalName) {
      toast({
        title: 'Required Field',
        description: 'Please enter a goal name',
        variant: 'destructive'
      });
      return;
    }
    
    // Prepare the goal object with the correct properties matching FitnessGoal interface
    const goalData: FitnessGoal = {
      id: editingGoal?.id || uuidv4(),
      user_id: userId,
      name: goalName,
      title: goalName, // Add title property for compatibility
      description: goalDescription,
      target_date: targetDate ? targetDate.toISOString() : undefined,
      target_weight: targetWeight,
      target_body_fat: targetBodyFat,
      status: editingGoal?.status || 'active',
      category: 'weight', // Default category
      target_value: targetWeight || 0, // Use target weight as the target value
      current_value: 0, // Default current value
      created_at: editingGoal?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    try {
      let result;
      
      if (editingGoal) {
        // Update existing goal
        result = await updateFitnessGoal(goalData);
        
        if (result.error) throw result.error;
        
        // Update the goal in local state
        setGoals(prevGoals => 
          prevGoals.map(goal => 
            goal.id === editingGoal.id 
              ? result.data as FitnessGoal
              : goal
          )
        );
        
        toast({
          title: 'Goal Updated',
          description: 'Fitness goal has been updated successfully'
        });
      } else {
        // Add new goal
        result = await addFitnessGoal(goalData);
        
        if (result.error) throw result.error;
        
        // Add the new goal to local state
        if (result.data) {
          setGoals(prevGoals => [result.data as FitnessGoal, ...prevGoals]);
        }
        
        toast({
          title: 'Goal Created',
          description: 'New fitness goal has been created'
        });
      }
      
      // Reset the form
      resetForm();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to save fitness goal',
        variant: 'destructive'
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500">Active</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'abandoned':
        return <Badge className="bg-gray-500">Abandoned</Badge>;
      default:
        return <Badge className="bg-blue-500">Active</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-bold text-quantum-cyan">Fitness Goals</CardTitle>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="bg-quantum-cyan hover:bg-quantum-cyan/90"
          >
            {showAddForm ? (
              <>
                <X className="h-4 w-4 mr-2" /> Cancel
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" /> New Goal
              </>
            )}
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Goal Form */}
          {showAddForm && (
            <Card className="bg-quantum-black/40 border border-quantum-purple/20 mb-6">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="goalName" className="block text-sm font-medium mb-1">Goal Name *</label>
                      <Input
                        id="goalName"
                        value={goalName}
                        onChange={(e) => setGoalName(e.target.value)}
                        placeholder="E.g., Lose 5kg by summer"
                        className="bg-quantum-black/30"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="goalDescription" className="block text-sm font-medium mb-1">Description</label>
                      <Textarea
                        id="goalDescription"
                        value={goalDescription}
                        onChange={(e) => setGoalDescription(e.target.value)}
                        placeholder="Details about your goal..."
                        className="bg-quantum-black/30"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Target Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-quantum-black/30"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {targetDate ? format(targetDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-quantum-black border border-quantum-cyan/20">
                            <Calendar
                              mode="single"
                              selected={targetDate || undefined}
                              onSelect={setTargetDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <label htmlFor="targetWeight" className="block text-sm font-medium mb-1">Target Weight (kg)</label>
                        <Input
                          id="targetWeight"
                          type="number"
                          value={targetWeight || ''}
                          onChange={(e) => setTargetWeight(e.target.value ? Number(e.target.value) : null)}
                          placeholder="70.5"
                          className="bg-quantum-black/30"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="targetBodyFat" className="block text-sm font-medium mb-1">Target Body Fat (%)</label>
                        <Input
                          id="targetBodyFat"
                          type="number"
                          value={targetBodyFat || ''}
                          onChange={(e) => setTargetBodyFat(e.target.value ? Number(e.target.value) : null)}
                          placeholder="15"
                          className="bg-quantum-black/30"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-2 flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-quantum-purple hover:bg-quantum-purple/90"
                      >
                        {editingGoal ? 'Update Goal' : 'Create Goal'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {/* Goals List */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading goals...</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-12 bg-quantum-black/30 rounded-lg">
              <Trophy className="h-12 w-12 mx-auto text-quantum-cyan/50 mb-4" />
              <h3 className="text-lg font-medium text-quantum-cyan mb-1">No Goals Yet</h3>
              <p className="text-gray-400 mb-4">Create your first fitness goal to stay motivated</p>
              <Button 
                onClick={() => setShowAddForm(true)} 
                className="bg-quantum-purple hover:bg-quantum-purple/90"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Create Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map(goal => (
                <Card key={goal.id} className="bg-quantum-black/30 border border-quantum-cyan/20">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg flex items-center gap-2">
                              {goal.name}
                              <span className="ml-2">{getStatusBadge(goal.status)}</span>
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">
                              {goal.target_date ? (
                                <>Target: {format(new Date(goal.target_date), 'PP')}</>
                              ) : 'No target date'}
                            </p>
                            <p className="text-gray-300">{goal.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          {goal.target_weight && (
                            <div className="bg-quantum-darkBlue/30 px-3 py-2 rounded-md">
                              <p className="text-xs text-gray-400">Target Weight</p>
                              <p className="font-medium">{goal.target_weight} kg</p>
                            </div>
                          )}
                          
                          {goal.target_body_fat && (
                            <div className="bg-quantum-darkBlue/30 px-3 py-2 rounded-md">
                              <p className="text-xs text-gray-400">Target Body Fat</p>
                              <p className="font-medium">{goal.target_body_fat}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditGoal(goal)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        {goal.status === 'active' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateStatus(goal.id, 'completed')}
                            className="bg-green-500/10 border-green-500 hover:bg-green-500/20"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        ) : goal.status === 'completed' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateStatus(goal.id, 'active')}
                            className="bg-blue-500/10 border-blue-500 hover:bg-blue-500/20"
                          >
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateStatus(goal.id, 'active')}
                            className="bg-blue-500/10 border-blue-500 hover:bg-blue-500/20"
                          >
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="bg-red-500/10 border-red-500/50 hover:bg-red-500/20"
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalManagement;

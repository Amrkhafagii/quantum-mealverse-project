
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, Edit, Trash2 } from 'lucide-react';
import { FitnessGoal, GoalStatus } from '@/types/fitness';
import { getUserFitnessGoals, addFitnessGoal, updateFitnessGoal, deleteFitnessGoal } from '@/services/fitnessGoalService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const GoalManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FitnessGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_weight: 0,
    target_body_fat: 0,
    target_date: '',
    status: 'active' as GoalStatus
  });

  useEffect(() => {
    if (user?.id) {
      fetchGoals();
    }
  }, [user?.id]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data } = await getUserFitnessGoals(user!.id);
      if (data) {
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalData: FitnessGoal = {
      id: editingGoal?.id || '',
      user_id: user!.id,
      title: formData.title,
      name: formData.title,
      description: formData.description,
      target_value: formData.target_weight,
      current_value: 0,
      start_date: new Date().toISOString(),
      target_date: formData.target_date,
      category: 'weight',
      status: formData.status,
      target_weight: formData.target_weight,
      target_body_fat: formData.target_body_fat,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      type: 'weight_loss',
      is_active: true
    };

    try {
      if (editingGoal) {
        await updateFitnessGoal(editingGoal.id, goalData);
        toast({
          title: "Success",
          description: "Goal updated successfully",
        });
      } else {
        await addFitnessGoal(goalData);
        toast({
          title: "Success", 
          description: "Goal created successfully",
        });
      }
      
      setShowForm(false);
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        target_weight: 0,
        target_body_fat: 0,
        target_date: '',
        status: 'active'
      });
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: "Error",
        description: "Failed to save goal",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (goal: FitnessGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      target_weight: goal.target_weight || 0,
      target_body_fat: goal.target_body_fat || 0,
      target_date: goal.target_date,
      status: goal.status
    });
    setShowForm(true);
  };

  const handleDelete = async (goalId: string) => {
    try {
      await deleteFitnessGoal(goalId);
      toast({
        title: "Success",
        description: "Goal deleted successfully",
      });
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goal Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading goals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Fitness Goals
          </CardTitle>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No goals set yet. Create your first fitness goal!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{goal.title}</h3>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                  <div className="flex justify-between text-sm">
                    <span>Target: {goal.target_weight}kg</span>
                    <span className={`capitalize ${goal.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>
                      {goal.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_weight">Target Weight (kg)</Label>
                  <Input
                    id="target_weight"
                    type="number"
                    value={formData.target_weight}
                    onChange={(e) => setFormData({ ...formData, target_weight: parseFloat(e.target.value) })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="target_body_fat">Target Body Fat (%)</Label>
                  <Input
                    id="target_body_fat"
                    type="number"
                    value={formData.target_body_fat}
                    onChange={(e) => setFormData({ ...formData, target_body_fat: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_date">Target Date</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: GoalStatus) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="abandoned">Abandoned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingGoal(null);
                    setFormData({
                      title: '',
                      description: '',
                      target_weight: 0,
                      target_body_fat: 0,
                      target_date: '',
                      status: 'active'
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalManagement;

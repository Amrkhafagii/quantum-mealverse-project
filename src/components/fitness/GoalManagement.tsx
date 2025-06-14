import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FitnessGoal, GoalStatus } from '@/types/fitness';
import { toast } from 'sonner';

const GoalManagement = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    description: '',
    target_value: 0,
    current_value: 0,
    start_date: new Date().toISOString().split('T')[0],
    target_date: new Date().toISOString().split('T')[0],
    category: '',
    status: 'active' as GoalStatus,
    type: 'weight_loss' as 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength',
    is_active: true,
    target_weight: 0,
    target_body_fat: 0,
  });

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('fitness_goals_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to fetch goals');
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: '',
      name: '',
      description: '',
      target_value: 0,
      current_value: 0,
      start_date: new Date().toISOString().split('T')[0],
      target_date: new Date().toISOString().split('T')[0],
      category: '',
      status: 'active' as GoalStatus,
      type: 'weight_loss' as 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength',
      is_active: true,
      target_weight: 0,
      target_body_fat: 0,
    });
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const createGoal = async (goalData: any) => {
    try {
      const { data, error } = await supabase
        .from('fitness_goals')
        .insert({
          fitness_goals_user_id: user.id, // Updated field name
          title: goalData.title,
          name: goalData.name,
          description: goalData.description,
          target_value: goalData.target_value,
          current_value: goalData.current_value || 0,
          start_date: goalData.start_date,
          target_date: goalData.target_date,
          category: goalData.category,
          status: goalData.status,
          type: goalData.type,
          is_active: goalData.is_active,
          target_weight: goalData.target_weight,
          target_body_fat: goalData.target_body_fat,
        });

      if (error) throw error;
      
      toast.success('Goal created successfully!');
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
      throw error;
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await createGoal(formData);
      fetchGoals();
      closeModal();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const renderGoal = (goal: FitnessGoal) => (
    <div key={goal.id} className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">{goal.title}</h3>
      <p className="text-gray-600">{goal.description}</p>
      {goal.target_weight && (
        <p className="text-sm">Target Weight: {goal.target_weight} kg</p>
      )}
      {goal.target_body_fat && (
        <p className="text-sm">Target Body Fat: {goal.target_body_fat}%</p>
      )}
      <p className="text-sm">Category: {goal.category}</p>
      <p className="text-sm">Status: {goal.status}</p>
      <p className="text-sm">Type: {goal.type}</p>
      <p className="text-sm">
        Target Value: {goal.target_value} (Current: {goal.current_value})
      </p>
      <p className="text-sm">Start Date: {goal.start_date}</p>
      <p className="text-sm">Target Date: {goal.target_date}</p>
      <p className="text-sm">Active: {goal.is_active ? 'Yes' : 'No'}</p>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Fitness Goal Management</h2>
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={openModal}
      >
        Create New Goal
      </button>

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(renderGoal)}
        </div>
      ) : (
        <p>No goals created yet.</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">Create a New Goal</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                  Title:
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                  Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                  Description:
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="target_value" className="block text-gray-700 text-sm font-bold mb-2">
                  Target Value:
                </label>
                <input
                  type="number"
                  id="target_value"
                  name="target_value"
                  value={formData.target_value}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="start_date" className="block text-gray-700 text-sm font-bold mb-2">
                  Start Date:
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="target_date" className="block text-gray-700 text-sm font-bold mb-2">
                  Target Date:
                </label>
                <input
                  type="date"
                  id="target_date"
                  name="target_date"
                  value={formData.target_date}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
                  Category:
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">
                  Status:
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="failed">Failed</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">
                  Type:
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="weight_gain">Weight Gain</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                  <option value="strength">Strength</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="target_weight" className="block text-gray-700 text-sm font-bold mb-2">
                  Target Weight:
                </label>
                <input
                  type="number"
                  id="target_weight"
                  name="target_weight"
                  value={formData.target_weight}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="target_body_fat" className="block text-gray-700 text-sm font-bold mb-2">
                  Target Body Fat:
                </label>
                <input
                  type="number"
                  id="target_body_fat"
                  name="target_body_fat"
                  value={formData.target_body_fat}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="is_active" className="inline-flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-green-500"
                  />
                  <span className="ml-2 text-gray-700 text-sm font-bold">Active</span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Create Goal
                </button>
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalManagement;

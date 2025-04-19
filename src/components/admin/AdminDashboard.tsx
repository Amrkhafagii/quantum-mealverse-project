
import React from 'react';
import { Button } from "@/components/ui/button";
import MealForm from './MealForm';
import MealList from './MealList';
import { useMealManagement } from '@/hooks/useMealManagement';
import { MealType } from '@/types/meal';

interface AdminDashboardProps {
  meals: MealType[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ meals }) => {
  const {
    editingMeal,
    formData,
    setEditingMeal,
    handleInputChange,
    handleEditMeal,
    handleSaveMeal,
    handleDeleteMeal,
    handleImageUpload,
  } = useMealManagement(async () => {
    await Promise.resolve();
  });

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-quantum-cyan neon-text">Admin Dashboard</h1>
        <Button 
          onClick={() => setEditingMeal(null)}
          className="cyber-button"
        >
          Create New Meal
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MealForm
          formData={formData}
          editingMeal={editingMeal}
          onInputChange={handleInputChange}
          onSave={handleSaveMeal}
          onCancel={() => setEditingMeal(null)}
          onImageUpload={handleImageUpload}
        />
        <MealList
          meals={meals}
          onEdit={handleEditMeal}
          onDelete={handleDeleteMeal}
        />
      </div>
    </>
  );
};


import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import MealForm from '@/components/admin/MealForm';
import MealList from '@/components/admin/MealList';
import { useMealManagement } from '@/hooks/useMealManagement';
import { useAdmin } from '@/hooks/useAdmin';
import { INITIAL_MEAL } from '@/types/meal';

const Admin = () => {
  const { isAdmin, meals, loading } = useAdmin();

  const {
    editingMeal,
    formData,
    setEditingMeal,
    handleInputChange,
    handleEditMeal,
    handleSaveMeal,
    handleDeleteMeal,
    handleImageUpload,
  } = useMealManagement(() => {});

  if (loading) {
    return (
      <div className="min-h-screen bg-quantum-black text-white flex items-center justify-center">
        <div className="text-quantum-cyan text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 px-4 container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-quantum-cyan neon-text">Admin Dashboard</h1>
          <Button 
            onClick={() => setEditingMeal(null)}
            className="cyber-button"
          >
            Create New Meal
          </Button>
        </div>
        
        {isAdmin ? (
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
        ) : (
          <Card className="p-6 max-w-md mx-auto">
            <p className="text-center text-red-400">Access denied. You need admin privileges.</p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Admin;


import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MealForm from './MealForm';
import MealList from './MealList';
import CurrencySettings from './CurrencySettings';
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
      
      <Tabs defaultValue="meals" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="meals">Meals Management</TabsTrigger>
          <TabsTrigger value="currency">Currency Settings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="meals">
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
        </TabsContent>
        
        <TabsContent value="currency">
          <CurrencySettings />
        </TabsContent>
        
        <TabsContent value="reviews">
          <div className="bg-quantum-black border border-quantum-cyan/30 p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-quantum-cyan mb-4">Review Management</h2>
            <p className="text-gray-400">
              Visit the dedicated reviews page to manage customer reviews.
            </p>
            <Button className="mt-4" onClick={() => window.location.href = '/admin/reviews'}>
              Go to Reviews
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

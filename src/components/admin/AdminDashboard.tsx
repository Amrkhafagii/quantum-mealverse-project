
import React, { useState } from 'react';
import MealList from './MealList';
import MealForm from './MealForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { MealType } from '@/types/meal';
import { useMealManagement } from '@/hooks/useMealManagement';
import CurrencySettings from './CurrencySettings';

interface AdminDashboardProps {
  meals: MealType[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ meals }) => {
  const { 
    editingMeal, 
    formData, 
    setEditingMeal, 
    handleInputChange, 
    handleFormDataChange,
    handleEditMeal, 
    handleSaveMeal, 
    handleDeleteMeal,
    handleImageUpload
  } = useMealManagement(() => {
    // This is a placeholder for the fetchMeals function that will be called after updates
    // In a real application, this would refetch the meals from the server
    console.log("Meal updated, would normally refetch meals here");
    // Since we can't directly modify the meals prop, we'd typically use a hook or context here
  });

  const [activeTab, setActiveTab] = useState("meals");

  const handleCancelEdit = () => {
    setEditingMeal(null);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-quantum-cyan neon-text">Admin Dashboard</h1>
      
      <Tabs defaultValue="meals" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="meals">Meals</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="meals" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <MealForm 
                formData={formData}
                editingMeal={editingMeal}
                onInputChange={handleInputChange}
                onFormDataChange={handleFormDataChange}
                onSave={handleSaveMeal}
                onCancel={handleCancelEdit}
                onImageUpload={handleImageUpload}
              />
            </div>
            
            <div>
              <MealList 
                meals={meals} 
                onEdit={handleEditMeal} 
                onDelete={handleDeleteMeal}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card className="p-6 holographic-card">
            <h2 className="text-2xl font-bold text-quantum-cyan mb-4">Settings</h2>
            <CurrencySettings />
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews">
          <Card className="p-6 holographic-card">
            <h2 className="text-2xl font-bold text-quantum-cyan mb-4">Reviews Management</h2>
            <p>Go to the <a href="/admin/reviews" className="text-quantum-cyan underline">Reviews Management</a> page to moderate and respond to customer reviews.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

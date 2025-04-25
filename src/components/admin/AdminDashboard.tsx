
import React, { useState } from 'react';
import MealList from './MealList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import CurrencySettings from './CurrencySettings';

interface AdminDashboardProps {
  meals: MealType[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ meals }) => {
  const [activeTab, setActiveTab] = useState("meals");

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-quantum-cyan neon-text">Admin Dashboard</h1>
      
      <Tabs defaultValue="meals" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 max-w-md">
          <TabsTrigger value="meals">Meals</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="meals" className="space-y-6">
          <div>
            <Card className="p-6 mb-4 holographic-card">
              <h3 className="text-xl font-bold text-quantum-cyan mb-2">Meal Catalog</h3>
              <p className="text-muted-foreground">
                The meal management system has been removed. This is now a view-only catalog of available meals.
              </p>
            </Card>
            <MealList meals={meals} />
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card className="p-6 holographic-card">
            <h2 className="text-2xl font-bold text-quantum-cyan mb-4">Settings</h2>
            <CurrencySettings />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

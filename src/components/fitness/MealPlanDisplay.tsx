import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth'; 
import { MealPlan } from '@/types/food';
import { saveMealPlan as saveMealPlanToDb } from '@/services/mealPlan'; // Renamed import to avoid conflict

interface MealPlanDisplayProps {
  mealPlan: MealPlan;
  tdeeResult: any;
}

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ mealPlan, tdeeResult }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("meals");

  const handleSaveMealPlan = async () => {
    if (!user) {
      toast.error('You must be logged in to save a meal plan.');
      return;
    }

    if (!mealPlan || !tdeeResult) {
      toast.error('Meal plan or TDEE result is missing.');
      return;
    }

    const planName = `${tdeeResult.goal} plan (${tdeeResult.adjustedCalories} cal)`;

    try {
      const result = await saveMealPlanToDb(user.id, planName, mealPlan, tdeeResult);
      if (result.success) {
        toast.success('Meal plan saved successfully!');
      } else {
        toast.error(`Failed to save meal plan: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`Error saving meal plan: ${error.message}`);
    }
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Your Meal Plan</span>
          <Button onClick={handleSaveMealPlan} className="bg-quantum-purple hover:bg-quantum-purple/90">
            Save Meal Plan
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="bg-quantum-darkBlue/50 w-full justify-start">
            <TabsTrigger value="meals" onClick={() => setActiveTab("meals")}>Meals</TabsTrigger>
            <TabsTrigger value="summary" onClick={() => setActiveTab("summary")}>Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="meals" className="mt-6">
            <div className="space-y-4">
              {Object.keys(mealPlan.meals).map((mealType) => (
                <div key={mealType} className="bg-quantum-black/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold capitalize text-quantum-cyan">{mealType}</h3>
                  <ul className="list-disc pl-5 mt-2">
                    {mealPlan.meals[mealType].map((food, index) => (
                      <li key={index} className="text-gray-300">
                        {food.name} - {food.calories} kcal
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="summary" className="mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-900/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm text-gray-400">Total Calories</CardTitle>
                      <CardContent className="text-2xl font-semibold">{mealPlan.totalCalories} kcal</CardContent>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-900/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm text-gray-400">Protein</CardTitle>
                      <CardContent className="text-2xl font-semibold">{mealPlan.targetProtein}g</CardContent>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-900/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm text-gray-400">Carbs</CardTitle>
                      <CardContent className="text-2xl font-semibold">{mealPlan.targetCarbs}g</CardContent>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-900/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm text-gray-400">Fats</CardTitle>
                      <CardContent className="text-2xl font-semibold">{mealPlan.targetFat}g</CardContent>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-900/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-400" />
                      <div>
                        <CardTitle className="text-sm text-gray-400">Water</CardTitle>
                        <CardContent className="text-2xl font-semibold">{mealPlan.hydrationTarget} ml</CardContent>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-orange-900/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-400" />
                      <div>
                        <CardTitle className="text-sm text-gray-400">Meal Count</CardTitle>
                        <CardContent className="text-2xl font-semibold">{Object.keys(mealPlan.meals).length}</CardContent>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MealPlanDisplay;

// Define TDEEResult interface if it's used in this component
interface TDEEResult {
  tdee: number;
  bmr: number;
  goal: string;
  adjustedCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
}

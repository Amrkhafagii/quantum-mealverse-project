
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TDEEResult } from './TDEECalculator';
import { MealPlan } from '@/types/food';
import { saveMealPlan } from '@/services/mealPlan/mealPlanApi';
import { useMealPlanOrders } from '@/hooks/useMealPlanOrders';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Target, 
  Zap, 
  Heart, 
  Activity, 
  ShoppingCart,
  Utensils,
  CheckCircle 
} from 'lucide-react';

interface NutritionDashboardProps {
  calculationResult: TDEEResult;
  mealPlan: MealPlan;
  onUpdateMealPlan: (updatedPlan: MealPlan) => void;
}

const NutritionDashboard: React.FC<NutritionDashboardProps> = ({
  calculationResult,
  mealPlan,
  onUpdateMealPlan
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createMealPlanOrder } = useMealPlanOrders();
  const [saving, setSaving] = useState(false);
  const [ordering, setOrdering] = useState(false);

  const handleOrderMealPlan = async () => {
    if (!user) {
      toast.error('Please log in to order your meal plan');
      return;
    }

    try {
      setOrdering(true);

      // Calculate total nutritional information from meal plan
      const totalNutrition = Object.entries(mealPlan.meals).reduce(
        (totals, [day, dayMeals]) => {
          Object.entries(dayMeals).forEach(([mealType, meal]) => {
            totals.calories += meal.calories || 0;
            totals.protein += meal.protein || 0;
            totals.carbs += meal.carbs || 0;
            totals.fats += meal.fats || 0;
            totals.fiber += meal.fiber || 0;
            totals.sugar += meal.sugar || 0;
            totals.sodium += meal.sodium || 0;
          });
          return totals;
        },
        { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 0 }
      );

      // Create meal plan order with nutritional information preserved
      const orderItems = Object.entries(mealPlan.meals).flatMap(([day, dayMeals]) => 
        Object.entries(dayMeals).map(([mealType, meal]) => ({
          mealId: `${day}-${mealType}`,
          quantity: 1,
          nutritionalInfo: {
            calories: meal.calories || 0,
            protein: meal.protein || 0,
            carbs: meal.carbs || 0,
            fats: meal.fats || 0,
            fiber: meal.fiber || 0,
            sugar: meal.sugar || 0,
            sodium: meal.sodium || 0
          }
        }))
      );

      const mealPlanOrder = await createMealPlanOrder({
        mealPlanId: `plan-${Date.now()}`,
        orderId: `order-${Date.now()}`,
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: orderItems,
        estimatedDeliveryTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        notes: 'Custom meal plan order with preserved nutritional information',
        totalNutrition
      });

      if (mealPlanOrder) {
        toast.success('Meal plan ordered successfully!');
        navigate(`/meal-plan-confirmation/${mealPlanOrder.id}`);
      } else {
        throw new Error('Failed to create meal plan order');
      }
    } catch (error) {
      console.error('Error ordering meal plan:', error);
      toast.error('Failed to order meal plan. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  const calculateMacroProgress = (actual: number, target: number) => {
    return Math.min((actual / target) * 100, 100);
  };

  const handleSaveMealPlan = async () => {
    if (!user) {
      toast.error('Please log in to save your meal plan');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await saveMealPlan(
        user.id,
        `Meal Plan - ${new Date().toLocaleDateString()}`,
        mealPlan
      );

      if (error) {
        throw error;
      }

      toast.success('Meal plan saved successfully!');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast.error('Failed to save meal plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-quantum-cyan flex items-center gap-2">
                <Utensils className="h-6 w-6" />
                Your Personalized Meal Plan
              </CardTitle>
              <p className="text-gray-400 mt-2">
                Customized for your {calculationResult.goal} goal
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSaveMealPlan}
                disabled={saving}
                variant="outline"
                className="border-quantum-purple text-quantum-purple hover:bg-quantum-purple/10"
              >
                {saving ? 'Saving...' : 'Save Plan'}
              </Button>
              <Button
                onClick={handleOrderMealPlan}
                disabled={ordering}
                className="bg-quantum-purple hover:bg-quantum-purple/90 flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                {ordering ? 'Ordering...' : 'Order Meal Plan'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* TDEE & Goals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-quantum-cyan" />
              <h3 className="font-semibold text-quantum-cyan">Daily Calories</h3>
            </div>
            <div className="text-2xl font-bold text-white">
              {calculationResult.adjustedCalories.toLocaleString()}
            </div>
            <p className="text-sm text-gray-400">kcal/day</p>
          </CardContent>
        </Card>

        <Card className="bg-quantum-darkBlue/30 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-green-500">Protein</h3>
            </div>
            <div className="text-2xl font-bold text-white">
              {calculationResult.proteinGrams}g
            </div>
            <p className="text-sm text-gray-400">daily target</p>
          </CardContent>
        </Card>

        <Card className="bg-quantum-darkBlue/30 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-yellow-500">Carbs</h3>
            </div>
            <div className="text-2xl font-bold text-white">
              {calculationResult.carbsGrams}g
            </div>
            <p className="text-sm text-gray-400">daily target</p>
          </CardContent>
        </Card>

        <Card className="bg-quantum-darkBlue/30 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-red-500">Fats</h3>
            </div>
            <div className="text-2xl font-bold text-white">
              {calculationResult.fatsGrams}g
            </div>
            <p className="text-sm text-gray-400">daily target</p>
          </CardContent>
        </Card>
      </div>

      {/* Meal Plan Display */}
      <Tabs defaultValue="day1" className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-quantum-darkBlue/50">
          {Object.keys(mealPlan.meals).map((day) => (
            <TabsTrigger key={day} value={day} className="text-xs">
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(mealPlan.meals).map(([day, dayMeals]) => (
          <TabsContent key={day} value={day} className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(dayMeals).map(([mealType, meal]) => (
                <Card key={mealType} className="bg-quantum-darkBlue/30 border-quantum-purple/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg capitalize text-quantum-purple">
                      {mealType}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <h4 className="font-medium text-white">{meal.name}</h4>
                    <p className="text-sm text-gray-400">{meal.description}</p>
                    
                    {/* Nutritional Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center p-2 bg-quantum-black/30 rounded">
                        <div className="text-lg font-semibold text-green-500">{meal.calories || 0}</div>
                        <div className="text-xs text-gray-400">Calories</div>
                      </div>
                      <div className="text-center p-2 bg-quantum-black/30 rounded">
                        <div className="text-lg font-semibold text-blue-500">{meal.protein || 0}g</div>
                        <div className="text-xs text-gray-400">Protein</div>
                      </div>
                      <div className="text-center p-2 bg-quantum-black/30 rounded">
                        <div className="text-lg font-semibold text-yellow-500">{meal.carbs || 0}g</div>
                        <div className="text-xs text-gray-400">Carbs</div>
                      </div>
                      <div className="text-center p-2 bg-quantum-black/30 rounded">
                        <div className="text-lg font-semibold text-red-500">{meal.fats || 0}g</div>
                        <div className="text-xs text-gray-400">Fats</div>
                      </div>
                    </div>

                    {/* Macro Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Protein Progress</span>
                        <span>{Math.round(calculateMacroProgress(meal.protein || 0, calculationResult.proteinGrams))}%</span>
                      </div>
                      <Progress 
                        value={calculateMacroProgress(meal.protein || 0, calculationResult.proteinGrams)} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Daily Totals */}
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader>
                <CardTitle className="text-quantum-cyan">Daily Totals - {day.charAt(0).toUpperCase() + day.slice(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {Object.values(dayMeals).reduce((sum, meal) => sum + (meal.calories || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-400">Total Calories</div>
                    <div className="text-xs text-gray-500">
                      Target: {calculationResult.adjustedCalories}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {Object.values(dayMeals).reduce((sum, meal) => sum + (meal.protein || 0), 0)}g
                    </div>
                    <div className="text-sm text-gray-400">Total Protein</div>
                    <div className="text-xs text-gray-500">
                      Target: {calculationResult.proteinGrams}g
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {Object.values(dayMeals).reduce((sum, meal) => sum + (meal.carbs || 0), 0)}g
                    </div>
                    <div className="text-sm text-gray-400">Total Carbs</div>
                    <div className="text-xs text-gray-500">
                      Target: {calculationResult.carbsGrams}g
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {Object.values(dayMeals).reduce((sum, meal) => sum + (meal.fats || 0), 0)}g
                    </div>
                    <div className="text-sm text-gray-400">Total Fats</div>
                    <div className="text-xs text-gray-500">
                      Target: {calculationResult.fatsGrams}g
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Order CTA */}
      <Card className="bg-gradient-to-r from-quantum-purple/20 to-quantum-cyan/20 border-quantum-purple/40">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h3 className="text-xl font-bold text-white">Ready to Start Your Journey?</h3>
          </div>
          <p className="text-gray-300 mb-6">
            Your personalized meal plan is ready! Order now to have nutritionally balanced meals 
            delivered to your door with full nutritional tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleOrderMealPlan}
              disabled={ordering}
              className="bg-quantum-purple hover:bg-quantum-purple/90 flex items-center gap-2"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5" />
              {ordering ? 'Processing Order...' : 'Order Complete Meal Plan'}
            </Button>
            <Button
              onClick={handleSaveMealPlan}
              disabled={saving}
              variant="outline"
              className="border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10"
              size="lg"
            >
              {saving ? 'Saving...' : 'Save for Later'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionDashboard;

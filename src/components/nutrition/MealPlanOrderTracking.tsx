
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, ChefHat, Package, Truck, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MealPlanOrderTrackingProps {
  orderId: string;
}

interface PreparationStep {
  id: string;
  stepName: string;
  stepDescription: string;
  estimatedDurationMinutes: number;
  actualDurationMinutes?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

interface MealPlanOrderItem {
  id: string;
  mealName: string;
  quantity: number;
  preparationStatus: 'pending' | 'preparing' | 'ready' | 'packaged' | 'delivered';
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatsPerServing: number;
  preparationSteps: PreparationStep[];
}

interface MealPlanOrderData {
  id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryDate: string;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  items: MealPlanOrderItem[];
}

export const MealPlanOrderTracking: React.FC<MealPlanOrderTrackingProps> = ({ orderId }) => {
  const [orderData, setOrderData] = useState<MealPlanOrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderData();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('meal_plan_order_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'meal_plan_orders',
        filter: `id=eq.${orderId}`
      }, () => {
        fetchOrderData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      // Fetch meal plan order with items and preparation progress
      const { data: orderData, error: orderError } = await supabase
        .from('meal_plan_orders')
        .select(`
          *,
          meal_plan_order_items (
            id,
            quantity,
            preparation_status,
            calories_per_serving,
            protein_per_serving,
            carbs_per_serving,
            fats_per_serving,
            meals (
              name
            ),
            meal_preparation_progress (
              id,
              step_name,
              step_description,
              estimated_duration_minutes,
              actual_duration_minutes,
              status,
              started_at,
              completed_at,
              notes
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      if (orderData) {
        const formattedData: MealPlanOrderData = {
          id: orderData.id,
          status: orderData.status,
          deliveryDate: orderData.delivery_date,
          estimatedDeliveryTime: orderData.estimated_delivery_time,
          actualDeliveryTime: orderData.actual_delivery_time,
          totalCalories: orderData.total_calories || 0,
          totalProtein: orderData.total_protein || 0,
          totalCarbs: orderData.total_carbs || 0,
          totalFats: orderData.total_fats || 0,
          items: orderData.meal_plan_order_items.map((item: any) => ({
            id: item.id,
            mealName: item.meals?.name || 'Unknown Meal',
            quantity: item.quantity,
            preparationStatus: item.preparation_status,
            caloriesPerServing: item.calories_per_serving || 0,
            proteinPerServing: item.protein_per_serving || 0,
            carbsPerServing: item.carbs_per_serving || 0,
            fatsPerServing: item.fats_per_serving || 0,
            preparationSteps: item.meal_preparation_progress || []
          }))
        };

        setOrderData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
      case 'preparing':
        return <ChefHat className="h-5 w-5 text-yellow-500" />;
      case 'ready':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getOverallProgress = () => {
    if (!orderData) return 0;
    
    const totalSteps = orderData.items.reduce((acc, item) => acc + item.preparationSteps.length, 0);
    const completedSteps = orderData.items.reduce((acc, item) => 
      acc + item.preparationSteps.filter(step => step.status === 'completed').length, 0
    );
    
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-quantum-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-purple"></div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-quantum-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-400">We couldn't find an order with this ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-quantum-cyan">
                <Truck className="h-6 w-6" />
                Meal Plan Order Tracking
              </CardTitle>
              <Badge variant="outline" className="text-quantum-purple border-quantum-purple">
                Order #{orderId.slice(-8)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(orderData.status)}
              <span className="font-medium">Status: {orderData.status.toUpperCase()}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(getOverallProgress())}%</span>
              </div>
              <Progress value={getOverallProgress()} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Nutritional Overview */}
        <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20">
          <CardHeader>
            <CardTitle className="text-quantum-purple">Order Nutrition Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-quantum-black/30 rounded-lg">
                <div className="text-xl font-bold text-green-500">{orderData.totalCalories}</div>
                <div className="text-sm text-gray-400">Total Calories</div>
              </div>
              <div className="text-center p-3 bg-quantum-black/30 rounded-lg">
                <div className="text-xl font-bold text-blue-500">{orderData.totalProtein}g</div>
                <div className="text-sm text-gray-400">Total Protein</div>
              </div>
              <div className="text-center p-3 bg-quantum-black/30 rounded-lg">
                <div className="text-xl font-bold text-yellow-500">{orderData.totalCarbs}g</div>
                <div className="text-sm text-gray-400">Total Carbs</div>
              </div>
              <div className="text-center p-3 bg-quantum-black/30 rounded-lg">
                <div className="text-xl font-bold text-red-500">{orderData.totalFats}g</div>
                <div className="text-sm text-gray-400">Total Fats</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Preparation Progress */}
        <div className="grid gap-6">
          {orderData.items.map((item) => (
            <Card key={item.id} className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-quantum-cyan">{item.mealName}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">x{item.quantity}</Badge>
                    <Badge 
                      variant={item.preparationStatus === 'delivered' ? 'default' : 'secondary'}
                      className={item.preparationStatus === 'delivered' ? 'bg-green-500' : ''}
                    >
                      {item.preparationStatus.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  {item.caloriesPerServing} cal • {item.proteinPerServing}g protein • 
                  {item.carbsPerServing}g carbs • {item.fatsPerServing}g fats per serving
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.preparationSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 p-3 bg-quantum-black/20 rounded-lg">
                      <div className="flex-shrink-0">
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : step.status === 'in_progress' ? (
                          <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{step.stepName}</h4>
                        <p className="text-sm text-gray-400">{step.stepDescription}</p>
                        {step.notes && (
                          <p className="text-xs text-quantum-purple mt-1">{step.notes}</p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gray-400">
                          {step.actualDurationMinutes ? `${step.actualDurationMinutes}min` : `~${step.estimatedDurationMinutes}min`}
                        </div>
                        {step.completedAt && (
                          <div className="text-xs text-green-500">
                            {new Date(step.completedAt).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delivery Information */}
        <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-quantum-purple">
              <MapPin className="h-5 w-5" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Delivery Date:</span>
              <span>{new Date(orderData.deliveryDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Time:</span>
              <span>{new Date(orderData.estimatedDeliveryTime).toLocaleTimeString()}</span>
            </div>
            {orderData.actualDeliveryTime && (
              <div className="flex justify-between">
                <span>Actual Delivery:</span>
                <span className="text-green-500">
                  {new Date(orderData.actualDeliveryTime).toLocaleTimeString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

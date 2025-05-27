
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MealPlanOrderConfirmation } from '@/components/nutrition/MealPlanOrderConfirmation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function MealPlanOrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId, user, navigate]);

  const fetchOrderData = async () => {
    if (!orderId) return;

    try {
      const { data, error } = await supabase
        .from('meal_plan_orders')
        .select(`
          *,
          meal_plan_order_items (
            id,
            quantity,
            calories_per_serving,
            protein_per_serving,
            carbs_per_serving,
            fats_per_serving,
            meals (
              name
            )
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        const formattedData = {
          id: data.id,
          mealPlanName: 'Custom Meal Plan',
          deliveryDate: data.delivery_date,
          estimatedDeliveryTime: data.estimated_delivery_time,
          totalCalories: data.total_calories || 0,
          totalProtein: data.total_protein || 0,
          totalCarbs: data.total_carbs || 0,
          totalFats: data.total_fats || 0,
          totalFiber: data.total_fiber || 0,
          totalSugar: data.total_sugar || 0,
          totalSodium: data.total_sodium || 0,
          items: data.meal_plan_order_items.map((item: any) => ({
            id: item.id,
            mealName: item.meals?.name || 'Unknown Meal',
            quantity: item.quantity,
            calories: item.calories_per_serving || 0,
            protein: item.protein_per_serving || 0,
            carbs: item.carbs_per_serving || 0,
            fats: item.fats_per_serving || 0
          })),
          deliveryAddress: '123 Main St, City, State',
          orderTotal: 29.99
        };

        setOrderData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
      navigate('/nutrition');
    } finally {
      setLoading(false);
    }
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
          <p className="text-gray-400">We couldn't find this order.</p>
        </div>
      </div>
    );
  }

  return <MealPlanOrderConfirmation orderData={orderData} />;
}

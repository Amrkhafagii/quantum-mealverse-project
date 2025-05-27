
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MealPlanOrderConfirmationProps {
  orderData: {
    id: string;
    mealPlanName: string;
    deliveryDate: string;
    estimatedDeliveryTime: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    totalFiber: number;
    totalSugar: number;
    totalSodium: number;
    items: Array<{
      id: string;
      mealName: string;
      quantity: number;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    }>;
    deliveryAddress: string;
    orderTotal: number;
  };
}

export const MealPlanOrderConfirmation: React.FC<MealPlanOrderConfirmationProps> = ({ orderData }) => {
  const navigate = useNavigate();

  const handleTrackOrder = () => {
    navigate(`/meal-plan-tracking/${orderData.id}`);
  };

  const handleViewNutrition = () => {
    navigate('/nutrition');
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="bg-quantum-darkBlue/30 border-green-500/20">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-500 mb-2">Order Confirmed!</h1>
            <p className="text-xl mb-4">Your meal plan has been successfully ordered</p>
            <Badge variant="outline" className="text-green-500 border-green-500">
              Order ID: {orderData.id}
            </Badge>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-quantum-cyan">
              <Calendar className="h-5 w-5" />
              {orderData.mealPlanName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-quantum-purple" />
                <span>Delivery Date: {new Date(orderData.deliveryDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-quantum-purple" />
                <span>Est. Time: {new Date(orderData.estimatedDeliveryTime).toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-quantum-purple" />
              <span>{orderData.deliveryAddress}</span>
            </div>
          </CardContent>
        </Card>

        {/* Nutritional Summary */}
        <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20">
          <CardHeader>
            <CardTitle className="text-quantum-purple">Nutritional Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-quantum-black/30 rounded-lg">
                <div className="text-2xl font-bold text-green-500">{orderData.totalCalories}</div>
                <div className="text-sm text-gray-400">Calories</div>
              </div>
              <div className="text-center p-4 bg-quantum-black/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{orderData.totalProtein}g</div>
                <div className="text-sm text-gray-400">Protein</div>
              </div>
              <div className="text-center p-4 bg-quantum-black/30 rounded-lg">
                <div className="text-2xl font-bold text-yellow-500">{orderData.totalCarbs}g</div>
                <div className="text-sm text-gray-400">Carbs</div>
              </div>
              <div className="text-center p-4 bg-quantum-black/30 rounded-lg">
                <div className="text-2xl font-bold text-red-500">{orderData.totalFats}g</div>
                <div className="text-sm text-gray-400">Fats</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-quantum-black/20 rounded">
                <div className="text-lg font-semibold text-quantum-cyan">{orderData.totalFiber}g</div>
                <div className="text-xs text-gray-400">Fiber</div>
              </div>
              <div className="text-center p-3 bg-quantum-black/20 rounded">
                <div className="text-lg font-semibold text-quantum-cyan">{orderData.totalSugar}g</div>
                <div className="text-xs text-gray-400">Sugar</div>
              </div>
              <div className="text-center p-3 bg-quantum-black/20 rounded">
                <div className="text-lg font-semibold text-quantum-cyan">{orderData.totalSodium}mg</div>
                <div className="text-xs text-gray-400">Sodium</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Items */}
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle className="text-quantum-cyan">Your Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-quantum-black/20 rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.mealName}</h4>
                    <p className="text-sm text-gray-400">
                      {item.calories} cal • {item.protein}g protein • {item.carbs}g carbs • {item.fats}g fats
                    </p>
                  </div>
                  <Badge variant="outline">x{item.quantity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleTrackOrder}
            className="flex-1 bg-quantum-purple hover:bg-quantum-purple/90"
          >
            Track Your Order
          </Button>
          <Button 
            onClick={handleViewNutrition}
            variant="outline"
            className="flex-1 border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10"
          >
            View Nutrition Plans
          </Button>
        </div>
      </div>
    </div>
  );
};

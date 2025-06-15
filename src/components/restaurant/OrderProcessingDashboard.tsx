import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplexMealOrderService } from '@/services/orderProcessing/complexMealOrderService';
import {
  ComplexMealOrder,
  IngredientAvailabilityCheck,
  PreparationInstruction,
  OrderComplexityAnalysis,
} from '@/types/complexOrder';

interface OrderProcessingDashboardProps {
  orderId: string;
  restaurantId: string;
  mealIds: string[];
}

export const OrderProcessingDashboard: React.FC<OrderProcessingDashboardProps> = ({
  orderId,
  restaurantId,
  mealIds,
}) => {
  const [orderResult, setOrderResult] = useState<ComplexMealOrder | null>(null);
  const [ingredientAvailability, setIngredientAvailability] = useState<IngredientAvailabilityCheck[]>([]);
  const [preparationInstructions, setPreparationInstructions] = useState<PreparationInstruction[]>([]);
  const [orderComplexity, setOrderComplexity] = useState<OrderComplexityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate fetching order processing details
        const orderResult = await ComplexMealOrderService.processComplexOrder(
          orderId,
          restaurantId,
          mealIds
        );
        setOrderResult(orderResult);

        // Simulate fetching ingredient availability
        const ingredientAvailability: IngredientAvailabilityCheck[] = [
          { ingredientId: 'tomato', available: true, requiredAmount: 2, stockAmount: 10 },
          { ingredientId: 'cheese', available: false, requiredAmount: 1, stockAmount: 0 },
        ];
        setIngredientAvailability(ingredientAvailability);

        // Simulate fetching preparation instructions
        const preparationInstructions: PreparationInstruction[] = [
          { stepNumber: 1, instruction: 'Cut vegetables', estimatedTimeMinutes: 5 },
          { stepNumber: 2, instruction: 'Cook meat', estimatedTimeMinutes: 10 },
        ];
        setPreparationInstructions(preparationInstructions);

        // Simulate fetching order complexity analysis
        const orderComplexity: OrderComplexityAnalysis = {
          orderId: orderId,
          totalSteps: 15,
          estimatedDurationMinutes: 30,
          kitchenUtilizationIndex: 0.75,
          blockingIngredients: ['cheese'],
        };
        setOrderComplexity(orderComplexity);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, restaurantId, mealIds]);

  if (loading) {
    return <p>Loading order processing details...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Processing Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orderResult && (
          <div>
            <h3 className="text-lg font-semibold">Order Status: {orderResult.status}</h3>
            <p>Message: {orderResult.resultMessage}</p>
          </div>
        )}

        <div>
          <h4 className="text-md font-semibold">Ingredient Availability</h4>
          <ul>
            {ingredientAvailability.map((item) => (
              <li key={item.ingredientId}>
                {item.ingredientId}: {item.available ? 'Available' : 'Not Available'}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-md font-semibold">Preparation Instructions</h4>
          <ol className="list-decimal pl-5">
            {preparationInstructions.map((step) => (
              <li key={step.stepNumber}>{step.instruction}</li>
            ))}
          </ol>
        </div>

        {orderComplexity && (
          <div>
            <h4 className="text-md font-semibold">Order Complexity Analysis</h4>
            <p>Total Steps: {orderComplexity.totalSteps}</p>
            <p>Estimated Duration: {orderComplexity.estimatedDurationMinutes} minutes</p>
            <p>Kitchen Utilization Index: {orderComplexity.kitchenUtilizationIndex}</p>
            <p>Blocking Ingredients: {orderComplexity.blockingIngredients.join(', ')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

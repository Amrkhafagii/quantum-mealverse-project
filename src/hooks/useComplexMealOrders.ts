
import { useState, useEffect } from 'react';
import { ComplexMealOrderService, IngredientAvailabilityCheck, PreparationInstruction, OrderComplexityAnalysis } from '@/services/orderProcessing/complexMealOrderService';

export interface ComplexMealOrderData {
  availabilityChecks: IngredientAvailabilityCheck[];
  cookingInstructions: PreparationInstruction[];
  complexityAnalysis: OrderComplexityAnalysis | null;
  canFulfill: boolean;
  loading: boolean;
  error: string | null;
}

export const useComplexMealOrders = (orderId?: string, restaurantId?: string, mealIds?: string[]) => {
  const [data, setData] = useState<ComplexMealOrderData>({
    availabilityChecks: [],
    cookingInstructions: [],
    complexityAnalysis: null,
    canFulfill: false,
    loading: false,
    error: null
  });

  const processOrder = async (orderIdParam?: string, restaurantIdParam?: string, mealIdsParam?: string[]) => {
    const finalOrderId = orderIdParam || orderId;
    const finalRestaurantId = restaurantIdParam || restaurantId;
    const finalMealIds = mealIdsParam || mealIds;

    if (!finalOrderId || !finalRestaurantId || !finalMealIds || finalMealIds.length === 0) {
      setData(prev => ({ ...prev, error: 'Missing required parameters' }));
      return;
    }

    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await ComplexMealOrderService.processComplexMealOrder(
        finalOrderId,
        finalRestaurantId,
        finalMealIds
      );

      setData({
        availabilityChecks: result.availabilityChecks,
        cookingInstructions: result.cookingInstructions,
        complexityAnalysis: result.complexityAnalysis,
        canFulfill: result.canFulfill,
        loading: false,
        error: null
      });

      return result;
    } catch (error) {
      console.error('Error processing complex meal order:', error);
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to process order' 
      }));
      throw error;
    }
  };

  const checkIngredientAvailability = async (orderIdParam?: string, restaurantIdParam?: string, mealIdsParam?: string[]) => {
    const finalOrderId = orderIdParam || orderId;
    const finalRestaurantId = restaurantIdParam || restaurantId;
    const finalMealIds = mealIdsParam || mealIds;

    if (!finalOrderId || !finalRestaurantId || !finalMealIds || finalMealIds.length === 0) {
      throw new Error('Missing required parameters');
    }

    return await ComplexMealOrderService.checkIngredientAvailability(
      finalOrderId,
      finalRestaurantId,
      finalMealIds
    );
  };

  const generateCookingInstructions = async (orderIdParam?: string, mealIdsParam?: string[]) => {
    const finalOrderId = orderIdParam || orderId;
    const finalMealIds = mealIdsParam || mealIds;

    if (!finalOrderId || !finalMealIds || finalMealIds.length === 0) {
      throw new Error('Missing required parameters');
    }

    return await ComplexMealOrderService.generateCookingInstructions(
      finalOrderId,
      finalMealIds
    );
  };

  const calculatePreparationTime = async (restaurantIdParam?: string, mealIdsParam?: string[]) => {
    const finalRestaurantId = restaurantIdParam || restaurantId;
    const finalMealIds = mealIdsParam || mealIds;

    if (!finalRestaurantId || !finalMealIds || finalMealIds.length === 0) {
      throw new Error('Missing required parameters');
    }

    return await ComplexMealOrderService.calculatePreparationTime(
      finalRestaurantId,
      finalMealIds
    );
  };

  // Auto-process when all required params are available
  useEffect(() => {
    if (orderId && restaurantId && mealIds && mealIds.length > 0) {
      processOrder();
    }
  }, [orderId, restaurantId, mealIds]);

  return {
    data,
    processOrder,
    checkIngredientAvailability,
    generateCookingInstructions,
    calculatePreparationTime
  };
};

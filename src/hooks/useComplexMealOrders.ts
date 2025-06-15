
import { useState, useCallback } from 'react';
import { ComplexMealOrder, ComplexMealOrderResult, ProcessComplexOrderFn } from '@/types/complexOrder';
import { ComplexMealOrderService } from '@/services/orderProcessing/complexMealOrderService';

export function useComplexMealOrders(
  orderId: string,
  restaurantId: string,
  mealIds: string[],
) {
  const [data, setData] = useState<ComplexMealOrderResult>({
    loading: false,
    error: null,
    data: null,
  });

  const processOrder: ProcessComplexOrderFn = useCallback(
    async (orderIdArg, restaurantIdArg, mealIdsArg) => {
      setData({ loading: true, error: null, data: null });
      try {
        const order = await ComplexMealOrderService.processComplexOrder(
          orderIdArg,
          restaurantIdArg,
          mealIdsArg,
        );
        setData({ loading: false, error: null, data: order });
      } catch (error) {
        setData({
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: null,
        });
      }
    },
    []
  );

  // Optionally, auto-process if all ids supplied and ready
  // useEffect(() => {
  //   if (orderId && restaurantId && mealIds.length > 0) {
  //     processOrder(orderId, restaurantId, mealIds);
  //   }
  // }, [orderId, restaurantId, mealIds, processOrder]);

  return { data, processOrder };
}

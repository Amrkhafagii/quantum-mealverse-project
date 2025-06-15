
import { ComplexMealOrder } from '@/types/complexOrder';

export const ComplexMealOrderService = {
  async processComplexOrder(
    orderId: string,
    restaurantId: string,
    mealIds: string[]
  ): Promise<ComplexMealOrder> {
    // Place actual API/network logic here
    // Simulate a delay and always return a 'completed' result for demo
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      id: orderId,
      restaurantId,
      mealIds,
      status: "completed",
      resultMessage: "Order processed successfully",
    };
  },
};

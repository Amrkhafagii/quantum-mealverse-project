
export interface ComplexMealOrder {
  id: string;
  restaurantId: string;
  mealIds: string[];
  status: "pending" | "processing" | "completed" | "failed";
  resultMessage?: string;
}

export interface ComplexMealOrderResult {
  loading: boolean;
  error: string | null;
  data: ComplexMealOrder | null;
}

export type ProcessComplexOrderFn = (
  orderId: string,
  restaurantId: string,
  mealIds: string[]
) => Promise<void>;

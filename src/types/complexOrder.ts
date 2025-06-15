
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

// Add the missing type definitions.
export interface IngredientAvailabilityCheck {
  ingredientId: string;
  available: boolean;
  requiredAmount: number;
  stockAmount: number;
}

export interface PreparationInstruction {
  stepNumber: number;
  instruction: string;
  estimatedTimeMinutes?: number;
  dependencies?: number[];
}

export interface OrderComplexityAnalysis {
  orderId: string;
  totalSteps: number;
  estimatedDurationMinutes: number;
  kitchenUtilizationIndex: number;
  blockingIngredients: string[];
}


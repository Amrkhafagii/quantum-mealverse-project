
export interface ARMealPreviewProps {
  mealName: string;
  mealId?: string;
  className?: string;
  modelName?: string;
  rating?: number;
}

// Re-export to help with imports
export * from '../components/ARMealPreview';

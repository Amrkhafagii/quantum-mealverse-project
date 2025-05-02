
export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: number; // in grams
  isGloballyAvailable: boolean;
  costTier: 1 | 2 | 3; // 1 = budget-friendly, 3 = expensive
  imageUrl?: string;
}

export type FoodCategory = 
  | 'protein' 
  | 'carbs' 
  | 'fats' 
  | 'vegetables' 
  | 'fruits' 
  | 'dairy' 
  | 'snacks';

export interface Meal {
  id: string;
  name: string;
  foods: MealFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealFood {
  food: Food;
  portionSize: number; // in grams
}

export interface MealPlan {
  id?: string;
  userId?: string;
  date?: string;
  goal: string;
  totalCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  actualProtein?: number;
  actualCarbs?: number;
  actualFat?: number;
  meals: Meal[];
  hydrationTarget: number; // in ml
}

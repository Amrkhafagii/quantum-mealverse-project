// Food and nutrition types for the meal planning system
export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: number; // portion size in grams
  isGloballyAvailable?: boolean;
  costTier?: number; // 1-5 scale for cost
  cookingState?: CookingState;
  mealSuitability?: string[]; // breakfast, lunch, dinner, snack
}

export interface MealFood {
  food: Food;
  portionSize: number; // in grams
}

export interface Meal {
  id: string;
  name: string;
  foods: MealFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealPlan {
  id?: string;
  userId?: string;
  meals: Meal[];
  totalCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  actualProtein?: number;
  actualCarbs?: number;
  actualFat?: number;
  hydrationTarget?: number;
  dateCreated?: string;
  name?: string;
}

export type FoodCategory = 'protein' | 'carbs' | 'fats' | 'vegetables' | 'fruits';

export type CookingState = 'raw' | 'cooked' | 'processed';

// Nutrition data structure for API responses
export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  sodium?: number;
  servingSize?: number;
  servingSizeUnit?: string;
}

// USDA API specific types
export interface USDAFoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  publishedDate: string;
  foodNutrients: USDANutrient[];
  foodCategory?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
}

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  value: number;
  unitName: string;
}

// Meal distribution for planning
export interface MealDistribution {
  breakfast: number;
  lunch: number;
  dinner: number;
  snack: number;
}

// Dietary preferences and restrictions
export interface DietaryRestrictions {
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  nutFree?: boolean;
  lowCarb?: boolean;
  keto?: boolean;
  paleo?: boolean;
  allergies?: string[];
}

// Enhanced meal planning options
export interface MealPlanOptions {
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  mealCount: number;
  dietaryRestrictions?: DietaryRestrictions;
  preferredFoods?: string[];
  dislikedFoods?: string[];
  budgetTier?: number; // 1-5 scale
  cookingSkillLevel?: number; // 1-5 scale
}

// Water intake tracking
export interface HydrationTracking {
  target: number; // ml per day
  consumed: number; // ml consumed so far
  lastUpdated: string;
}

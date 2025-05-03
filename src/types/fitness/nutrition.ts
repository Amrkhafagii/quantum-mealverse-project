
export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  meal_plan: any;
  expires_at?: string;
  is_active: boolean;
  date_created?: string;
  tdee_id?: string;
}

export interface SavedMealPlanWithExpiry extends SavedMealPlan {
  // No additional fields needed as we've moved is_active to the base interface
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  points: number;
  type: string;
  requirements: any;
  completed: boolean;
  deadline?: string;
}

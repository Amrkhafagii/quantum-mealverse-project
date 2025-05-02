
// This file is kept as a placeholder but no longer contains subscription functionality
// It can be safely removed if not referenced elsewhere in the application

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  price: number;
  status: string;
  start_date: string;
  end_date: string | null;
  meals_per_week: number;
  created_at: string;
  updated_at: string;
}

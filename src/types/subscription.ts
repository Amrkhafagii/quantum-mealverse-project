
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
  is_trial?: boolean;
  trial_ends_at?: string;
}

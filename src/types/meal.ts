
export interface MealType {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  restaurant_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image_url?: string;
}

// Default values for initializing a new meal
export const INITIAL_MEAL: MealType = {
  id: '',
  name: '',
  description: '',
  price: 0,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  restaurant_id: '',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  image_url: undefined
};

// Sample initial meals for demo/testing
export const INITIAL_MEALS = [
  {
    name: 'Quantum Protein Bowl',
    description: 'High protein meal with grilled chicken, quinoa, and vegetables',
    price: 10.99,
    calories: 450,
    protein: 35,
    carbs: 40,
    fat: 15,
    is_active: true
  },
  {
    name: 'Fusion Energy Salad',
    description: 'Mixed greens with superfoods, avocado, and citrus dressing',
    price: 8.99,
    calories: 320,
    protein: 12,
    carbs: 25,
    fat: 22,
    is_active: true
  },
  {
    name: 'Particle Pasta',
    description: 'Whole grain pasta with turkey meatballs and organic marinara',
    price: 12.99,
    calories: 520,
    protein: 28,
    carbs: 65,
    fat: 18,
    is_active: true
  }
];

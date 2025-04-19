export interface MealType {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  restaurant_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
}

export const INITIAL_MEALS = [
  {
    name: "Quantum Quinoa Bowl",
    description: "A futuristic blend of quinoa, roasted vegetables, and quantum-infused sauce",
    price: 14.99,
    calories: 450,
    protein: 15,
    carbs: 65,
    fat: 12,
  },
  {
    name: "Nebula Noodles",
    description: "Space-inspired udon noodles with star-bright vegetables and cosmic broth",
    price: 16.99,
    calories: 520,
    protein: 18,
    carbs: 75,
    fat: 14,
  },
  {
    name: "Cyber Sushi Roll",
    description: "Digital-age inspired roll with neon-bright ingredients and holographic garnish",
    price: 18.99,
    calories: 380,
    protein: 22,
    carbs: 45,
    fat: 16,
  },
  {
    name: "Matrix Miso Soup",
    description: "A glowing green miso soup with binary-coded tofu and digital seaweed",
    price: 8.99,
    calories: 220,
    protein: 12,
    carbs: 25,
    fat: 8,
  },
  {
    name: "Hologram Hamburger",
    description: "Plant-based burger that seems to shift and change as you eat it",
    price: 17.99,
    calories: 580,
    protein: 25,
    carbs: 55,
    fat: 28,
  },
  {
    name: "Virtual Veggie Platter",
    description: "An array of vegetables prepared with augmented reality seasonings",
    price: 13.99,
    calories: 320,
    protein: 10,
    carbs: 45,
    fat: 12,
  }
];

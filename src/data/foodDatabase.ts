
import { Food, FoodCategory } from "../types/food";

export const foodDatabase: Food[] = [
  // Proteins
  {
    id: "p1",
    name: "Chicken Breast",
    category: "protein",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    portion: 100, // 100g
    isGloballyAvailable: true,
    costTier: 2,
    imageUrl: "https://picsum.photos/seed/chicken/300/200"
  },
  {
    id: "p2",
    name: "Tofu",
    category: "protein",
    calories: 76,
    protein: 8,
    carbs: 1.9,
    fat: 4.8,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 1,
    imageUrl: "https://picsum.photos/seed/tofu/300/200"
  },
  {
    id: "p3",
    name: "Lentils",
    category: "protein",
    calories: 116,
    protein: 9,
    carbs: 20,
    fat: 0.4,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 1,
    imageUrl: "https://picsum.photos/seed/lentils/300/200"
  },
  {
    id: "p4",
    name: "Eggs",
    category: "protein",
    calories: 143,
    protein: 13,
    carbs: 0.7,
    fat: 9.5,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 1,
    imageUrl: "https://picsum.photos/seed/eggs/300/200"
  },
  {
    id: "p5",
    name: "Salmon",
    category: "protein",
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 3,
    imageUrl: "https://picsum.photos/seed/salmon/300/200"
  },
  
  // Carbs
  {
    id: "c1",
    name: "Brown Rice",
    category: "carbs",
    calories: 111,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 1,
    imageUrl: "https://picsum.photos/seed/brownrice/300/200"
  },
  {
    id: "c2",
    name: "Oats",
    category: "carbs",
    calories: 389,
    protein: 16.9,
    carbs: 66.3,
    fat: 6.9,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 1,
    imageUrl: "https://picsum.photos/seed/oats/300/200"
  },
  {
    id: "c3",
    name: "Sweet Potato",
    category: "carbs",
    calories: 86,
    protein: 1.6,
    carbs: 20.1,
    fat: 0.1,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 1,
    imageUrl: "https://picsum.photos/seed/sweetpotato/300/200"
  },
  {
    id: "c4",
    name: "Quinoa",
    category: "carbs",
    calories: 120,
    protein: 4.4,
    carbs: 21.3,
    fat: 1.9,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 2,
    imageUrl: "https://picsum.photos/seed/quinoa/300/200"
  },
  
  // Fats
  {
    id: "f1",
    name: "Avocado",
    category: "fats",
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 2,
    imageUrl: "https://picsum.photos/seed/avocado/300/200"
  },
  {
    id: "f2",
    name: "Olive Oil",
    category: "fats",
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 2,
    imageUrl: "https://picsum.photos/seed/oliveoil/300/200"
  },
  {
    id: "f3",
    name: "Almonds",
    category: "fats",
    calories: 579,
    protein: 21.2,
    carbs: 21.7,
    fat: 49.9,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 2,
    imageUrl: "https://picsum.photos/seed/almonds/300/200"
  },
  
  // Vegetables
  {
    id: "v1",
    name: "Broccoli",
    category: "vegetables",
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 1,
    imageUrl: "https://picsum.photos/seed/broccoli/300/200"
  },
  {
    id: "v2",
    name: "Spinach",
    category: "vegetables",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 1,
    imageUrl: "https://picsum.photos/seed/spinach/300/200"
  },
  
  // Fruits
  {
    id: "fr1",
    name: "Banana",
    category: "fruits",
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 1,
    imageUrl: "https://picsum.photos/seed/banana/300/200"
  },
  {
    id: "fr2",
    name: "Apple",
    category: "fruits",
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 1,
    imageUrl: "https://picsum.photos/seed/apple/300/200"
  },
  
  // Dairy
  {
    id: "d1",
    name: "Greek Yogurt",
    category: "dairy",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 2,
    imageUrl: "https://picsum.photos/seed/yogurt/300/200"
  },
  {
    id: "d2",
    name: "Cottage Cheese",
    category: "dairy",
    calories: 98,
    protein: 11.1,
    carbs: 3.4,
    fat: 4.3,
    portion: 100,
    isGloballyAvailable: true,
    costTier: 2,
    imageUrl: "https://picsum.photos/seed/cottagecheese/300/200"
  }
];

export const getFoodsByCategory = (category: FoodCategory) => {
  return foodDatabase.filter(food => food.category === category);
};

export const getFoodById = (id: string) => {
  return foodDatabase.find(food => food.id === id);
};

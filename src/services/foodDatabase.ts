
export interface FoodItem {
  id: string;
  name: string;
  calories: number; // per 100g
  protein: number; // per 100g
  carbs: number; // per 100g
  fat: number; // per 100g
  category: 'protein' | 'grains' | 'dairy' | 'vegetables' | 'fruits' | 'nuts' | 'legumes';
  mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'>;
  defaultPortionSize: number; // in grams
  usda_food_id?: string;
}

export const foodDatabase: FoodItem[] = [
  // Breakfast Foods
  {
    id: 'oatmeal_berries',
    name: 'Oatmeal with Berries',
    calories: 68,
    protein: 2.4,
    carbs: 12,
    fat: 1.4,
    category: 'grains',
    mealTypes: ['breakfast'],
    defaultPortionSize: 150,
    usda_food_id: 'oatmeal_berries'
  },
  {
    id: 'greek_yogurt',
    name: 'Greek Yogurt',
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    category: 'dairy',
    mealTypes: ['breakfast', 'snack'],
    defaultPortionSize: 170,
    usda_food_id: 'greek_yogurt'
  },
  {
    id: 'scrambled_eggs_toast',
    name: 'Scrambled Eggs with Toast',
    calories: 200,
    protein: 14,
    carbs: 15,
    fat: 10,
    category: 'protein',
    mealTypes: ['breakfast'],
    defaultPortionSize: 200,
    usda_food_id: 'scrambled_eggs_toast'
  },
  {
    id: 'protein_smoothie',
    name: 'Protein Smoothie',
    calories: 120,
    protein: 20,
    carbs: 8,
    fat: 2,
    category: 'dairy',
    mealTypes: ['breakfast', 'snack'],
    defaultPortionSize: 300,
    usda_food_id: 'protein_smoothie'
  },

  // Lunch/Dinner Proteins
  {
    id: 'chicken_breast',
    name: 'Grilled Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    category: 'protein',
    mealTypes: ['lunch', 'dinner'],
    defaultPortionSize: 120,
    usda_food_id: 'chicken_breast'
  },
  {
    id: 'salmon_fillet',
    name: 'Salmon Fillet',
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    category: 'protein',
    mealTypes: ['lunch', 'dinner'],
    defaultPortionSize: 140,
    usda_food_id: 'salmon_fillet'
  },
  {
    id: 'turkey_sandwich',
    name: 'Turkey Sandwich',
    calories: 250,
    protein: 20,
    carbs: 30,
    fat: 6,
    category: 'protein',
    mealTypes: ['lunch'],
    defaultPortionSize: 250,
    usda_food_id: 'turkey_sandwich'
  },
  {
    id: 'grilled_fish',
    name: 'Grilled Fish',
    calories: 180,
    protein: 25,
    carbs: 0,
    fat: 8,
    category: 'protein',
    mealTypes: ['dinner'],
    defaultPortionSize: 150,
    usda_food_id: 'grilled_fish'
  },
  {
    id: 'lean_beef',
    name: 'Lean Beef',
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 15,
    category: 'protein',
    mealTypes: ['lunch', 'dinner'],
    defaultPortionSize: 100,
    usda_food_id: 'lean_beef'
  },
  {
    id: 'chicken_thigh',
    name: 'Chicken Thigh',
    calories: 280,
    protein: 25,
    carbs: 0,
    fat: 18,
    category: 'protein',
    mealTypes: ['lunch', 'dinner'],
    defaultPortionSize: 120,
    usda_food_id: 'chicken_thigh'
  },

  // Grains and Carbs
  {
    id: 'brown_rice',
    name: 'Brown Rice',
    calories: 123,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    category: 'grains',
    mealTypes: ['lunch', 'dinner'],
    defaultPortionSize: 100,
    usda_food_id: 'brown_rice'
  },
  {
    id: 'quinoa_bowl',
    name: 'Quinoa Bowl',
    calories: 120,
    protein: 4.4,
    carbs: 22,
    fat: 1.9,
    category: 'grains',
    mealTypes: ['lunch', 'dinner'],
    defaultPortionSize: 180,
    usda_food_id: 'quinoa_bowl'
  },
  {
    id: 'sweet_potato',
    name: 'Sweet Potato',
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    category: 'vegetables',
    mealTypes: ['lunch', 'dinner'],
    defaultPortionSize: 120,
    usda_food_id: 'sweet_potato'
  },
  {
    id: 'whole_wheat_pasta',
    name: 'Whole Wheat Pasta',
    calories: 350,
    protein: 12,
    carbs: 70,
    fat: 2,
    category: 'grains',
    mealTypes: ['lunch', 'dinner'],
    defaultPortionSize: 100,
    usda_food_id: 'whole_wheat_pasta'
  },
  {
    id: 'wild_rice',
    name: 'Wild Rice',
    calories: 101,
    protein: 4,
    carbs: 21,
    fat: 0.3,
    category: 'grains',
    mealTypes: ['lunch', 'dinner'],
    defaultPortionSize: 90,
    usda_food_id: 'wild_rice'
  },
  {
    id: 'barley',
    name: 'Barley',
    calories: 320,
    protein: 10,
    carbs: 65,
    fat: 2,
    category: 'grains',
    mealTypes: ['lunch', 'dinner'],
    defaultPortionSize: 100,
    usda_food_id: 'barley'
  },

  // Vegetables
  {
    id: 'mixed_vegetables',
    name: 'Mixed Vegetables',
    calories: 25,
    protein: 1.5,
    carbs: 5,
    fat: 0.2,
    category: 'vegetables',
    mealTypes: ['lunch', 'dinner'],
    defaultPortionSize: 150,
    usda_food_id: 'mixed_vegetables'
  },
  {
    id: 'green_salad',
    name: 'Green Salad',
    calories: 15,
    protein: 1.4,
    carbs: 2.9,
    fat: 0.2,
    category: 'vegetables',
    mealTypes: ['lunch', 'dinner'],
    defaultPortionSize: 100,
    usda_food_id: 'green_salad'
  },
  {
    id: 'roasted_vegetables',
    name: 'Roasted Vegetables',
    calories: 35,
    protein: 1.5,
    carbs: 7,
    fat: 0.3,
    category: 'vegetables',
    mealTypes: ['lunch', 'dinner'],
    defaultPortionSize: 160,
    usda_food_id: 'roasted_vegetables'
  },
  {
    id: 'side_vegetables',
    name: 'Side Vegetables',
    calories: 30,
    protein: 2,
    carbs: 6,
    fat: 0.2,
    category: 'vegetables',
    mealTypes: ['lunch', 'dinner'],
    defaultPortionSize: 120,
    usda_food_id: 'side_vegetables'
  },

  // Snacks and Nuts
  {
    id: 'almonds',
    name: 'Almonds',
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 49,
    category: 'nuts',
    mealTypes: ['snack'],
    defaultPortionSize: 28,
    usda_food_id: 'almonds'
  },
  {
    id: 'trail_mix',
    name: 'Trail Mix',
    calories: 462,
    protein: 13,
    carbs: 45,
    fat: 29,
    category: 'nuts',
    mealTypes: ['snack'],
    defaultPortionSize: 35,
    usda_food_id: 'trail_mix'
  },

  // Fruits
  {
    id: 'apple',
    name: 'Apple',
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    category: 'fruits',
    mealTypes: ['snack'],
    defaultPortionSize: 150,
    usda_food_id: 'apple'
  },
  {
    id: 'banana',
    name: 'Banana',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    category: 'fruits',
    mealTypes: ['snack'],
    defaultPortionSize: 120,
    usda_food_id: 'banana'
  }
];

/**
 * Get foods by meal type
 */
export const getFoodsByMealType = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): FoodItem[] => {
  return foodDatabase.filter(food => food.mealTypes.includes(mealType));
};

/**
 * Get foods by category
 */
export const getFoodsByCategory = (category: string): FoodItem[] => {
  return foodDatabase.filter(food => food.category === category);
};

/**
 * Get food by ID
 */
export const getFoodById = (id: string): FoodItem | undefined => {
  return foodDatabase.find(food => food.id === id);
};

/**
 * Get random food by meal type and category
 */
export const getRandomFoodByMealTypeAndCategory = (
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  category?: string
): FoodItem | undefined => {
  let availableFoods = getFoodsByMealType(mealType);
  
  if (category) {
    availableFoods = availableFoods.filter(food => food.category === category);
  }
  
  if (availableFoods.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * availableFoods.length);
  return availableFoods[randomIndex];
};

/**
 * Calculate nutrition for a specific portion size
 */
export const calculateNutritionForPortion = (food: FoodItem, portionGrams: number) => {
  const factor = portionGrams / 100; // Convert from per 100g to actual portion
  
  return {
    calories: Math.round(food.calories * factor),
    protein: Math.round(food.protein * factor * 10) / 10, // Round to 1 decimal
    carbs: Math.round(food.carbs * factor * 10) / 10,
    fat: Math.round(food.fat * factor * 10) / 10,
  };
};


export interface FoodItem {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  category: 'protein' | 'grains' | 'vegetables' | 'fruits' | 'dairy' | 'nuts' | 'oils';
  meal_types: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  common_portion_size: number; // in grams
}

export const foodDatabase: FoodItem[] = [
  // Grains
  {
    id: 'barley',
    name: 'Barley',
    calories_per_100g: 354,
    protein_per_100g: 12.5,
    carbs_per_100g: 73.5,
    fat_per_100g: 2.3,
    category: 'grains',
    meal_types: ['breakfast', 'lunch', 'dinner'],
    common_portion_size: 100
  },
  {
    id: 'brown_rice',
    name: 'Brown Rice',
    calories_per_100g: 123,
    protein_per_100g: 2.6,
    carbs_per_100g: 23,
    fat_per_100g: 0.9,
    category: 'grains',
    meal_types: ['lunch', 'dinner'],
    common_portion_size: 100
  },
  {
    id: 'oatmeal',
    name: 'Oatmeal',
    calories_per_100g: 389,
    protein_per_100g: 16.9,
    carbs_per_100g: 66.3,
    fat_per_100g: 6.9,
    category: 'grains',
    meal_types: ['breakfast'],
    common_portion_size: 40
  },

  // Proteins
  {
    id: 'grilled_chicken_breast',
    name: 'Grilled Chicken Breast',
    calories_per_100g: 165,
    protein_per_100g: 31,
    carbs_per_100g: 0,
    fat_per_100g: 3.6,
    category: 'protein',
    meal_types: ['lunch', 'dinner'],
    common_portion_size: 120
  },
  {
    id: 'salmon_fillet',
    name: 'Salmon Fillet',
    calories_per_100g: 208,
    protein_per_100g: 25.4,
    carbs_per_100g: 0,
    fat_per_100g: 12.4,
    category: 'protein',
    meal_types: ['lunch', 'dinner'],
    common_portion_size: 140
  },
  {
    id: 'eggs',
    name: 'Eggs',
    calories_per_100g: 155,
    protein_per_100g: 13,
    carbs_per_100g: 1.1,
    fat_per_100g: 11,
    category: 'protein',
    meal_types: ['breakfast', 'lunch'],
    common_portion_size: 50
  },

  // Dairy
  {
    id: 'greek_yogurt',
    name: 'Greek Yogurt',
    calories_per_100g: 59,
    protein_per_100g: 10,
    carbs_per_100g: 3.6,
    fat_per_100g: 0.4,
    category: 'dairy',
    meal_types: ['breakfast', 'snack'],
    common_portion_size: 170
  },

  // Vegetables
  {
    id: 'sweet_potato',
    name: 'Sweet Potato',
    calories_per_100g: 86,
    protein_per_100g: 1.6,
    carbs_per_100g: 20.1,
    fat_per_100g: 0.1,
    category: 'vegetables',
    meal_types: ['lunch', 'dinner'],
    common_portion_size: 120
  },
  {
    id: 'mixed_vegetables',
    name: 'Mixed Vegetables',
    calories_per_100g: 31,
    protein_per_100g: 2.4,
    carbs_per_100g: 6.8,
    fat_per_100g: 0.2,
    category: 'vegetables',
    meal_types: ['lunch', 'dinner'],
    common_portion_size: 150
  },
  {
    id: 'green_salad',
    name: 'Green Salad',
    calories_per_100g: 15,
    protein_per_100g: 1.4,
    carbs_per_100g: 2.9,
    fat_per_100g: 0.2,
    category: 'vegetables',
    meal_types: ['lunch', 'dinner'],
    common_portion_size: 100
  },

  // Fruits
  {
    id: 'apple',
    name: 'Apple',
    calories_per_100g: 52,
    protein_per_100g: 0.3,
    carbs_per_100g: 14,
    fat_per_100g: 0.2,
    category: 'fruits',
    meal_types: ['breakfast', 'snack'],
    common_portion_size: 150
  },
  {
    id: 'banana',
    name: 'Banana',
    calories_per_100g: 89,
    protein_per_100g: 1.1,
    carbs_per_100g: 23,
    fat_per_100g: 0.3,
    category: 'fruits',
    meal_types: ['breakfast', 'snack'],
    common_portion_size: 120
  },
  {
    id: 'berries',
    name: 'Mixed Berries',
    calories_per_100g: 57,
    protein_per_100g: 0.7,
    carbs_per_100g: 14.5,
    fat_per_100g: 0.3,
    category: 'fruits',
    meal_types: ['breakfast', 'snack'],
    common_portion_size: 80
  },

  // Nuts
  {
    id: 'almonds',
    name: 'Almonds',
    calories_per_100g: 579,
    protein_per_100g: 21.2,
    carbs_per_100g: 21.6,
    fat_per_100g: 49.9,
    category: 'nuts',
    meal_types: ['snack'],
    common_portion_size: 28
  }
];

// Helper functions
export const getFoodsByMealType = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): FoodItem[] => {
  return foodDatabase.filter(food => food.meal_types.includes(mealType));
};

export const getFoodsByCategory = (category: FoodItem['category']): FoodItem[] => {
  return foodDatabase.filter(food => food.category === category);
};

export const getFoodById = (id: string): FoodItem | undefined => {
  return foodDatabase.find(food => food.id === id);
};

export const calculateNutritionForPortion = (food: FoodItem, portionSize: number) => {
  const ratio = portionSize / 100;
  return {
    calories: Math.round(food.calories_per_100g * ratio),
    protein: Math.round(food.protein_per_100g * ratio * 10) / 10,
    carbs: Math.round(food.carbs_per_100g * ratio * 10) / 10,
    fat: Math.round(food.fat_per_100g * ratio * 10) / 10
  };
};

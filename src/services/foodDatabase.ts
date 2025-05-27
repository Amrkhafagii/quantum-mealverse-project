
export interface FoodItem {
  id: string;
  name: string;
  category: 'protein' | 'grains' | 'vegetables' | 'fruits' | 'dairy' | 'nuts' | 'fats';
  calories: number; // per 100g
  protein: number; // grams per 100g
  carbs: number; // grams per 100g
  fat: number; // grams per 100g
  mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  defaultPortion: number; // grams
}

export const foodDatabase: FoodItem[] = [
  // Proteins
  {
    id: 'chicken_breast',
    name: 'Grilled Chicken Breast',
    category: 'protein',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 120
  },
  {
    id: 'salmon_fillet',
    name: 'Salmon Fillet',
    category: 'protein',
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 140
  },
  {
    id: 'lean_beef',
    name: 'Lean Beef',
    category: 'protein',
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 15,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 100
  },
  {
    id: 'grilled_fish',
    name: 'Grilled Fish',
    category: 'protein',
    calories: 206,
    protein: 22,
    carbs: 0,
    fat: 12,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 150
  },
  {
    id: 'turkey_breast',
    name: 'Turkey Breast',
    category: 'protein',
    calories: 135,
    protein: 30,
    carbs: 0,
    fat: 1,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 120
  },
  {
    id: 'eggs',
    name: 'Scrambled Eggs',
    category: 'protein',
    calories: 155,
    protein: 13,
    carbs: 1,
    fat: 11,
    mealTypes: ['breakfast'],
    defaultPortion: 150
  },

  // Grains
  {
    id: 'brown_rice',
    name: 'Brown Rice',
    category: 'grains',
    calories: 111,
    protein: 3,
    carbs: 23,
    fat: 0.9,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 100
  },
  {
    id: 'quinoa',
    name: 'Quinoa',
    category: 'grains',
    calories: 120,
    protein: 4.4,
    carbs: 22,
    fat: 1.9,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 100
  },
  {
    id: 'oatmeal',
    name: 'Oatmeal',
    category: 'grains',
    calories: 68,
    protein: 2.4,
    carbs: 12,
    fat: 1.4,
    mealTypes: ['breakfast'],
    defaultPortion: 150
  },
  {
    id: 'barley',
    name: 'Barley',
    category: 'grains',
    calories: 320,
    protein: 10,
    carbs: 65,
    fat: 2,
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    defaultPortion: 100
  },
  {
    id: 'wild_rice',
    name: 'Wild Rice',
    category: 'grains',
    calories: 101,
    protein: 4,
    carbs: 21,
    fat: 0.3,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 90
  },
  {
    id: 'whole_wheat_pasta',
    name: 'Whole Wheat Pasta',
    category: 'grains',
    calories: 124,
    protein: 5,
    carbs: 25,
    fat: 1.1,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 100
  },

  // Vegetables
  {
    id: 'mixed_vegetables',
    name: 'Mixed Vegetables',
    category: 'vegetables',
    calories: 31,
    protein: 1.4,
    carbs: 7,
    fat: 0.2,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 150
  },
  {
    id: 'sweet_potato',
    name: 'Sweet Potato',
    category: 'vegetables',
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 120
  },
  {
    id: 'green_salad',
    name: 'Green Salad',
    category: 'vegetables',
    calories: 15,
    protein: 1.4,
    carbs: 2.9,
    fat: 0.2,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 100
  },
  {
    id: 'roasted_vegetables',
    name: 'Roasted Vegetables',
    category: 'vegetables',
    calories: 35,
    protein: 1.5,
    carbs: 8,
    fat: 0.3,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 160
  },
  {
    id: 'broccoli',
    name: 'Steamed Broccoli',
    category: 'vegetables',
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 120
  },

  // Fruits
  {
    id: 'apple',
    name: 'Apple',
    category: 'fruits',
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    mealTypes: ['breakfast', 'snack'],
    defaultPortion: 150
  },
  {
    id: 'banana',
    name: 'Banana',
    category: 'fruits',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    mealTypes: ['breakfast', 'snack'],
    defaultPortion: 120
  },
  {
    id: 'berries',
    name: 'Mixed Berries',
    category: 'fruits',
    calories: 57,
    protein: 0.7,
    carbs: 14,
    fat: 0.3,
    mealTypes: ['breakfast', 'snack'],
    defaultPortion: 100
  },

  // Dairy
  {
    id: 'greek_yogurt',
    name: 'Greek Yogurt',
    category: 'dairy',
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    mealTypes: ['breakfast', 'snack'],
    defaultPortion: 170
  },
  {
    id: 'cottage_cheese',
    name: 'Cottage Cheese',
    category: 'dairy',
    calories: 98,
    protein: 11,
    carbs: 3.4,
    fat: 4.3,
    mealTypes: ['breakfast', 'snack'],
    defaultPortion: 100
  },

  // Nuts
  {
    id: 'almonds',
    name: 'Almonds',
    category: 'nuts',
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    mealTypes: ['snack'],
    defaultPortion: 28
  },
  {
    id: 'walnuts',
    name: 'Walnuts',
    category: 'nuts',
    calories: 654,
    protein: 15,
    carbs: 14,
    fat: 65,
    mealTypes: ['snack'],
    defaultPortion: 30
  },
  {
    id: 'trail_mix',
    name: 'Trail Mix',
    category: 'nuts',
    calories: 462,
    protein: 13,
    carbs: 45,
    fat: 29,
    mealTypes: ['snack'],
    defaultPortion: 35
  },

  // Fats
  {
    id: 'avocado',
    name: 'Avocado',
    category: 'fats',
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    defaultPortion: 100
  },
  {
    id: 'olive_oil',
    name: 'Olive Oil',
    category: 'fats',
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    mealTypes: ['lunch', 'dinner'],
    defaultPortion: 10
  }
];

// Helper functions
export const getFoodsByCategory = (category: FoodItem['category']): FoodItem[] => {
  return foodDatabase.filter(food => food.category === category);
};

export const getFoodsByMealType = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): FoodItem[] => {
  return foodDatabase.filter(food => food.mealTypes.includes(mealType));
};

export const getFoodById = (id: string): FoodItem | undefined => {
  return foodDatabase.find(food => food.id === id);
};

export const calculateNutritionForPortion = (food: FoodItem, portionGrams: number) => {
  const ratio = portionGrams / 100; // Since nutrition is per 100g
  return {
    calories: Math.round(food.calories * ratio),
    protein: Math.round(food.protein * ratio),
    carbs: Math.round(food.carbs * ratio),
    fat: Math.round(food.fat * ratio)
  };
};

export const findFoodsByNutritionProfile = (
  targetCalories: number, 
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  categories?: FoodItem['category'][]
): FoodItem[] => {
  let foods = getFoodsByMealType(mealType);
  
  if (categories) {
    foods = foods.filter(food => categories.includes(food.category));
  }
  
  // Sort by how close their default portion calories are to target
  return foods.sort((a, b) => {
    const aCalories = calculateNutritionForPortion(a, a.defaultPortion).calories;
    const bCalories = calculateNutritionForPortion(b, b.defaultPortion).calories;
    
    return Math.abs(aCalories - targetCalories) - Math.abs(bCalories - targetCalories);
  });
};

export const getRandomFoodsByMealType = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', count: number = 3): FoodItem[] => {
  const foods = getFoodsByMealType(mealType);
  const shuffled = [...foods].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};


import { Food, FoodCategory } from '@/types/food';

export interface MealTemplate {
  id: string;
  name: string;
  description: string;
  mealTypes: string[];
  cookingMethod: 'raw' | 'cooked' | 'mixed';
  requiredCategories: FoodCategory[];
  optionalCategories?: FoodCategory[];
  compatibilityRules: CompatibilityRule[];
}

export interface CompatibilityRule {
  category: FoodCategory;
  compatibleWith: FoodCategory[];
  cookingStates: string[];
  portionRatio: number; // 0.1 to 1.0 - how much of this category in the meal
}

// Define meal templates for logical food combinations
export const mealTemplates: MealTemplate[] = [
  {
    id: 'protein-carb-veggie',
    name: 'Protein + Carb + Vegetable',
    description: 'Complete cooked meal with protein, carbohydrate, and vegetables',
    mealTypes: ['lunch', 'dinner'],
    cookingMethod: 'cooked',
    requiredCategories: ['protein', 'carbs', 'vegetables'],
    optionalCategories: ['fats'],
    compatibilityRules: [
      {
        category: 'protein',
        compatibleWith: ['carbs', 'vegetables', 'fats'],
        cookingStates: ['cooked'],
        portionRatio: 0.4
      },
      {
        category: 'carbs',
        compatibleWith: ['protein', 'vegetables'],
        cookingStates: ['cooked', 'raw'],
        portionRatio: 0.35
      },
      {
        category: 'vegetables',
        compatibleWith: ['protein', 'carbs', 'fats'],
        cookingStates: ['cooked', 'raw'],
        portionRatio: 0.2
      },
      {
        category: 'fats',
        compatibleWith: ['protein', 'carbs', 'vegetables'],
        cookingStates: ['raw'],
        portionRatio: 0.05
      }
    ]
  },
  {
    id: 'breakfast-bowl',
    name: 'Breakfast Bowl',
    description: 'Dairy/protein with fruits and carbs',
    mealTypes: ['breakfast'],
    cookingMethod: 'mixed',
    requiredCategories: ['protein', 'carbs'],
    optionalCategories: ['fruits', 'fats'],
    compatibilityRules: [
      {
        category: 'protein',
        compatibleWith: ['carbs', 'fruits', 'fats'],
        cookingStates: ['raw', 'processed'],
        portionRatio: 0.4
      },
      {
        category: 'carbs',
        compatibleWith: ['protein', 'fruits'],
        cookingStates: ['processed', 'cooked'],
        portionRatio: 0.35
      },
      {
        category: 'fruits',
        compatibleWith: ['protein', 'carbs', 'fats'],
        cookingStates: ['raw'],
        portionRatio: 0.2
      },
      {
        category: 'fats',
        compatibleWith: ['protein', 'carbs', 'fruits'],
        cookingStates: ['raw'],
        portionRatio: 0.05
      }
    ]
  },
  {
    id: 'cooked-breakfast',
    name: 'Cooked Breakfast',
    description: 'Traditional cooked breakfast items',
    mealTypes: ['breakfast'],
    cookingMethod: 'cooked',
    requiredCategories: ['protein', 'carbs'],
    optionalCategories: ['vegetables', 'fats'],
    compatibilityRules: [
      {
        category: 'protein',
        compatibleWith: ['carbs', 'vegetables', 'fats'],
        cookingStates: ['cooked'],
        portionRatio: 0.45
      },
      {
        category: 'carbs',
        compatibleWith: ['protein', 'vegetables'],
        cookingStates: ['processed', 'cooked'],
        portionRatio: 0.3
      },
      {
        category: 'vegetables',
        compatibleWith: ['protein', 'carbs'],
        cookingStates: ['cooked', 'raw'],
        portionRatio: 0.2
      },
      {
        category: 'fats',
        compatibleWith: ['protein', 'carbs', 'vegetables'],
        cookingStates: ['raw'],
        portionRatio: 0.05
      }
    ]
  },
  {
    id: 'snack-mix',
    name: 'Healthy Snack',
    description: 'Light snack with protein and healthy fats',
    mealTypes: ['snack'],
    cookingMethod: 'raw',
    requiredCategories: ['fats'],
    optionalCategories: ['protein', 'fruits'],
    compatibilityRules: [
      {
        category: 'fats',
        compatibleWith: ['protein', 'fruits'],
        cookingStates: ['raw'],
        portionRatio: 0.5
      },
      {
        category: 'protein',
        compatibleWith: ['fats', 'fruits'],
        cookingStates: ['raw', 'processed'],
        portionRatio: 0.3
      },
      {
        category: 'fruits',
        compatibleWith: ['fats', 'protein'],
        cookingStates: ['raw'],
        portionRatio: 0.2
      }
    ]
  }
];

/**
 * Check if foods are compatible based on cooking methods and meal logic
 */
export const areFoodsCompatible = (foods: Food[], template: MealTemplate): boolean => {
  // Check if all required categories are present
  const foodCategories = foods.map(food => food.category);
  const hasAllRequired = template.requiredCategories.every(cat => 
    foodCategories.includes(cat)
  );
  
  if (!hasAllRequired) return false;
  
  // Check cooking state compatibility
  if (template.cookingMethod === 'cooked') {
    // For cooked meals, ensure main proteins and carbs can be cooked
    const proteinFoods = foods.filter(f => f.category === 'protein');
    const carbFoods = foods.filter(f => f.category === 'carbs');
    
    const proteinCanBeCookedTogether = proteinFoods.every(f => 
      f.cookingState === 'cooked' || f.cookingState === 'raw'
    );
    const carbsCanBeCookedTogether = carbFoods.every(f => 
      f.cookingState === 'cooked' || f.cookingState === 'raw'
    );
    
    return proteinCanBeCookedTogether && carbsCanBeCookedTogether;
  }
  
  return true;
};

/**
 * Select compatible foods for a meal template
 */
export const selectCompatibleFoods = (
  availableFoods: {
    protein: Food[];
    carbs: Food[];
    fats: Food[];
    vegetables: Food[];
    fruits: Food[];
  },
  template: MealTemplate
): Food[] => {
  const selectedFoods: Food[] = [];
  
  // Select foods for each required category
  for (const category of template.requiredCategories) {
    const categoryFoods = availableFoods[category] || [];
    if (categoryFoods.length === 0) continue;
    
    const rule = template.compatibilityRules.find(r => r.category === category);
    if (!rule) continue;
    
    // Filter foods by cooking state compatibility
    const compatibleFoods = categoryFoods.filter(food => 
      rule.cookingStates.includes(food.cookingState || 'raw')
    );
    
    if (compatibleFoods.length > 0) {
      // Select randomly from compatible foods
      const selectedFood = compatibleFoods[Math.floor(Math.random() * compatibleFoods.length)];
      selectedFoods.push(selectedFood);
    }
  }
  
  // Add optional categories if available
  if (template.optionalCategories) {
    for (const category of template.optionalCategories) {
      const categoryFoods = availableFoods[category] || [];
      if (categoryFoods.length === 0) continue;
      
      const rule = template.compatibilityRules.find(r => r.category === category);
      if (!rule) continue;
      
      // 70% chance to include optional categories
      if (Math.random() < 0.7) {
        const compatibleFoods = categoryFoods.filter(food => 
          rule.cookingStates.includes(food.cookingState || 'raw')
        );
        
        if (compatibleFoods.length > 0) {
          const selectedFood = compatibleFoods[Math.floor(Math.random() * compatibleFoods.length)];
          selectedFoods.push(selectedFood);
        }
      }
    }
  }
  
  return selectedFoods;
};

/**
 * Get appropriate meal template for a meal type
 */
export const getMealTemplate = (mealType: string): MealTemplate => {
  const lowerMealType = mealType.toLowerCase();
  
  // Find templates that match the meal type
  const matchingTemplates = mealTemplates.filter(template => 
    template.mealTypes.includes(lowerMealType)
  );
  
  if (matchingTemplates.length === 0) {
    // Fallback to a general template
    return mealTemplates[0]; // protein-carb-veggie
  }
  
  // Select randomly from matching templates
  return matchingTemplates[Math.floor(Math.random() * matchingTemplates.length)];
};

/**
 * Calculate enhanced portion sizes with minimum protein requirements
 */
export const calculateEnhancedPortions = (
  foods: Food[],
  template: MealTemplate,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number
): { food: Food; portionSize: number }[] => {
  const mealFoods: { food: Food; portionSize: number }[] = [];
  
  for (const food of foods) {
    const rule = template.compatibilityRules.find(r => r.category === food.category);
    if (!rule) continue;
    
    let portionSize = 100; // Default portion size
    
    // Calculate portion based on target macros and category
    switch (food.category) {
      case 'protein':
        // Minimum 150g for meat/fish, 200g for dairy/eggs, 25g for powder
        const minProteinPortion = food.name.toLowerCase().includes('powder') ? 25 : 
                                 food.name.toLowerCase().includes('cheese') || 
                                 food.name.toLowerCase().includes('yogurt') || 
                                 food.name.toLowerCase().includes('eggs') ? 200 : 150;
        
        // Calculate portion to hit protein target with rule ratio
        const proteinNeeded = targetProtein * rule.portionRatio;
        const proteinPortion = food.protein > 0 ? (proteinNeeded / food.protein) * 100 : minProteinPortion;
        portionSize = Math.max(minProteinPortion, Math.round(proteinPortion));
        break;
        
      case 'carbs':
        // Minimum 50g for carbs, calculate based on target
        const carbsNeeded = targetCarbs * rule.portionRatio;
        const carbsPortion = food.carbs > 0 ? (carbsNeeded / food.carbs) * 100 : 50;
        portionSize = Math.max(50, Math.round(carbsPortion));
        break;
        
      case 'fats':
        // Minimum 15g for fats, maximum 50g
        const fatNeeded = targetFat * rule.portionRatio;
        const fatPortion = food.fat > 0 ? (fatNeeded / food.fat) * 100 : 15;
        portionSize = Math.max(15, Math.min(50, Math.round(fatPortion)));
        break;
        
      case 'vegetables':
        // Standard vegetable portions
        portionSize = 100;
        break;
        
      case 'fruits':
        // Standard fruit portions
        portionSize = 120;
        break;
    }
    
    mealFoods.push({ food, portionSize });
  }
  
  return mealFoods;
};

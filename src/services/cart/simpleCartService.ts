
import { Meal, MealFood } from '@/types/food';
import { CartItem } from '@/contexts/CartContext';

/**
 * Simple cart service that converts meals to cart items WITHOUT restaurant assignment
 * Restaurant assignment will happen during checkout
 */

/**
 * Converts a meal to a cart item without restaurant assignment
 */
export const convertMealToSimpleCartItem = (meal: Meal): CartItem => {
  console.log('Converting meal to simple cart item:', meal.name);

  // Create description from food items
  const foodDescriptions = meal.foods.map(mealFood => 
    `${mealFood.food.name} (${mealFood.portionSize}g)`
  );
  
  const description = foodDescriptions.join(', ');

  // Calculate a simple price based on meal components (no restaurant pricing)
  const price = calculateSimplePrice(meal);

  // Create cart item without restaurant assignment
  const cartItem: CartItem = {
    id: crypto.randomUUID(),
    name: meal.name,
    price: price,
    quantity: 1,
    description: description,
    calories: meal.totalCalories,
    protein: meal.totalProtein,
    carbs: meal.totalCarbs,
    fat: meal.totalFat,
    dietary_tags: [],
    image_url: generateMealImageUrl(meal),
    assignment_source: 'nutrition_generation'
  };

  console.log('Created simple cart item:', {
    name: cartItem.name,
    price: cartItem.price,
    description: cartItem.description
  });

  return cartItem;
};

/**
 * Converts MealCard props to Meal format
 */
export const convertMealCardPropsToMeal = (props: {
  name: string;
  calories: number;
  macros: { protein: number; carbs: number; fat: number };
}): Meal => {
  const mealId = Math.random().toString(36).substring(2, 9);
  
  const mealFoods: MealFood[] = [
    {
      food: {
        id: mealId,
        name: props.name,
        calories: props.calories,
        protein: props.macros.protein,
        carbs: props.macros.carbs,
        fat: props.macros.fat,
        category: 'protein',
        cookingState: 'cooked',
        portion: 100
      },
      portionSize: 100
    }
  ];

  return {
    id: mealId,
    name: props.name,
    foods: mealFoods,
    totalCalories: props.calories,
    totalProtein: props.macros.protein,
    totalCarbs: props.macros.carbs,
    totalFat: props.macros.fat
  };
};

/**
 * Calculates a simple price for a meal without restaurant pricing
 */
const calculateSimplePrice = (meal: Meal): number => {
  // Simple calculation: $0.05 per calorie, minimum $5
  return Math.max(meal.totalCalories * 0.05, 5.00);
};

/**
 * Generates a placeholder image URL for the meal
 */
const generateMealImageUrl = (meal: Meal): string => {
  const seed = meal.name.toLowerCase().replace(/\s+/g, '-');
  return `https://picsum.photos/seed/${seed}/300/200`;
};

/**
 * Validates that a meal can be converted to a cart item
 */
export const validateMealForSimpleCart = (meal: Meal): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!meal.name || meal.name.trim() === '') {
    errors.push('Meal must have a name');
  }

  if (!meal.foods || meal.foods.length === 0) {
    errors.push('Meal must contain at least one food item');
  }

  if (meal.totalCalories <= 0) {
    errors.push('Meal must have positive calorie content');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};


import { Meal } from '@/types/food';
import { CartItem } from '@/contexts/CartContext';
import { calculateMealPricing, storeMealPlanCartItem } from './foodPricingService';

/**
 * Converts a meal plan meal into a cart item
 */
export const convertMealToCartItem = async (
  meal: Meal, 
  userId: string, 
  restaurantId?: string
): Promise<CartItem> => {
  console.log('Converting meal to cart item:', meal.name);

  // Calculate pricing for the meal
  const pricing = await calculateMealPricing(meal, restaurantId);
  
  // Store the meal plan data for order processing
  const mealPlanItemId = await storeMealPlanCartItem(meal, pricing, userId);

  // Create description from food items
  const foodDescriptions = meal.foods.map(mealFood => 
    `${mealFood.food.name} (${mealFood.portionSize}g)`
  );
  
  const description = foodDescriptions.join(', ');

  // Create cart item
  const cartItem: CartItem = {
    id: mealPlanItemId || crypto.randomUUID(),
    name: meal.name,
    price: pricing.totalPrice,
    quantity: 1,
    description: description,
    calories: meal.totalCalories,
    protein: meal.totalProtein,
    carbs: meal.totalCarbs,
    fat: meal.totalFat,
    restaurant_id: pricing.restaurantId,
    dietary_tags: [], // Could be enhanced based on meal composition
    image_url: generateMealImageUrl(meal)
  };

  console.log('Created cart item:', {
    name: cartItem.name,
    price: cartItem.price,
    description: cartItem.description,
    itemCount: meal.foods.length
  });

  return cartItem;
};

/**
 * Generates a placeholder image URL for the meal based on its composition
 */
const generateMealImageUrl = (meal: Meal): string => {
  // Create a seed based on meal name for consistent images
  const seed = meal.name.toLowerCase().replace(/\s+/g, '-');
  return `https://picsum.photos/seed/${seed}/300/200`;
};

/**
 * Validates that a meal can be converted to a cart item
 */
export const validateMealForCart = (meal: Meal): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!meal.name || meal.name.trim() === '') {
    errors.push('Meal must have a name');
  }

  if (!meal.foods || meal.foods.length === 0) {
    errors.push('Meal must contain at least one food item');
  }

  if (meal.foods.some(mealFood => !mealFood.portionSize || mealFood.portionSize <= 0)) {
    errors.push('All food items must have valid portion sizes');
  }

  if (meal.totalCalories <= 0) {
    errors.push('Meal must have positive calorie content');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Batch converts multiple meals to cart items
 */
export const convertMealsToCartItems = async (
  meals: Meal[], 
  userId: string, 
  restaurantId?: string
): Promise<{ items: CartItem[]; errors: string[] }> => {
  const items: CartItem[] = [];
  const errors: string[] = [];

  for (const meal of meals) {
    const validation = validateMealForCart(meal);
    
    if (!validation.isValid) {
      errors.push(`${meal.name}: ${validation.errors.join(', ')}`);
      continue;
    }

    try {
      const cartItem = await convertMealToCartItem(meal, userId, restaurantId);
      items.push(cartItem);
    } catch (error) {
      console.error(`Failed to convert meal ${meal.name}:`, error);
      errors.push(`Failed to convert ${meal.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { items, errors };
};

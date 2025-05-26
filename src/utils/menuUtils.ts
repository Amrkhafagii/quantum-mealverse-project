
import { MenuItem, NutritionalInfo } from '@/types/menu';

/**
 * Ensures a MenuItem has all required properties with proper defaults
 */
export const normalizeMenuItem = (item: Partial<MenuItem>): MenuItem => {
  return {
    id: item.id || '',
    restaurant_id: item.restaurant_id || '',
    name: item.name || '',
    description: item.description || '',
    price: item.price || 0,
    image_url: item.image_url,
    is_available: item.is_available ?? true,
    category: item.category || '',
    preparation_time: item.preparation_time || 15,
    ingredients: item.ingredients || [],
    steps: item.steps || [],
    nutritional_info: item.nutritional_info || {},
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
};

/**
 * Formats a price for display
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

/**
 * Calculate match percentage between meal plan and restaurant meal
 * Weights protein match more heavily than other macros
 */
export const calculateMatchPercentage = (
  planMeal: { calories: number, protein: number, carbs: number, fat: number },
  restaurantMeal: { calories: number, protein: number, carbs: number, fat: number }
): number => {
  // Weight factors (protein is weighted more heavily)
  const weights = {
    protein: 0.4,  // 40% importance
    carbs: 0.25,   // 25% importance
    fat: 0.25,     // 25% importance
    calories: 0.1  // 10% importance
  };
  
  // Calculate similarity for each macro
  // Using a formula that produces higher scores for closer matches
  const calculateSimilarity = (plan: number, restaurant: number): number => {
    if (plan === 0 && restaurant === 0) return 100;  // Both zero means perfect match
    if (plan === 0) return 0;  // Can't divide by zero
    
    const ratio = restaurant / plan;
    // Convert ratio to percentage similarity
    // 1.0 ratio = 100%, 0.9 or 1.1 = 90%, etc.
    return 100 - Math.min(Math.abs(1 - ratio) * 100, 100);
  };
  
  // Calculate individual macro similarities
  const proteinSimilarity = calculateSimilarity(planMeal.protein, restaurantMeal.protein);
  const carbsSimilarity = calculateSimilarity(planMeal.carbs, restaurantMeal.carbs);
  const fatSimilarity = calculateSimilarity(planMeal.fat, restaurantMeal.fat);
  const caloriesSimilarity = calculateSimilarity(planMeal.calories, restaurantMeal.calories);
  
  // Combine weighted similarities
  const weightedMatch = 
    (proteinSimilarity * weights.protein) +
    (carbsSimilarity * weights.carbs) +
    (fatSimilarity * weights.fat) +
    (caloriesSimilarity * weights.calories);
  
  return weightedMatch;
};

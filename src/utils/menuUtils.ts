
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

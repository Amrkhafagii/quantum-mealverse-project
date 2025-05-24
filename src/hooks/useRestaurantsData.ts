
import { useOptimizedRestaurantsData } from './useOptimizedRestaurantsData';

// Re-export the optimized hook with the same interface for backward compatibility
export const useRestaurantsData = useOptimizedRestaurantsData;
export type { Restaurant } from './useOptimizedRestaurantsData';

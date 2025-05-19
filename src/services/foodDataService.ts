import { toast } from 'sonner';

/**
 * Interface for USDA Food API responses
 */
interface FoodDataCentralResponse {
  foods: FoodItem[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

export interface FoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  publishedDate: string;
  foodNutrients: FoodNutrient[];
  foodCategory?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  foodPortions?: FoodPortion[];
}

export interface FoodNutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  value: number;
  unitName: string;
}

export interface FoodPortion {
  gramWeight: number;
  amount: number;
  modifier: string;
  measureUnit: {
    name: string;
  };
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: number;
  servingSizeUnit?: string;
}

// Constants for nutrient IDs from USDA FoodData Central
const NUTRIENT_IDS = {
  CALORIES: 1008,     // Energy (kcal)
  PROTEIN: 1003,      // Protein (g)
  CARBS: 1005,        // Carbohydrates (g)
  FAT: 1004,          // Total fat (g)
  FIBER: 1079,        // Fiber (g)
  SUGAR: 2000,        // Total sugars (g)
  SODIUM: 1093,       // Sodium (mg)
};

// Cooking method conversion factors (approximate)
const COOKING_CONVERSION = {
  'raw_to_cooked': {
    'protein': {
      'baked': 0.75,     // Raw protein weight to baked
      'grilled': 0.7,    // Raw protein weight to grilled
      'boiled': 0.8,     // Raw protein weight to boiled
    },
    'vegetable': {
      'steamed': 0.9,    // Raw vegetable weight to steamed
      'boiled': 0.85,    // Raw vegetable weight to boiled
      'roasted': 0.7,    // Raw vegetable weight to roasted
    },
    'grain': {
      'boiled': 2.5,     // Dry grain weight to cooked/boiled
      'steamed': 2.3,    // Dry grain weight to steamed
    }
  },
  'cooked_to_raw': {
    'protein': {
      'baked': 1.3,      // Baked protein weight to raw
      'grilled': 1.4,    // Grilled protein weight to raw
      'boiled': 1.25,    // Boiled protein weight to raw
    },
    'vegetable': {
      'steamed': 1.1,    // Steamed vegetable weight to raw
      'boiled': 1.18,    // Boiled vegetable weight to raw
      'roasted': 1.4,    // Roasted vegetable weight to raw
    },
    'grain': {
      'boiled': 0.4,     // Cooked/boiled grain weight to dry
      'steamed': 0.43,   // Steamed grain weight to dry
    }
  }
};

// Cache configuration
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_KEY_PREFIX = 'usda_food_data_';

/**
 * Class for interacting with USDA FoodData Central API
 */
export class FoodDataService {
  private apiKey: string;
  private baseUrl: string;
  
  constructor(apiKey: string = 'sUnMwqstlLvfNJbpb36yh6icjAvydp2lcdIxYSqa') {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.nal.usda.gov/fdc/v1';
  }
  
  /**
   * Search for food items in the USDA database
   */
  async searchFood(query: string, pageSize: number = 10, pageNumber: number = 1): Promise<FoodItem[]> {
    const cacheKey = `${CACHE_KEY_PREFIX}search_${query.toLowerCase().replace(/\s+/g, '_')}_${pageSize}_${pageNumber}`;
    
    // Try to get from cache first
    const cachedResult = this.getFromCache<FoodItem[]>(cacheKey);
    if (cachedResult) {
      console.log('Retrieved food search results from cache:', query);
      return cachedResult;
    }
    
    try {
      const url = `${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&pageNumber=${pageNumber}&api_key=${this.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as FoodDataCentralResponse;
      
      // Cache the results
      if (data && data.foods) {
        this.saveToCache(cacheKey, data.foods);
        return data.foods;
      }
      
      return [];
    } catch (error) {
      console.error('Error searching USDA food data:', error);
      toast.error('Failed to search food data. Using backup data instead.');
      return this.getFallbackFoodData(query);
    }
  }
  
  /**
   * Get detailed information for a specific food by its FDC ID
   */
  async getFoodDetails(fdcId: number): Promise<FoodItem | null> {
    const cacheKey = `${CACHE_KEY_PREFIX}details_${fdcId}`;
    
    // Try to get from cache first
    const cachedResult = this.getFromCache<FoodItem>(cacheKey);
    if (cachedResult) {
      console.log('Retrieved food details from cache:', fdcId);
      return cachedResult;
    }
    
    try {
      const url = `${this.baseUrl}/food/${fdcId}?api_key=${this.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as FoodItem;
      
      // Cache the results
      if (data) {
        this.saveToCache(cacheKey, data);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting USDA food details:', error);
      toast.error('Failed to retrieve food details. Using estimated data.');
      return null;
    }
  }
  
  /**
   * Extract nutrition data from a USDA food item
   */
  extractNutritionData(foodItem: FoodItem): NutritionData {
    const nutrition: NutritionData = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    
    // Extract each nutrient value if available
    for (const nutrient of foodItem.foodNutrients) {
      switch (nutrient.nutrientId) {
        case NUTRIENT_IDS.CALORIES:
          nutrition.calories = nutrient.value;
          break;
        case NUTRIENT_IDS.PROTEIN:
          nutrition.protein = nutrient.value;
          break;
        case NUTRIENT_IDS.CARBS:
          nutrition.carbs = nutrient.value;
          break;
        case NUTRIENT_IDS.FAT:
          nutrition.fat = nutrient.value;
          break;
        case NUTRIENT_IDS.FIBER:
          nutrition.fiber = nutrient.value;
          break;
        case NUTRIENT_IDS.SUGAR:
          nutrition.sugar = nutrient.value;
          break;
        case NUTRIENT_IDS.SODIUM:
          nutrition.sodium = nutrient.value;
          break;
      }
    }
    
    // Add serving size information if available
    if (foodItem.servingSize) {
      nutrition.servingSize = foodItem.servingSize;
      nutrition.servingSizeUnit = foodItem.servingSizeUnit;
    }
    
    return nutrition;
  }
  
  /**
   * Convert between raw and cooked weights
   */
  convertWeight(weight: number, foodType: 'protein' | 'vegetable' | 'grain', 
                fromState: 'raw' | 'cooked', toState: 'raw' | 'cooked', 
                cookingMethod: 'baked' | 'grilled' | 'boiled' | 'steamed' | 'roasted'): number {
    
    if (fromState === toState) return weight; // No conversion needed
    
    const conversionKey = fromState === 'raw' ? 'raw_to_cooked' : 'cooked_to_raw';
    
    // Check if the conversion exists for this food type and cooking method
    if (COOKING_CONVERSION[conversionKey] && 
        COOKING_CONVERSION[conversionKey][foodType] && 
        COOKING_CONVERSION[conversionKey][foodType][cookingMethod]) {
      
      const factor = COOKING_CONVERSION[conversionKey][foodType][cookingMethod];
      return weight * factor;
    }
    
    // Default conversion factor if specific one not found (approximately 30% water loss)
    return fromState === 'raw' ? weight * 0.7 : weight * 1.3;
  }
  
  /**
   * Calculate water intake recommendation based on weight and activity level
   */
  calculateWaterIntake(weightKg: number, activityLevel: string): number {
    // Enhanced formula based on weight, activity level, and environmental factors
    let baseIntake = weightKg * 35; // Base: 35ml per kg of body weight
    
    // Adjust based on activity level with more precise calculations
    switch (activityLevel) {
      case 'sedentary':
        baseIntake *= 0.9; // Less active individuals need less hydration
        break;
      case 'lightly-active':
        baseIntake *= 1.0; // Default adjustment
        break;
      case 'moderately-active':
        baseIntake *= 1.1; // Moderate exercise increases fluid needs
        break;
      case 'very-active':
        baseIntake *= 1.25; // Intense activity requires significantly more hydration
        break;
      case 'extremely-active':
        baseIntake *= 1.4; // Athletes and very active individuals need even more
        break;
      default:
        // Default to moderate activity if not specified
        baseIntake *= 1.0;
    }
    
    // Environmental adjustment - this could be enhanced further with actual temperature data
    const currentDate = new Date();
    const month = currentDate.getMonth(); // 0-11
    
    // Rough seasonal adjustment (northern hemisphere assumption)
    if (month >= 4 && month <= 8) { // Summer months (May-September)
      baseIntake *= 1.1; // Increase water intake in warmer months
    } else if (month === 11 || month <= 1) { // Winter months (December-February)
      baseIntake *= 0.95; // Slightly decrease in colder months
    }
    
    // Round to nearest 10ml for easy measurement
    return Math.round(baseIntake / 10) * 10;
  }
  
  /**
   * Calculate how many 8oz glasses of water are needed
   */
  calculateWaterGlasses(waterIntakeML: number): number {
    const ML_PER_GLASS = 240; // 8oz = ~240ml
    return Math.ceil(waterIntakeML / ML_PER_GLASS); // Round up to ensure adequate hydration
  }
  
  /**
   * Adjust portion size to meet calorie target
   */
  adjustPortionForCalories(currentCalories: number, targetCalories: number, currentPortionGrams: number): number {
    if (currentCalories === 0) return currentPortionGrams; // Avoid division by zero
    const scaleFactor = targetCalories / currentCalories;
    return Math.round(currentPortionGrams * scaleFactor);
  }
  
  /**
   * Distribute macros across meals to match target distribution
   */
  distributeMacrosAcrossMeals(
    totalProtein: number, 
    totalCarbs: number, 
    totalFat: number, 
    mealDistribution: Array<{ name: string, protein: number, carbs: number, fat: number }>
  ): Array<{ name: string, targetProtein: number, targetCarbs: number, targetFat: number }> {
    
    return mealDistribution.map(meal => ({
      name: meal.name,
      targetProtein: Math.round(totalProtein * meal.protein),
      targetCarbs: Math.round(totalCarbs * meal.carbs),
      targetFat: Math.round(totalFat * meal.fat)
    }));
  }
  
  /**
   * Save data to local storage cache with expiry time
   */
  private saveToCache<T>(key: string, data: T): void {
    const cacheItem = {
      data,
      expiry: Date.now() + CACHE_EXPIRY
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to save to cache, localStorage might be full:', error);
      // Try to clear old cache entries
      this.clearExpiredCache();
    }
  }
  
  /**
   * Get data from local storage cache if not expired
   */
  private getFromCache<T>(key: string): T | null {
    try {
      const cacheItem = localStorage.getItem(key);
      
      if (!cacheItem) return null;
      
      const { data, expiry } = JSON.parse(cacheItem);
      
      // Check if cache has expired
      if (Date.now() > expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data as T;
    } catch (error) {
      console.warn('Error reading from cache:', error);
      return null;
    }
  }
  
  /**
   * Clear expired items from cache
   */
  clearExpiredCache(): void {
    try {
      const now = Date.now();
      
      // Find and remove expired cache items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          const cacheItem = localStorage.getItem(key);
          
          if (cacheItem) {
            const { expiry } = JSON.parse(cacheItem);
            
            if (now > expiry) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error clearing expired cache:', error);
    }
  }
  
  /**
   * Provide fallback data when API fails
   */
  private getFallbackFoodData(query: string): FoodItem[] {
    // Simplified fallback data for common foods
    const fallbackFoods: Record<string, any> = {
      'chicken': {
        fdcId: 9001,
        description: 'Chicken breast, raw',
        foodNutrients: [
          { nutrientId: NUTRIENT_IDS.CALORIES, nutrientName: 'Energy', value: 165, unitName: 'kcal' },
          { nutrientId: NUTRIENT_IDS.PROTEIN, nutrientName: 'Protein', value: 31, unitName: 'g' },
          { nutrientId: NUTRIENT_IDS.FAT, nutrientName: 'Total lipid (fat)', value: 3.6, unitName: 'g' },
          { nutrientId: NUTRIENT_IDS.CARBS, nutrientName: 'Carbohydrate, by difference', value: 0, unitName: 'g' }
        ]
      },
      'salmon': {
        fdcId: 9002,
        description: 'Salmon, raw',
        foodNutrients: [
          { nutrientId: NUTRIENT_IDS.CALORIES, nutrientName: 'Energy', value: 208, unitName: 'kcal' },
          { nutrientId: NUTRIENT_IDS.PROTEIN, nutrientName: 'Protein', value: 20, unitName: 'g' },
          { nutrientId: NUTRIENT_IDS.FAT, nutrientName: 'Total lipid (fat)', value: 13, unitName: 'g' },
          { nutrientId: NUTRIENT_IDS.CARBS, nutrientName: 'Carbohydrate, by difference', value: 0, unitName: 'g' }
        ]
      },
      'rice': {
        fdcId: 9003,
        description: 'Rice, white, long-grain, regular, raw',
        foodNutrients: [
          { nutrientId: NUTRIENT_IDS.CALORIES, nutrientName: 'Energy', value: 365, unitName: 'kcal' },
          { nutrientId: NUTRIENT_IDS.PROTEIN, nutrientName: 'Protein', value: 7.1, unitName: 'g' },
          { nutrientId: NUTRIENT_IDS.FAT, nutrientName: 'Total lipid (fat)', value: 0.7, unitName: 'g' },
          { nutrientId: NUTRIENT_IDS.CARBS, nutrientName: 'Carbohydrate, by difference', value: 80, unitName: 'g' }
        ]
      },
      'broccoli': {
        fdcId: 9004,
        description: 'Broccoli, raw',
        foodNutrients: [
          { nutrientId: NUTRIENT_IDS.CALORIES, nutrientName: 'Energy', value: 34, unitName: 'kcal' },
          { nutrientId: NUTRIENT_IDS.PROTEIN, nutrientName: 'Protein', value: 2.8, unitName: 'g' },
          { nutrientId: NUTRIENT_IDS.FAT, nutrientName: 'Total lipid (fat)', value: 0.4, unitName: 'g' },
          { nutrientId: NUTRIENT_IDS.CARBS, nutrientName: 'Carbohydrate, by difference', value: 6.6, unitName: 'g' },
          { nutrientId: NUTRIENT_IDS.FIBER, nutrientName: 'Fiber, total dietary', value: 2.6, unitName: 'g' }
        ]
      }
    };
    
    // Find best match in our fallback data
    const normalizedQuery = query.toLowerCase();
    let bestMatch: string | null = null;
    
    for (const food in fallbackFoods) {
      if (normalizedQuery.includes(food)) {
        bestMatch = food;
        break;
      }
    }
    
    if (bestMatch) {
      const foodItem = fallbackFoods[bestMatch];
      return [foodItem as FoodItem];
    }
    
    // Return empty if no match found
    return [];
  }
}

// Export singleton instance
export const foodDataService = new FoodDataService();

// Export utility functions
export const calculateWaterIntake = (weight: number, activityLevel: string): number => {
  return foodDataService.calculateWaterIntake(weight, activityLevel);
};

export const convertFoodWeight = (
  weight: number, 
  foodType: 'protein' | 'vegetable' | 'grain',
  fromState: 'raw' | 'cooked', 
  toState: 'raw' | 'cooked',
  cookingMethod: 'baked' | 'grilled' | 'boiled' | 'steamed' | 'roasted'
): number => {
  return foodDataService.convertWeight(weight, foodType, fromState, toState, cookingMethod);
};

export const adjustPortionSize = (currentCalories: number, targetCalories: number, currentPortionGrams: number): number => {
  return foodDataService.adjustPortionForCalories(currentCalories, targetCalories, currentPortionGrams);
};

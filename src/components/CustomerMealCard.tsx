
import React, { useState, useEffect } from 'react';
import { MealType } from '@/types/meal';
import { motion } from 'framer-motion';
import { StarRating } from './reviews/StarRating';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, ShoppingCart, Leaf, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { supabase } from '@/integrations/supabase/client';
import { convertMealToCartItemWithAssignment } from '@/services/mealPlan/mealToCartServiceWithAssignment';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import SustainabilityBadge from './sustainability/SustainabilityBadge';
import { Meal, MealFood } from '@/types/food';

interface GlobalMealRating {
  avg_rating: number;
  review_count: number;
}

export const CustomerMealCard = ({ meal }: { meal: MealType }) => {
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { displayPrice } = useCurrencyConverter();

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const { data: globalRating, error } = await supabase
          .from('global_meal_ratings')
          .select('avg_rating,review_count')
          .eq('meal_id', meal.id)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching rating:', error);
          return;
        }
        
        if (globalRating) {
          setAvgRating((globalRating as GlobalMealRating).avg_rating);
          setReviewCount((globalRating as GlobalMealRating).review_count);
        } else {
          const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select('rating')
            .eq('meal_id', meal.id)
            .eq('status', 'approved');
            
          if (reviewsError) {
            console.error('Error fetching reviews:', reviewsError);
            return;
          }
          
          if (reviews && reviews.length > 0) {
            const sum = reviews.reduce((acc, review: any) => acc + review.rating, 0);
            setAvgRating(sum / reviews.length);
            setReviewCount(reviews.length);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (meal.id) {
      fetchRating();
    }
  }, [meal.id]);

  // Convert MealType to Meal format for restaurant assignment
  const convertToMealFormat = (mealType: MealType): Meal => {
    // Create a basic meal structure for restaurant assignment
    const mealFoods: MealFood[] = [
      {
        food: {
          id: mealType.id,
          name: mealType.name,
          calories: mealType.calories || 0,
          protein: mealType.protein || 0,
          carbs: mealType.carbs || 0,
          fat: mealType.fat || 0,
          category: 'prepared_meal',
          cookingState: 'cooked'
        },
        portionSize: 100 // Base portion for prepared meals
      }
    ];

    return {
      id: mealType.id,
      name: mealType.name,
      description: mealType.description || '',
      foods: mealFoods,
      totalCalories: mealType.calories || 0,
      totalProtein: mealType.protein || 0,
      totalCarbs: mealType.carbs || 0,
      totalFat: mealType.fat || 0
    };
  };

  // Separate click handler for card navigation
  const handleCardClick = () => {
    navigate(`/meal/${meal.id}`);
  };

  // Add to cart handler with restaurant assignment
  const handleAddToCart = async (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!user?.id) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to cart",
        variant: "destructive"
      });
      return;
    }

    setIsAddingToCart(true);
    
    try {
      console.log("Adding meal to cart with restaurant assignment:", meal.name, "quantity:", quantity);
      
      // Convert meal to proper format
      const mealForAssignment = convertToMealFormat(meal);
      
      // Use restaurant assignment service
      const cartItems = await convertMealToCartItemWithAssignment(
        mealForAssignment,
        user.id,
        {
          strategy: 'cheapest',
          prefer_single_restaurant: true
        }
      );

      // Add each cart item (there may be multiple if split across restaurants)
      for (const cartItem of cartItems) {
        // Update quantity for each cart item
        const itemWithQuantity = {
          ...cartItem,
          quantity: quantity
        };
        
        await addItem(itemWithQuantity);
      }

      toast({
        title: "Item Added",
        description: `${meal.name} added to cart with restaurant assignment`,
        variant: "default"
      });
      
      // Reset quantity after adding
      setQuantity(1);
      
    } catch (error) {
      console.error('Error adding meal to cart:', error);
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : "No restaurants available for this item",
        variant: "destructive"
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Quantity change handler with stronger event stopping
  const handleQuantityChange = (action: 'increase' | 'decrease') => (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Calculate sustainability metrics based on meal properties (mock data for now)
  const getSustainabilityMetrics = () => {
    // In a real app, these would be real metrics fetched from the backend
    // For now we're generating them based on the meal ID for demonstration
    const mealIdSum = meal.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 100;
    
    const metrics = [];
    
    if (mealIdSum > 50) {
      metrics.push({
        type: 'carbon' as const,
        value: 60 + (mealIdSum % 30), // 60-90% lower carbon footprint
        label: 'Carbon Footprint'
      });
    }
    
    if (mealIdSum % 3 === 0) {
      metrics.push({
        type: 'local' as const,
        value: 100,
        label: 'Locally Sourced'
      });
    }
    
    if (mealIdSum % 4 === 0) {
      metrics.push({
        type: 'organic' as const,
        value: 100,
        label: 'Organic Ingredients'
      });
    }
    
    return metrics;
  };

  const sustainabilityMetrics = getSustainabilityMetrics();

  return (
    <Card className="relative overflow-hidden bg-quantum-black border-quantum-cyan/20 group hover:border-quantum-cyan/40 transition-all duration-300">
      <motion.div 
        className="w-full h-48 relative overflow-hidden cursor-pointer"
        onClick={handleCardClick}
      >
        <img
          src={meal.image_url}
          alt={meal.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://picsum.photos/seed/${meal.id}/300/200`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-quantum-black/80 to-transparent" />
        
        {/* Badges for dietary tags */}
        {meal.dietary_tags && meal.dietary_tags.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {meal.dietary_tags.map(tag => (
              <span key={tag} className="bg-quantum-darkBlue/80 text-white text-xs px-1.5 py-0.5 rounded backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Sustainability badges */}
        {sustainabilityMetrics.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-wrap gap-1">
            {sustainabilityMetrics.map((metric, idx) => (
              <SustainabilityBadge key={idx} metric={metric} size="sm" />
            ))}
          </div>
        )}
      </motion.div>

      <CardContent className="p-4 space-y-3">
        <div 
          className="cursor-pointer space-y-2"
          onClick={handleCardClick}
        >
          <h3 className="text-xl font-semibold text-white hover:text-quantum-cyan transition-colors">
            {meal.name}
          </h3>
          
          <div className="flex items-center gap-2">
            {!loading && avgRating !== null && (
              <>
                <StarRating rating={avgRating} size="sm" showNumber />
                <span className="text-xs text-gray-400">({reviewCount})</span>
              </>
            )}
          </div>

          <p className="text-sm text-gray-300 line-clamp-2">{meal.description}</p>
        </div>

        <div className="flex items-center justify-between pt-2 relative z-10">
          <span className="text-lg font-semibold text-quantum-cyan">
            {displayPrice(meal.price)}
          </span>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-quantum-darkBlue rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-quantum-cyan hover:text-white hover:bg-quantum-cyan/20"
                onClick={handleQuantityChange('decrease')}
                type="button"
                disabled={isAddingToCart}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="w-8 text-center text-white">{quantity}</span>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-quantum-cyan hover:text-white hover:bg-quantum-cyan/20"
                onClick={handleQuantityChange('increase')}
                type="button"
                disabled={isAddingToCart}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={handleAddToCart}
              className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black relative z-20"
              type="button"
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <>
                  <MapPin className="h-4 w-4 mr-1 animate-pulse" />
                  Assigning...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


import React, { useState, useEffect } from 'react';
import { MealType } from '@/types/meal';
import { motion } from 'framer-motion';
import { StarRating } from './reviews/StarRating';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { supabase } from '@/integrations/supabase/client';

interface GlobalMealRating {
  avg_rating: number;
  review_count: number;
}

export const CustomerMealCard = ({ meal }: { meal: MealType }) => {
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
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

  const handleAddToCart = (e: React.MouseEvent) => {
    // Make sure to both preventDefault and stopPropagation
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Add to cart clicked for meal:", meal.name);
    addItem({
      ...meal,
      quantity: quantity
    });
    setQuantity(1);
  };

  const navigateToMealDetails = () => {
    navigate(`/meal/${meal.id}`);
  };

  const handleQuantityChange = (action: 'increase' | 'decrease') => (e: React.MouseEvent) => {
    // Make sure to both preventDefault and stopPropagation
    e.preventDefault();
    e.stopPropagation();
    
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <Card className="relative overflow-hidden bg-quantum-black border-quantum-cyan/20 group hover:border-quantum-cyan/40 transition-all duration-300">
      <motion.div 
        className="w-full h-48 relative overflow-hidden cursor-pointer"
        onClick={navigateToMealDetails}
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
      </motion.div>

      <CardContent className="p-4 space-y-3">
        <div 
          className="cursor-pointer space-y-2"
          onClick={navigateToMealDetails}
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
                onMouseDown={e => e.stopPropagation()}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="w-8 text-center text-white">{quantity}</span>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-quantum-cyan hover:text-white hover:bg-quantum-cyan/20"
                onClick={handleQuantityChange('increase')}
                onMouseDown={e => e.stopPropagation()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={handleAddToCart}
              className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black relative z-20"
              onMouseDown={e => e.stopPropagation()}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

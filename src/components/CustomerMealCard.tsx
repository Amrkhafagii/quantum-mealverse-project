
import React, { useState, useEffect } from 'react';
import { MealType } from '@/types/meal';
import { motion } from 'framer-motion';
import { StarRating } from './reviews/StarRating';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    // Stop event propagation to prevent navigation when clicking the Add to Cart button
    e.stopPropagation();
    
    addItem({
      ...meal,
      quantity: quantity
    });
    toast.success(`${meal.name} added to cart!`);
  };

  const navigateToMealDetails = () => {
    navigate(`/meals/${meal.id}`);
  };

  const increaseQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <motion.div 
      className="bg-quantum-black rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div 
        className="relative overflow-hidden rounded-t-lg cursor-pointer"
        onClick={navigateToMealDetails}
      >
        <img
          src={meal.image_url}
          alt={meal.name}
          className="w-full h-48 object-cover transform hover:scale-110 transition-transform duration-300"
        />
      </div>
      
      <div className="p-5 font-light">
        <div className="flex justify-between items-start">
          <h3 
            className="text-xl font-semibold text-white mb-2 neon-text cursor-pointer" 
            onClick={navigateToMealDetails}
          >
            {meal.name}
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-quantum-cyan hover:text-white"
            onClick={navigateToMealDetails}
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center mb-2">
          {!loading && avgRating !== null && (
            <>
              <StarRating rating={avgRating} size="sm" showNumber />
              <span className="ml-2 text-xs text-gray-400">
                ({reviewCount})
              </span>
            </>
          )}
          {!loading && avgRating === null && (
            <span className="text-xs text-gray-400">No reviews yet</span>
          )}
        </div>
        
        <p className="text-gray-300 mb-4 cursor-pointer" onClick={navigateToMealDetails}>{meal.description}</p>
        
        <div className="mt-4 flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-quantum-cyan font-medium">${meal.price.toFixed(2)}</span>
            
            <div className="flex items-center space-x-1">
              <button 
                className="bg-quantum-darkBlue text-quantum-cyan p-1 rounded-full hover:bg-quantum-cyan hover:text-quantum-black transition-colors"
                onClick={decreaseQuantity}
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <span className="w-8 text-center">{quantity}</span>
              
              <button 
                className="bg-quantum-darkBlue text-quantum-cyan p-1 rounded-full hover:bg-quantum-cyan hover:text-quantum-black transition-colors"
                onClick={increaseQuantity}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <button 
            className="bg-quantum-cyan text-quantum-black py-2 px-4 rounded-full hover:bg-cyan-600 transition-colors duration-300 w-full"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

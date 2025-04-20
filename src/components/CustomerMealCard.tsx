import React, { useState, useEffect } from 'react';
import { MealType } from '@/types/meal';
import { motion } from 'framer-motion';
import { StarRating } from './reviews/StarRating';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/types/database';

export const CustomerMealCard = ({ meal }: { meal: MealType }) => {
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const { data: globalRating, error } = await supabase
          .from<'global_meal_ratings', Tables['global_meal_ratings']['Row']>('global_meal_ratings')
          .select('avg_rating,review_count')
          .eq('meal_id', meal.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching rating:', error);
          return;
        }
        
        if (globalRating) {
          setAvgRating(globalRating.avg_rating);
          setReviewCount(globalRating.review_count);
        } else {
          const { data: reviews, error: reviewsError } = await supabase
            .from<'reviews', Tables['reviews']['Row']>('reviews')
            .select('rating')
            .eq('meal_id', meal.id)
            .eq('status', 'approved');
            
          if (reviewsError) {
            console.error('Error fetching reviews:', reviewsError);
            return;
          }
          
          if (reviews && reviews.length > 0) {
            const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
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

  return (
    <motion.div 
      className="bg-quantum-black rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={meal.image_url}
          alt={meal.name}
          className="w-full h-48 object-cover transform hover:scale-110 transition-transform duration-300"
        />
      </div>
      
      <div className="p-5 font-light">
        <h3 className="text-xl font-semibold text-white mb-2 neon-text">{meal.name}</h3>
        
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
        
        <p className="text-gray-300 mb-4">{meal.description}</p>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-quantum-cyan font-medium">${meal.price.toFixed(2)}</span>
          
          <button 
            className="bg-quantum-cyan text-quantum-black py-2 px-4 rounded-full hover:bg-cyan-600 transition-colors duration-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

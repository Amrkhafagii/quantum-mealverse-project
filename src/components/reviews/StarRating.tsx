
import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  interactive = false,
  onRatingChange,
  className
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const starSize = sizes[size];
  
  const handleClick = (selectedRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    const activeRating = hoverRating > 0 ? hoverRating : rating;
    
    for (let i = 1; i <= maxRating; i++) {
      const difference = activeRating - i + 1;
      
      if (difference >= 1) {
        stars.push(
          <Star 
            key={i}
            className={cn(starSize, "fill-yellow-400 text-yellow-400")}
            onClick={() => handleClick(i)}
            onMouseEnter={() => interactive && setHoverRating(i)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          />
        );
      } else if (difference > 0 && difference < 1) {
        stars.push(
          <StarHalf 
            key={i}
            className={cn(starSize, "fill-yellow-400 text-yellow-400")}
            onClick={() => handleClick(i)}
            onMouseEnter={() => interactive && setHoverRating(i)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          />
        );
      } else {
        stars.push(
          <Star 
            key={i}
            className={cn(starSize, "text-gray-300")}
            onClick={() => handleClick(i)}
            onMouseEnter={() => interactive && setHoverRating(i)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          />
        );
      }
    }
    
    return stars;
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {renderStars()}
      {showNumber && (
        <span className="ml-1 text-sm font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};


import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export interface StarRatingProps {
  rating?: number;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (rating: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  readOnly = false,
  size = 'md',
  onChange,
  className = '',
}) => {
  const handleStarClick = (selectedRating: number) => {
    if (readOnly) return;
    onChange?.(selectedRating);
  };

  // Size mapping
  const sizeMap = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Convert to array of 5 stars
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      // Full star
      if (i < Math.floor(rating)) {
        return (
          <Star
            key={i}
            className={`${sizeMap[size]} fill-yellow-400 text-yellow-400`}
            onClick={() => handleStarClick(i + 1)}
          />
        );
      } 
      // Half star
      else if (i < Math.ceil(rating) && !Number.isInteger(rating)) {
        return (
          <StarHalf
            key={i}
            className={`${sizeMap[size]} fill-yellow-400 text-yellow-400`}
            onClick={() => handleStarClick(i + 1)}
          />
        );
      } 
      // Empty star
      else {
        return (
          <Star
            key={i}
            className={`${sizeMap[size]} text-gray-400`}
            onClick={() => handleStarClick(i + 1)}
          />
        );
      }
    });
  };

  return (
    <div className={`flex items-center ${className} ${!readOnly ? 'cursor-pointer' : ''}`}>
      {renderStars()}
    </div>
  );
};

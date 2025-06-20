
import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export interface StarRatingProps {
  rating?: number;
  value?: number; // Added value prop as alternative to rating
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (rating: number) => void;
  className?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showNumber?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  value, // Added value prop
  readOnly = false,
  size = 'md',
  onChange,
  onRatingChange,
  className = '',
  interactive = false,
  showNumber = false,
}) => {
  // Use value prop if provided, otherwise use rating
  const actualRating = value !== undefined ? value : rating;
  
  const handleStarClick = (selectedRating: number) => {
    if (readOnly) return;
    
    if (onChange) {
      onChange(selectedRating);
    }
    
    if (onRatingChange) {
      onRatingChange(selectedRating);
    }
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
      if (i < Math.floor(actualRating)) {
        return (
          <Star
            key={i}
            className={`${sizeMap[size]} fill-yellow-400 text-yellow-400`}
            onClick={() => handleStarClick(i + 1)}
          />
        );
      } 
      // Half star
      else if (i < Math.ceil(actualRating) && !Number.isInteger(actualRating)) {
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
    <div className={`flex items-center ${className} ${(!readOnly || interactive) ? 'cursor-pointer' : ''}`}>
      {renderStars()}
      {showNumber && (
        <span className="ml-2 text-sm font-medium">
          {actualRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

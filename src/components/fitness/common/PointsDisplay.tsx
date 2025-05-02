
import React from 'react';
import { Award, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface PointsDisplayProps {
  points: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ 
  points, 
  className = '',
  size = 'medium',
  showIcon = true
}) => {
  // Define styles based on size
  const sizeClasses = {
    small: 'text-sm py-1 px-2',
    medium: 'text-base py-1.5 px-3',
    large: 'text-lg py-2 px-4'
  };
  
  const iconSizeClasses = {
    small: 'h-3.5 w-3.5',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-r from-quantum-cyan/20 to-quantum-purple/20 
                  rounded-full backdrop-blur-sm border border-quantum-cyan/30 
                  inline-flex items-center ${sizeClasses[size]} ${className}`}
    >
      {showIcon && (
        <Trophy className={`${iconSizeClasses[size]} text-yellow-400 mr-1.5`} />
      )}
      <span className="font-semibold">{points} pts</span>
    </motion.div>
  );
};

export default PointsDisplay;

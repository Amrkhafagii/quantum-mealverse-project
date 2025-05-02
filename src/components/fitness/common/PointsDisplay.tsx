
import React from 'react';
import { Trophy, Award } from 'lucide-react';

interface PointsDisplayProps {
  points: number;
  level?: number;
  className?: string;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ 
  points = 0, 
  level = 1, 
  className = '' 
}) => {
  // Calculate level if not provided based on points
  const calculatedLevel = level || Math.floor(Math.sqrt(points / 100)) + 1;
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 p-1 rounded-full mr-3">
        <Trophy className="h-6 w-6 text-white" />
      </div>
      <div>
        <div className="flex items-center">
          <span className="font-bold text-lg">{points}</span>
          <span className="text-gray-400 text-xs ml-1">pts</span>
        </div>
        <div className="flex items-center text-xs text-gray-400">
          <Award className="h-3 w-3 mr-1 text-purple-400" />
          Level {calculatedLevel}
        </div>
      </div>
    </div>
  );
};

export default PointsDisplay;

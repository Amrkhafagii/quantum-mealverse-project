
import React from 'react';
import { Star, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PointsDisplayProps {
  points: number;
  level: number;
  nextLevelPoints: number;
  className?: string;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ points, level, nextLevelPoints, className = '' }) => {
  // Calculate progress percentage to next level
  const progressPercent = Math.min(100, (points / nextLevelPoints) * 100);
  const pointsNeeded = nextLevelPoints - points;
  
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <Badge className="bg-quantum-purple mr-2">
            <Award className="h-3 w-3 mr-1" /> Level {level}
          </Badge>
          <Badge className="bg-yellow-600">
            <Star className="h-3 w-3 mr-1" fill="currentColor" /> {points} pts
          </Badge>
        </div>
      </div>
      
      <div className="mb-1 mt-2">
        <Progress value={progressPercent} className="h-2" />
      </div>
      
      <div className="text-xs text-gray-400">
        {pointsNeeded > 0 
          ? `${pointsNeeded} more points to reach Level ${level + 1}`
          : "Ready to level up!"}
      </div>
    </div>
  );
};

export default PointsDisplay;

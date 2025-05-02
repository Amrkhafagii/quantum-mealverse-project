
import React from 'react';
import { Droplets } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';

interface WaterIntakeTrackerProps {
  currentIntake?: number;
  targetIntake: number;
}

const WaterIntakeTracker: React.FC<WaterIntakeTrackerProps> = ({
  currentIntake = 0,
  targetIntake
}) => {
  const percentage = Math.min(100, Math.round((currentIntake / targetIntake) * 100));
  
  return (
    <div className="bg-blue-900/20 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="text-blue-400 font-medium flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          Daily Water Intake
        </div>
        <span className="text-sm font-medium">
          {currentIntake} <span className="text-gray-500 text-xs">/ {targetIntake} ml</span>
        </span>
      </div>
      
      <div className="relative h-12 bg-blue-950/50 rounded-full overflow-hidden mb-2">
        <div 
          className={cn(
            "absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-700 ease-in-out",
          )}
          style={{ height: `${percentage}%` }}
        >
          {/* Water waves effect */}
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-300/20 rounded-full animate-pulse"></div>
        </div>
        
        {/* Water droplet icon that moves with the level */}
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 text-blue-200"
          style={{ bottom: `calc(${percentage}% - 10px)` }}
        >
          <Droplets className="h-5 w-5" />
        </div>
      </div>
      
      <div className="text-center text-sm text-blue-300 mt-2">
        {percentage >= 100 ? 
          "Daily goal achieved! 🎉" : 
          `${percentage}% of daily goal`
        }
      </div>
    </div>
  );
};

export default WaterIntakeTracker;

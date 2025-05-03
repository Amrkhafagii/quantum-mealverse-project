
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface MacroProgressBarProps {
  title: string;
  currentValue: number;
  targetValue: number;
  colorClass: string;
  bgColorClass?: string;
  isCritical?: boolean;
}

const MacroProgressBar: React.FC<MacroProgressBarProps> = ({
  title,
  currentValue,
  targetValue,
  colorClass,
  bgColorClass = 'bg-gray-800',
  isCritical = false
}) => {
  const percentage = Math.min(100, Math.round((currentValue / targetValue) * 100));
  
  // Determine status color
  let statusColor = colorClass;
  if (isCritical) {
    if (percentage < 80) statusColor = 'text-red-400';
    else if (percentage < 95) statusColor = 'text-amber-400';
  }
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <div className={`font-medium ${statusColor}`}>{title}</div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-sm font-medium flex gap-1">
                <span>{currentValue}g</span>
                <span className="text-gray-400">/ {targetValue}g</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>You've reached {percentage}% of your daily {title.toLowerCase()} target</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className={`h-1.5 w-full ${bgColorClass} rounded-full overflow-hidden`}>
        <div 
          className={`h-full ${colorClass.replace('text-', 'bg-')} rounded-full transition-all duration-500 ease-in-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default MacroProgressBar;
